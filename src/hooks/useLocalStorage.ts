import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const { storage } = useAppSettings();

  const [storedValue, setStoredValue] = useState<T>(() => storage.ensureItem<T>(key, initialValue));

  useEffect(() => {
    return storage.subscribe<T>(key, (value) => {
      setStoredValue(value);
    });
  }, [key, storage]);

  useEffect(() => {
    storage.ensureItem<T>(key, initialValue);
  }, [initialValue, key, storage]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (value) => {
      setStoredValue((current) => {
        const nextValue = value instanceof Function ? value(current) : value;
        storage.setItem<T>(key, nextValue);
        return nextValue;
      });
    },
    [key, storage]
  );

  return [storedValue, setValue];
}
