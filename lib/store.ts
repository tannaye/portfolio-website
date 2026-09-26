"use client";

import { useSyncExternalStore } from "react";

/** A tiny observable store, so global UI state doesn't need a provider tree. */
export function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  const get = () => state;
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };
  const set = (next: T | ((prev: T) => T)) => {
    state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
    listeners.forEach((l) => l());
  };
  const use = () => useSyncExternalStore(subscribe, get, () => initial);
  return { get, set, subscribe, use };
}

/** Flips true when the preloader has finished (or was skipped). Hero waits on it. */
export const introStore = createStore(false);

/** Menu overlay open state. */
export const menuStore = createStore(false);

/** Page curtain: 'idle' | 'covering' | 'revealing' */
export const curtainStore = createStore<"idle" | "covering" | "revealing">("idle");
