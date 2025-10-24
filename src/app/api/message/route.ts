import { NextResponse } from "next/server";
import type { ChatAttachmentData } from "@/types/chat";
import { generateRAWNResponse } from "@/server/rawn/conversation";
import { logEvent } from "@/server/logging";
import {
  fetchUserMemory,
  saveMemorySummary,
} from "@/server/memory/repository";
import {
  summarizeConversation,
  autoSummarize,
  type SummaryInputMessage,
} from "@/server/memory/summarize";
import { recordUsageMetric } from "@/server/metrics/repository";

type RequestPayload = {
  user?: string;
  message?: string;
  attachments?: Array<Partial<ChatAttachmentData>>;
  recentMessages?: Array<{
    role?: string;
    content?: string;
  }>;
  summaryOverride?: string;
};

const FALLBACK_RESPONSE = {
  reply:
    "Enfrentei uma instabilidade momentanea ao acessar o motor de IA. Mantenho vigilancia e avisarei assim que retomar o fluxo.",
  context: {
    tipo: "alerta" as const,
    dados_biometricos: null,
    alerta: {
      tipo: "sistema",
      texto: "Instabilidade detectada. Tentarei novamente automaticamente.",
    },
    anexo: null,
  },
};

const ROUTE_NAME = "/api/message";

function sanitizeContextMessages(
  messages?: Array<{ role?: string; content?: string }>
): SummaryInputMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .slice(-10)
    .map((message) => {
      const role = message.role === "assistant" ? "assistant" : message.role === "user" ? "user" : null;
      if (!role) {
        return null;
      }
      const content = typeof message.content === "string"
        ? message.content.trim().slice(0, 800)
        : null;
      if (!content) {
        return null;
      }
      return { role, content } as SummaryInputMessage;
    })
    .filter((entry): entry is SummaryInputMessage => Boolean(entry));
}

export async function POST(request: Request) {
  const requestId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();

  let payload: RequestPayload;
  try {
    payload = await request.json();
  } catch {
    logEvent(
      "rawn_message_invalid_payload",
      { requestId, route: ROUTE_NAME },
      "warn"
    );
    return NextResponse.json(
      { error: "JSON invalido." },
      { status: 400 }
    );
  }

  const user = payload.user?.trim();
  const message = payload.message?.trim();
  const rawAttachments = Array.isArray(payload.attachments)
    ? payload.attachments.filter(
        (item): item is Partial<ChatAttachmentData> =>
          item !== null && typeof item === "object"
      )
    : [];
  const contextMessages = sanitizeContextMessages(payload.recentMessages);

  if (!user || !message) {
    logEvent(
      "rawn_message_missing_fields",
      { requestId, route: ROUTE_NAME, hasUser: !!user, hasMessage: !!message },
      "warn"
    );
    return NextResponse.json(
      { error: "E necessario informar usuario e mensagem." },
      { status: 400 }
    );
  }

  logEvent("rawn_message_received", {
    requestId,
    route: ROUTE_NAME,
    messageLength: message.length,
    attachmentsCount: rawAttachments.length,
  });

  try {
    const memorySnapshot = await fetchUserMemory(user);

    const result = await generateRAWNResponse({
      user,
      message,
      attachments: rawAttachments,
      history: contextMessages,
      summary: payload.summaryOverride ?? memorySnapshot.summary,
      requestId,
    });

    const latencyMs = Date.now() - startedAt;
    const summaryInput: SummaryInputMessage[] = [
      ...contextMessages,
      { role: "assistant", content: result.reply.slice(0, 600) },
    ];
    const newSummary = summarizeConversation(
      summaryInput,
      payload.summaryOverride ?? memorySnapshot.summary
    );

    const persistedSummary = autoSummarize(
      newSummary ?? memorySnapshot.summary,
      summaryInput
    );

    await saveMemorySummary(
      user,
      persistedSummary,
      memorySnapshot.resetCount
    );

    logEvent("rawn_message_completed", {
      requestId,
      route: ROUTE_NAME,
      latencyMs,
      model: result.model,
      contextType: result.context.tipo,
      usage: result.usage,
      summaryLength: persistedSummary?.length ?? 0,
    });

    await recordUsageMetric({
      requestId,
      userId: user,
      latencyMs,
      modelUsed: result.model,
      tokenUsage: result.usage,
      status: "success",
    });

    return NextResponse.json({
      reply: result.reply,
      context: result.context,
    });
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    logEvent(
      "rawn_message_error",
      {
        requestId,
        route: ROUTE_NAME,
        latencyMs,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      "error"
    );

    await recordUsageMetric({
      requestId,
      userId: payload.user ?? "unknown",
      latencyMs,
      modelUsed: null,
      tokenUsage: undefined,
      status: "fail",
    });

    return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
  }
}
