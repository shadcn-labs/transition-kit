"use client";

import { useCallback, useSyncExternalStore } from "react";

import { ROUTES } from "@/constants/routes";
import type { ApiKeyInfo } from "@/lib/api-keys";
import type { ActivePlan } from "@/lib/billing";

export interface Account {
  signedIn: boolean;
  pro: boolean;
  email?: string;
  plan?: ActivePlan | null;
  key?: ApiKeyInfo | null;
}

type State = { status: "loading" } | { status: "ready"; account: Account };

let state: State = { status: "loading" };
let request: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = (next: State) => {
  state = next;
  for (const listener of listeners) {
    listener();
  }
};

const signedOut: Account = { pro: false, signedIn: false };

const fetchAccount = async (): Promise<Account> => {
  try {
    const response = await fetch(ROUTES.API_ME, { credentials: "same-origin" });
    return response.ok ? ((await response.json()) as Account) : signedOut;
  } catch {
    return signedOut;
  }
};

const load = () => {
  request ??= (async () => {
    try {
      emit({ account: await fetchAccount(), status: "ready" });
    } finally {
      request = null;
    }
  })();
  return request;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (state.status === "loading" && !request) {
    void load();
  }
  return () => listeners.delete(listener);
};

const loadingState: State = { status: "loading" };

export const useAccount = () => {
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => loadingState
  );
  const refresh = useCallback(() => load(), []);
  return {
    account: current.status === "ready" ? current.account : null,
    loading: current.status === "loading",
    refresh,
  };
};
