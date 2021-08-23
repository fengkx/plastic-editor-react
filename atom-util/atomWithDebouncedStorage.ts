import type { PrimitiveAtom, SetStateAction, WritableAtom } from "jotai";
import { atom } from "jotai";
import _debounce from "lodash.debounce";

export type Unsubscribe = () => void;

export type Storage<Value> = {
  getItem: (key: string) => Value | Promise<Value>;
  setItem: (key: string, newValue: Value) => void | Promise<void>;
  delayInit?: boolean;
  subscribe?: (key: string, callback: (value: Value) => void) => Unsubscribe;
};

export type SimpleStorage<Value> = {
  getItem: (key: string) => Value | null | Promise<Value | null>;
  setItem: (key: string, newValue: Value) => void | Promise<void>;
};

export type StringStorage = SimpleStorage<string>;

export const createJSONStorage = <T extends any>(
  getStringStorage: () => StringStorage
): Storage<unknown> => ({
  getItem: (key) => {
    const value = getStringStorage().getItem(key);
    if (value instanceof Promise) {
      return value.then((v) => JSON.parse(v || ""));
    }
    return JSON.parse(value || "");
  },
  setItem: (key, newValue) => {
    // @ts-ignore
    getStringStorage().setItem(key, JSON.stringify(newValue));
  },
});

export function atomWithDebouncedStorage<Value>(
  key: string,
  initialValue: Value,
  isStaleAtom: WritableAtom<boolean, boolean>,
  wait: number,
  debounceOptions: Parameters<typeof _debounce>[2],
  storage: Storage<Value>,
  fallback: boolean = false
): PrimitiveAtom<Value> {
  const getInitialValue = () => {
    try {
      const value = storage.getItem(key);
      if (value instanceof Promise) {
        return value
          .then((v) => (fallback ? v ?? initialValue : v))
          .catch(() => initialValue);
      }
      return value;
    } catch {
      return initialValue;
    }
  };

  const baseAtom = atom(storage.delayInit ? initialValue : getInitialValue());

  baseAtom.onMount = (setAtom) => {
    let unsub: Unsubscribe | undefined;
    if (storage.subscribe) {
      unsub = storage.subscribe(key, setAtom);
    }
    if (storage.delayInit) {
      const value = getInitialValue();
      if (value instanceof Promise) {
        value.then(setAtom);
      } else {
        setAtom(value);
      }
    }
    return unsub;
  };

  const debouncedSetStorage = _debounce(
    (key: string, newValue: Value, cb: () => void) => {
      storage.setItem(key, newValue);
      cb();
    },
    wait,
    debounceOptions
  );
  const anAtom = atom(
    (get) => {
      baseAtom.scope = anAtom.scope;
      return get(baseAtom);
    },
    (get, set, update: SetStateAction<Value>) => {
      baseAtom.scope = anAtom.scope;
      const newValue =
        typeof update === "function"
          ? (update as (prev: Value) => Value)(get(baseAtom))
          : update;
      set(baseAtom, newValue);
      set(isStaleAtom, true);
      debouncedSetStorage(key, newValue, () => set(isStaleAtom, false));
    }
  );

  return anAtom;
}
