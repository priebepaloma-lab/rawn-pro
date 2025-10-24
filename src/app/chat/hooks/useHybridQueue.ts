"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatRole } from "@/types/chat";
import {
  loadPendingMessages,
  savePendingMessages,
  loadPendingSummaries,
  savePendingSummaries,
  type StoredMessage,
  type PendingSummary,
} from "../storage/localMemory";
import { useOfflineStatus } from "./useOfflineStatus";

type QueueMessage = StoredMessage;

export function useHybridQueue() {
  const { isOnline } = useOfflineStatus();
  const [pendingMessages, setPendingMessages] = useState<QueueMessage[]>([]);
  const [pendingSummaries, setPendingSummaries] = useState<PendingSummary[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPendingMessages(loadPendingMessages());
    setPendingSummaries(loadPendingSummaries());
  }, []);

  useEffect(() => {
    savePendingMessages(pendingMessages);
  }, [pendingMessages]);

  useEffect(() => {
    savePendingSummaries(pendingSummaries);
  }, [pendingSummaries]);

  const enqueueMessage = useCallback(
    (message: { role: ChatRole; content: string; timestamp: string }) => {
      const entry: QueueMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...message,
        pending: true,
      };
      setPendingMessages((queue) => [...queue, entry]);
    },
    []
  );

  const enqueueSummary = useCallback((summary: string) => {
    const entry: PendingSummary = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      summary,
      createdAt: new Date().toISOString(),
    };
    setPendingSummaries((queue) => [...queue, entry]);
  }, []);

  const scheduleFlush = useCallback(
    (callback: () => void) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(callback, 750);
    },
    []
  );

  const removePendingMessage = useCallback((id: string) => {
    setPendingMessages((queue) => queue.filter((item) => item.id !== id));
  }, []);

  const removePendingSummary = useCallback((id: string) => {
    setPendingSummaries((queue) => queue.filter((item) => item.id !== id));
  }, []);

  const resetQueues = useCallback(() => {
    setPendingMessages([]);
    setPendingSummaries([]);
  }, []);

  return {
    isOnline,
    pendingMessages,
    pendingSummaries,
    enqueueMessage,
    enqueueSummary,
    removePendingMessage,
    removePendingSummary,
    scheduleFlush,
    resetQueues,
  } as const;
}
