import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const SETTINGS_STORAGE_KEY = 'app-settings-v1';

export type AppSettings = {
  persistenceEnabled: boolean;
  defaultDiscountRate: number;
};

const defaultSettings: AppSettings = {
  persistenceEnabled: true,
  defaultDiscountRate: 10,
};

type StorageListener = (value: unknown) => void;

type StorageAPI = {
  ensureItem: <T,>(key: string, initialValue: T) => T;
  setItem: <T,>(key: string, value: T) => void;
  subscribe: <T,>(key: string, listener: (value: T) => void) => () => void;
  resetAll: () => void;
  getSnapshot: () => Record<string, unknown>;
  replaceSnapshot: (data: Record<string, unknown>) => void;
};

type SnapshotPayload = {
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  data: Record<string, unknown>;
};

type ImportResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

type AppSettingsContextValue = {
  settings: AppSettings;
  setPersistenceEnabled: (enabled: boolean) => void;
  updateDefaultDiscountRate: (rate: number) => void;
  storage: StorageAPI;
  clearAllData: () => void;
  exportSnapshot: () => string;
  importSnapshot: (raw: string) => ImportResult;
};

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') {
      return defaultSettings;
    }

    try {
      const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        return defaultSettings;
      }

      const parsed = JSON.parse(stored) as Partial<AppSettings>;

      return {
        persistenceEnabled:
          typeof parsed.persistenceEnabled === 'boolean' ? parsed.persistenceEnabled : defaultSettings.persistenceEnabled,
        defaultDiscountRate:
          typeof parsed.defaultDiscountRate === 'number' && Number.isFinite(parsed.defaultDiscountRate)
            ? parsed.defaultDiscountRate
            : defaultSettings.defaultDiscountRate,
      };
    } catch (error) {
      console.warn('AppSettingsProvider: failed to read settings from storage', error);
      return defaultSettings;
    }
  });

  const recordsRef = useRef<Map<string, string>>(new Map());
  const defaultsRef = useRef<Map<string, string>>(new Map());
  const listenersRef = useRef<Map<string, Set<StorageListener>>>(new Map());
  const persistenceEnabledRef = useRef<boolean>(settings.persistenceEnabled);

  useEffect(() => {
    persistenceEnabledRef.current = settings.persistenceEnabled;
  }, [settings.persistenceEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('AppSettingsProvider: failed to persist settings', error);
    }
  }, [settings]);

  const notifyListeners = useCallback((key: string, serializedValue: string) => {
    const listeners = listenersRef.current.get(key);
    if (!listeners || listeners.size === 0) {
      return;
    }

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(serializedValue);
    } catch (error) {
      console.warn(`AppSettingsProvider: failed to parse value for key "${key}"`, error);
      return;
    }

    listeners.forEach((listener) => {
      listener(parsedValue);
    });
  }, []);

  const syncRecordsToLocalStorage = useCallback((enabled: boolean) => {
    if (typeof window === 'undefined') {
      return;
    }

    recordsRef.current.forEach((value, key) => {
      if (key === SETTINGS_STORAGE_KEY) {
        return;
      }

      if (enabled) {
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.removeItem(key);
      }
    });
  }, []);

  const ensureItem = useCallback<StorageAPI['ensureItem']>(
    (key, initialValue) => {
      const serializedDefault = JSON.stringify(initialValue);
      defaultsRef.current.set(key, serializedDefault);

      if (recordsRef.current.has(key)) {
        try {
          return JSON.parse(recordsRef.current.get(key) ?? serializedDefault);
        } catch (error) {
          console.warn(`AppSettingsProvider: failed to parse cached value for key "${key}"`, error);
          recordsRef.current.set(key, serializedDefault);
          return initialValue;
        }
      }

      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem(key);
        if (stored !== null) {
          recordsRef.current.set(key, stored);
          try {
            return JSON.parse(stored);
          } catch (error) {
            console.warn(`AppSettingsProvider: failed to parse stored value for key "${key}"`, error);
            recordsRef.current.set(key, serializedDefault);
          }
        }
      }

      recordsRef.current.set(key, serializedDefault);

      if (typeof window !== 'undefined' && persistenceEnabledRef.current) {
        window.localStorage.setItem(key, serializedDefault);
      }

      return initialValue;
    },
    []
  );

  const setItem = useCallback<StorageAPI['setItem']>((key, value) => {
    const serialized = JSON.stringify(value);
    recordsRef.current.set(key, serialized);

    if (typeof window !== 'undefined') {
      if (persistenceEnabledRef.current && key !== SETTINGS_STORAGE_KEY) {
        window.localStorage.setItem(key, serialized);
      } else if (key !== SETTINGS_STORAGE_KEY) {
        window.localStorage.removeItem(key);
      }
    }

    notifyListeners(key, serialized);
  }, [notifyListeners]);

  const subscribe = useCallback<StorageAPI['subscribe']>((key, listener) => {
    let listeners = listenersRef.current.get(key);
    if (!listeners) {
      listeners = new Set();
      listenersRef.current.set(key, listeners);
    }
    listeners.add(listener as StorageListener);

    return () => {
      const currentListeners = listenersRef.current.get(key);
      if (!currentListeners) {
        return;
      }
      currentListeners.delete(listener as StorageListener);
      if (currentListeners.size === 0) {
        listenersRef.current.delete(key);
      }
    };
  }, []);

  const resetAll = useCallback<StorageAPI['resetAll']>(() => {
    defaultsRef.current.forEach((serializedDefault, key) => {
      if (key === SETTINGS_STORAGE_KEY) {
        return;
      }

      recordsRef.current.set(key, serializedDefault);
      if (typeof window !== 'undefined') {
        if (persistenceEnabledRef.current) {
          window.localStorage.setItem(key, serializedDefault);
        } else {
          window.localStorage.removeItem(key);
        }
      }
      notifyListeners(key, serializedDefault);
    });
  }, [notifyListeners]);

  const getSnapshot = useCallback<StorageAPI['getSnapshot']>(() => {
    const snapshot: Record<string, unknown> = {};

    recordsRef.current.forEach((value, key) => {
      if (key === SETTINGS_STORAGE_KEY) {
        return;
      }

      try {
        snapshot[key] = JSON.parse(value);
      } catch (error) {
        console.warn(`AppSettingsProvider: failed to parse snapshot value for key "${key}"`, error);
      }
    });

    return snapshot;
  }, []);

  const replaceSnapshot = useCallback<StorageAPI['replaceSnapshot']>(
    (data) => {
      const seen = new Set<string>();

      Object.entries(data).forEach(([key, value]) => {
        if (key === SETTINGS_STORAGE_KEY) {
          return;
        }

        const serialized = JSON.stringify(value);
        recordsRef.current.set(key, serialized);
        if (!defaultsRef.current.has(key)) {
          defaultsRef.current.set(key, JSON.stringify(null));
        }
        seen.add(key);
        notifyListeners(key, serialized);
      });

      defaultsRef.current.forEach((serializedDefault, key) => {
        if (key === SETTINGS_STORAGE_KEY) {
          return;
        }

        if (seen.has(key)) {
          return;
        }
        recordsRef.current.set(key, serializedDefault);
        notifyListeners(key, serializedDefault);
      });

      syncRecordsToLocalStorage(persistenceEnabledRef.current);
    },
    [notifyListeners, syncRecordsToLocalStorage]
  );

  const storage = useMemo<StorageAPI>(
    () => ({
      ensureItem,
      setItem,
      subscribe,
      resetAll,
      getSnapshot,
      replaceSnapshot,
    }),
    [ensureItem, getSnapshot, replaceSnapshot, resetAll, setItem, subscribe]
  );

  useEffect(() => {
    syncRecordsToLocalStorage(settings.persistenceEnabled);
  }, [settings.persistenceEnabled, syncRecordsToLocalStorage]);

  const setPersistenceEnabled = useCallback<AppSettingsContextValue['setPersistenceEnabled']>((enabled) => {
    setSettings((current) => ({
      ...current,
      persistenceEnabled: enabled,
    }));
  }, []);

  const updateDefaultDiscountRate = useCallback<AppSettingsContextValue['updateDefaultDiscountRate']>((rate) => {
    setSettings((current) => {
      if (Number.isFinite(rate)) {
        const normalized = Math.max(0, Math.min(rate, 100));
        return {
          ...current,
          defaultDiscountRate: normalized,
        };
      }
      return current;
    });
  }, []);

  const clearAllData = useCallback(() => {
    storage.resetAll();
  }, [storage]);

  const exportSnapshot = useCallback(() => {
    const payload: SnapshotPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      data: storage.getSnapshot(),
    };
    return JSON.stringify(payload, null, 2);
  }, [settings, storage]);

  const importSnapshot = useCallback<AppSettingsContextValue['importSnapshot']>(
    (raw) => {
      try {
        const parsed = JSON.parse(raw);
        if (!isObject(parsed)) {
          return { success: false, message: 'Snapshot must be a JSON object.' };
        }

        if (parsed.version !== 1) {
          return { success: false, message: 'Unsupported snapshot version.' };
        }

        if (isObject(parsed.settings)) {
          const nextSettings: AppSettings = {
            persistenceEnabled:
              typeof parsed.settings.persistenceEnabled === 'boolean'
                ? parsed.settings.persistenceEnabled
                : defaultSettings.persistenceEnabled,
            defaultDiscountRate:
              typeof parsed.settings.defaultDiscountRate === 'number' && Number.isFinite(parsed.settings.defaultDiscountRate)
                ? parsed.settings.defaultDiscountRate
                : defaultSettings.defaultDiscountRate,
          };
          setSettings(nextSettings);
        }

        if (isObject(parsed.data)) {
          storage.replaceSnapshot(parsed.data);
        }

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid snapshot format.';
        return { success: false, message };
      }
    },
    [storage]
  );

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,
      setPersistenceEnabled,
      updateDefaultDiscountRate,
      storage,
      clearAllData,
      exportSnapshot,
      importSnapshot,
    }),
    [clearAllData, exportSnapshot, importSnapshot, settings, setPersistenceEnabled, storage, updateDefaultDiscountRate]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
