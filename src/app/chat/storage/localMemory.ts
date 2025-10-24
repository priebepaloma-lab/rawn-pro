"use client";

import type { ChatRole } from "@/types/chat";

const STORAGE_KEYS = {
  messages: "rawn_pro_local_messages",
  pending: "rawn_pro_pending_queue",
  summaries: "rawn_pro_summary_queue",
  currentSummary: "rawn_pro_summary_current",
};

type StoredMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  pending?: boolean;
};

type PendingSummary = {
  id: string;
  summary: string;
  createdAt: string;
};

const memoryFallback = new Map<string, unknown>();

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return (memoryFallback.get(key) as T) ?? fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn("RAWN PRO local storage read failed", error);
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    memoryFallback.set(key, value);
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("RAWN PRO local storage write failed", error);
  }
}

export function loadStoredMessages(): StoredMessage[] {
  return safeRead<StoredMessage[]>(STORAGE_KEYS.messages, []);
}

export function saveStoredMessages(messages: StoredMessage[]) {
  safeWrite(STORAGE_KEYS.messages, messages);
}

export function loadPendingMessages(): StoredMessage[] {
  return safeRead<StoredMessage[]>(STORAGE_KEYS.pending, []);
}

export function savePendingMessages(messages: StoredMessage[]) {
  safeWrite(STORAGE_KEYS.pending, messages);
}

export function loadPendingSummaries(): PendingSummary[] {
  return safeRead<PendingSummary[]>(STORAGE_KEYS.summaries, []);
}

export function savePendingSummaries(summaries: PendingSummary[]) {
  safeWrite(STORAGE_KEYS.summaries, summaries);
}

export function clearLocalData() {
  if (typeof window === "undefined") {
    memoryFallback.clear();
    return;
  }

  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn("RAWN PRO local storage clear failed", error);
    }
  });
}

export type { StoredMessage, PendingSummary };

export function loadCurrentSummary(): string | null {
  return safeRead<string | null>(STORAGE_KEYS.currentSummary, null);
}

export function saveCurrentSummary(summary: string | null) {
  safeWrite(STORAGE_KEYS.currentSummary, summary);
}
