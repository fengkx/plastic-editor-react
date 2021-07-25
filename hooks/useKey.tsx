/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, RefObject, useMemo } from "react";
import { useEventListener } from "@react-hookz/web";

export type KeyPredicate = (event: KeyboardEvent) => boolean;
export type KeyFilter =
  | null
  | undefined
  | string
  | ((event: KeyboardEvent) => boolean);
export type Handler = (event: KeyboardEvent) => void;

export type UseKeyOptions<T extends EventTarget> = {
  event?: "keydown" | "keypress" | "keyup";
  target?: RefObject<T> | T | null;
  options?: boolean | AddEventListenerOptions;
};

const noop = () => {};

const createKeyPredicate = (keyFilter: KeyFilter): KeyPredicate =>
  typeof keyFilter === "function"
    ? keyFilter
    : typeof keyFilter === "string"
    ? (event: KeyboardEvent) => event.key === keyFilter
    : keyFilter
    ? () => true
    : () => false;

export function useKey<T extends EventTarget>(
  key: KeyFilter,
  fn: Handler = noop,
  opts: UseKeyOptions<T> = {},
  deps: DependencyList = [key]
) {
  const { event = "keydown", target = window, options } = opts;
  const memoHandler = useMemo(() => {
    const predicate: KeyPredicate = createKeyPredicate(key);
    const handler: Handler = (handlerEvent) => {
      if (predicate(handlerEvent)) {
        return fn(handlerEvent);
      }
    };
    return handler;
  }, deps);
  useEventListener(target, event, memoHandler, options);
}
