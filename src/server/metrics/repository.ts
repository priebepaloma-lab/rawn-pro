import { logEvent } from "../logging";
import { getSupabaseClient } from "../supabase/client";

const TABLE_NAME = "usage_metrics";

export type UsageMetricPayload = {
  requestId: string;
  userId: string;
  latencyMs: number;
  modelUsed?: string | null;
  tokenUsage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  status: "success" | "fail";
};

export async function recordUsageMetric(
  payload: UsageMetricPayload
): Promise<void> {
  const client = getSupabaseClient();

  if (!client) {
    return;
  }

  const { error } = await client.from(TABLE_NAME).insert({
    requestId: payload.requestId,
    userId: payload.userId,
    latency: payload.latencyMs,
    modelUsed: payload.modelUsed ?? null,
    tokenUsage: payload.tokenUsage ?? null,
    status: payload.status,
  });

  if (error) {
    logEvent(
      "rawn_metrics_record_error",
      {
        requestId: payload.requestId,
        userId: payload.userId,
        error: error.message,
      },
      "error"
    );
  } else {
    logEvent("rawn_metrics_recorded", {
      requestId: payload.requestId,
      userId: payload.userId,
      status: payload.status,
      latencyMs: payload.latencyMs,
    });
  }
}
