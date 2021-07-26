import type { PrimitiveAtom, SetStateAction, WritableAtom } from "jotai";
import { atom } from "jotai";
import _debounce from "lodash.debounce";

type Unsubscribe = () => void;

type Storage<Value> = {
  getItem: (key: string) => Value | Promise<Value>;
  setItem: (key: string, newValue: Value) => void | Promise<void>;
  delayInit?: boolean;
  subscribe?: (key: string, callback: (value: Value) => void) => Unsubscribe;
};

type StringStorage = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, newValue: string) => void | Promise<void>;
};

export const createJSONStorage = (
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
    getStringStorage().setItem(key, JSON.stringify(newValue));
  },
});

const defaultStorage = createJSONStorage(() => localStorage);

export function atomWithDebouncedStorage<Value>(
  key: string,
  initialValue: Value,
  isStaleAtom: WritableAtom<boolean, boolean>,
  wait: number,
  debounceOptions: Parameters<typeof _debounce>[2],
  storage: Storage<Value> = defaultStorage as Storage<Value>
): PrimitiveAtom<Value> {
  const getInitialValue = () => {
    try {
      const value = storage.getItem(key);
      if (value instanceof Promise) {
        return value.catch(() => initialValue);
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
