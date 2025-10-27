'use client';

import { useEffect, useState } from 'react';

type SetValueAction<T> = T | ((previous: T) => T);

function resolveAction<T>(action: SetValueAction<T>, previous: T): T {
  return typeof action === 'function' ? (action as (previous: T) => T)(previous) : action;
}

export function useLocalStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<SetValueAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      } else {
        setValue(defaultValue);
      }
    } catch (error) {
      console.warn(`Unable to read localStorage key "${key}":`, error);
      setValue(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Unable to persist localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const updateValue: React.Dispatch<SetValueAction<T>> = (action) => {
    setValue((previous) => resolveAction(action, previous));
  };

  return [value, updateValue];
}
