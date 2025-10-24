import { logEvent } from "../logging";
import { getSupabaseClient } from "../supabase/client";

const TABLE_NAME = "user_memory";
const SUMMARY_LIMIT = 500;

export type MemorySummaryRecord = {
  id?: string;
  userId: string;
  summary: string | null;
  resetCount: number;
  updatedAt?: string;
};

const DEFAULT_MEMORY: MemorySummaryRecord = {
  userId: "unknown",
  summary: null,
  resetCount: 0,
};

function sanitizeSummary(summary: string | null | undefined): string | null {
  if (!summary) {
    return null;
  }

  const normalized = summary
    .replace(/[^\w\s.,;:!?+-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, SUMMARY_LIMIT);
}

export async function fetchUserMemory(
  userId: string
): Promise<MemorySummaryRecord> {
  const client = getSupabaseClient();

  if (!client) {
    return { ...DEFAULT_MEMORY, userId };
  }

  const { data, error } = await client
    .from(TABLE_NAME)
    .select("id, userId, summary_text, resetCount, updatedAt")
    .eq("userId", userId)
    .maybeSingle();

  if (error) {
    logEvent(
      "rawn_memory_fetch_error",
      { userId, error: error.message },
      "error"
    );
    return { ...DEFAULT_MEMORY, userId };
  }

  if (!data) {
    return { ...DEFAULT_MEMORY, userId };
  }

  return {
    id: data.id,
    userId,
    summary: typeof data.summary_text === "string" ? data.summary_text : null,
    resetCount: data.resetCount ?? 0,
    updatedAt: data.updatedAt ?? undefined,
  };
}

export async function saveMemorySummary(
  userId: string,
  summary: string | null,
  resetCount?: number
): Promise<void> {
  const client = getSupabaseClient();

  if (!client) {
    return;
  }

  const sanitized = sanitizeSummary(summary);

  const payload: Record<string, unknown> = {
    userId,
    summary_text: sanitized,
  };

  if (typeof resetCount === "number") {
    payload.resetCount = resetCount;
  }

  const { error } = await client
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: "userId" });

  if (error) {
    logEvent(
      "rawn_memory_save_error",
      { userId, error: error.message },
      "error"
    );
  } else {
    logEvent("rawn_memory_saved", {
      userId,
      summaryLength: sanitized?.length ?? 0,
      resetCount: payload.resetCount,
    });
  }
}

export async function resetUserMemory(userId: string): Promise<void> {
  const client = getSupabaseClient();

  if (!client) {
    return;
  }

  const { data, error } = await client
    .from(TABLE_NAME)
    .select("resetCount")
    .eq("userId", userId)
    .maybeSingle();

  if (error) {
    logEvent(
      "rawn_memory_reset_fetch_error",
      { userId, error: error.message },
      "error"
    );
    return;
  }

  const nextResetCount = (data?.resetCount ?? 0) + 1;

  const { error: updateError } = await client
    .from(TABLE_NAME)
    .upsert(
      {
        userId,
        summary_text: null,
        resetCount: nextResetCount,
      },
      { onConflict: "userId" }
    );

  if (updateError) {
    logEvent(
      "rawn_memory_reset_error",
      { userId, error: updateError.message },
      "error"
    );
  } else {
    logEvent("rawn_memory_reset_success", {
      userId,
      resetCount: nextResetCount,
    });
  }
}
