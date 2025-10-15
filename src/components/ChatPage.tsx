"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { ChatInput } from "./ChatInput";
import type { ChatContext, ChatMessage } from "@/types/chat";
import { CHAT_CONTEXT_TYPES } from "@/types/chat";
import { useUserProfile } from "@/app/chat/hooks/useUserProfile";
import { useHybridQueue } from "@/app/chat/hooks/useHybridQueue";
import {
  loadStoredMessages,
  saveStoredMessages,
  clearLocalData,
  loadCurrentSummary,
  saveCurrentSummary,
  type StoredMessage,
} from "@/app/chat/storage/localMemory";
import { summarizeConversationLocal } from "@/app/chat/utils/summarizeConversation";
import { SettingsMenu } from "@/app/components/settings/SettingsMenu";
import { clientInfo, clientWarn } from "@/utils/logger";

const formatTimestamp = () =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

const baseContext: ChatContext = {
  tipo: "resposta_normal",
  dados_biometricos: null,
  alerta: null,
  anexo: null,
};

const MAX_RECENT_MESSAGES = 10;

const toStoredMessage = (message: ChatMessage): StoredMessage => ({
  id: message.id,
  role: message.role,
  content: message.content,
  timestamp: message.timestamp,
});

const toChatMessage = (stored: StoredMessage): ChatMessage => ({
  id: stored.id,
  role: stored.role,
  content: stored.content,
  timestamp: stored.timestamp,
});

const ensureContext = (context?: Partial<ChatContext>): ChatContext => {
  const tipo = context?.tipo;
  const normalizedTipo =
    CHAT_CONTEXT_TYPES.find((value) => value === tipo) ?? "resposta_normal";

  return {
    tipo: normalizedTipo,
    dados_biometricos:
      normalizedTipo === "dados_biometricos" && context?.dados_biometricos
        ? {
            fc: Number(context.dados_biometricos.fc),
            sono: Number(context.dados_biometricos.sono),
            variabilidade: context.dados_biometricos.variabilidade ?? null,
            energia: context.dados_biometricos.energia ?? null,
          }
        : null,
    alerta:
      normalizedTipo === "alerta" && context?.alerta
        ? {
            tipo: context.alerta.tipo ?? "informativo",
            texto: context.alerta.texto ?? "",
          }
        : null,
    anexo:
      normalizedTipo === "anexo" && context?.anexo
        ? {
            tipo: context.anexo.tipo ?? "recurso",
            titulo: context.anexo.titulo ?? "Anexo",
            descricao: context.anexo.descricao ?? null,
            url: context.anexo.url ?? null,
            thumbnail: context.anexo.thumbnail ?? null,
          }
        : null,
  };
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const buildSeedMessages = (): ChatMessage[] => [
  {
    id: createId(),
    role: "assistant",
    content:
      "Bem-vindo de volta, Maniq. Dormiu 7h12 com 82% de eficiencia. Pronto para um dia de entregas com foco calibrado.",
    timestamp: "07:42",
    context: baseContext,
  },
  {
    id: createId(),
    role: "user",
    content:
      "Plano rapido: preciso performar nas reunioes das 10h e 15h. Algum ajuste de rotina?",
    timestamp: "07:43",
  },
  {
    id: createId(),
    role: "assistant",
    content:
      "Sugestao inicial: respiracao 4-7-8 as 9h45, shot de matcha 15 minutos antes das 10h e micro pausa visual de 90s as 14h35. Posso sincronizar esses lembretes?",
    timestamp: "07:44",
    context: {
      tipo: "dados_biometricos",
      dados_biometricos: {
        fc: 58,
        sono: 7.2,
        variabilidade: 72,
        energia: 86,
      },
      alerta: null,
      anexo: null,
    },
  },
];

const sanitizeUserId = (name: string) => {
  const canonical = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return canonical || "rawn-guest";
};

export function ChatPage() {
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const {
    isOnline,
    pendingMessages,
    pendingSummaries,
    enqueueMessage,
    enqueueSummary,
    removePendingMessage,
    removePendingSummary,
    scheduleFlush,
    resetQueues,
  } = useHybridQueue();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasLoggedConsent, setHasLoggedConsent] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const messagesRef = useRef<ChatMessage[]>(messages);
  const summaryRef = useRef<string | null>(summary);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

  const remoteUserId = useMemo(
    () => sanitizeUserId(profile.name ?? "RAWN"),
    [profile.name]
  );

  useEffect(() => {
    const stored = loadStoredMessages();
    if (stored.length) {
      setMessages(stored.map(toChatMessage));
    } else {
      setMessages(buildSeedMessages());
    }
    const storedSummary = loadCurrentSummary();
    setSummary(storedSummary);
    summaryRef.current = storedSummary;
    setBootstrapped(true);
  }, []);

  useEffect(() => {
    if (!bootstrapped) return;
    saveStoredMessages(messages.map(toStoredMessage));
  }, [messages, bootstrapped]);

  useEffect(() => {
    if (!bootstrapped) return;
    saveCurrentSummary(summary);
  }, [summary, bootstrapped]);

  useEffect(() => {
    if (hasLoggedConsent) return;

    const controller = new AbortController();

    fetch("/api/memory/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: remoteUserId,
        consent: profile.sharePerformanceData,
      }),
      signal: controller.signal,
    })
      .then(() => setHasLoggedConsent(true))
      .catch((error) => {
        console.warn("Falha ao registrar consentimento", error);
      });

    return () => controller.abort();
  }, [hasLoggedConsent, remoteUserId, profile.sharePerformanceData]);

  const updateSummaryFromConversation = useCallback(
    (recentMessages: ChatMessage[]) => {
      const nextSummary = summarizeConversationLocal(
        recentMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        summaryRef.current ?? null
      );

      if (nextSummary !== summaryRef.current) {
        summaryRef.current = nextSummary;
        setSummary(nextSummary ?? null);
        saveCurrentSummary(nextSummary ?? null);
      }

      return nextSummary;
    },
    []
  );

  const transmitMessage = useCallback(
    async (payload: { content: string; timestamp: string }) => {
      const { content } = payload;
      const start = performance.now();
      const recentMessagesPayload = messagesRef.current
        .slice(-MAX_RECENT_MESSAGES)
        .map((message) => ({
          role: message.role,
          content: message.content.slice(0, 600),
        }));

      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: remoteUserId,
          message: content,
          recentMessages: recentMessagesPayload,
          summaryOverride: summaryRef.current ?? undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: { reply: string; context: ChatContext } = await response.json();

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: data.reply,
        timestamp: formatTimestamp(),
        context: ensureContext(data.context),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMessage];
        updateSummaryFromConversation(updated.slice(-MAX_RECENT_MESSAGES));
        return updated;
      });

      const latencyMs = Math.round(performance.now() - start);
      clientInfo("Mensagem sincronizada", {
        remoteUserId,
        latencyMs,
        length: content.length,
      });
    },
    [remoteUserId, updateSummaryFromConversation]
  );

  const processPendingQueues = useCallback(async () => {
    for (const pending of pendingMessages) {
      try {
        await transmitMessage({
          content: pending.content,
          timestamp: pending.timestamp,
        });
        removePendingMessage(pending.id);
      } catch (error) {
        clientWarn("Falha ao sincronizar mensagem pendente", {
          id: pending.id,
          error: error instanceof Error ? error.message : String(error),
        });
        break;
      }
    }

    for (const summaryEntry of pendingSummaries) {
      try {
        await fetch("/api/memory/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: remoteUserId,
            summary: summaryEntry.summary,
          }),
        });
        removePendingSummary(summaryEntry.id);
      } catch (error) {
        clientWarn("Falha ao sincronizar resumo", {
          id: summaryEntry.id,
          error: error instanceof Error ? error.message : String(error),
        });
        break;
      }
    }
  }, [pendingMessages, pendingSummaries, removePendingMessage, removePendingSummary, remoteUserId, transmitMessage]);

  useEffect(() => {
    if (!isOnline) return;
    if (!pendingMessages.length && !pendingSummaries.length) return;

    scheduleFlush(() => {
      processPendingQueues().catch((error) => {
        clientWarn("Falha ao processar fila", {
          error: error instanceof Error ? error.message : String(error),
        });
      });
    });
  }, [isOnline, pendingMessages, pendingSummaries, scheduleFlush, processPendingQueues]);

  const handleSend = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    const timestamp = formatTimestamp();
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      if (!isOnline) {
        enqueueMessage({ role: "user", content: text, timestamp });
        const updated = [...messagesRef.current, userMessage];
        const previousSummary = summaryRef.current;
        const nextSummary = updateSummaryFromConversation(
          updated.slice(-MAX_RECENT_MESSAGES)
        );
        if (nextSummary && nextSummary !== previousSummary) {
          enqueueSummary(nextSummary);
        }
        clientWarn("Mensagem armazenada offline", { length: text.length });
      } else {
        await transmitMessage({ content: text, timestamp });
      }
    } catch (error) {
      console.error(error);
      const fallbackMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content:
          "Nao consegui processar sua mensagem agora. Retentarei automaticamente em breve.",
        timestamp: formatTimestamp(),
        context: {
          tipo: "alerta",
          dados_biometricos: null,
          alerta: {
            tipo: "sistema",
            texto: "Falha temporaria de conexao. Monitorando a estabilidade.",
          },
          anexo: null,
        },
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoteReset = useCallback(async () => {
    try {
      await fetch("/api/memory/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: remoteUserId }),
      });
    } catch (error) {
      console.warn("Falha ao resetar memoria remota", error);
    }
  }, [remoteUserId]);

  const handleResetLocalData = useCallback(async () => {
    setIsProcessing(true);
    try {
      clearLocalData();
      resetQueues();
      resetProfile();
      setSummary(null);
      summaryRef.current = null;
      saveCurrentSummary(null);
      const seeds = buildSeedMessages();
      setMessages(seeds);
      await handleRemoteReset();
    } finally {
      setIsProcessing(false);
    }
  }, [handleRemoteReset, resetProfile, resetQueues]);

  const handlePrivacyUpdate = useCallback(
    (settings: {
      sharePerformanceData?: boolean;
      shareSleepInsights?: boolean;
    }) => {
      updateProfile(settings);
    },
    [updateProfile]
  );

  const statusLabel = useMemo(() => {
    if (isProcessing) return "RAWN analisando";
    if (!isOnline) return "Modo offline";
    return "On duty · 24/7";
  }, [isProcessing, isOnline]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]">
      <header className="sticky top-0 z-30 border-b border-[#E0E0E0] bg-[#F8F9FA]/95 backdrop-blur shadow-[0_12px_24px_rgba(30,30,30,0.04)]">
        <div className="mx-auto flex h-20 w-full max-w-3xl items-center justify-between px-6 sm:px-8">
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-[0.48em] text-[#B9B9C5]">
              RAWN PRO
            </span>
            <span className="text-[1.35rem] font-semibold leading-tight text-[#1E1E1E]">
              Human Performance Advisor
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-xs uppercase tracking-[0.32em] text-[#B9B9C5]">
                STATUS
              </span>
              <span className="text-sm font-medium text-[#2EB67D]">
                {statusLabel}
              </span>
            </div>
            <SettingsMenu
              profile={profile}
              onProfileChange={updateProfile}
              onPrivacyChange={handlePrivacyUpdate}
              onResetLocalData={handleResetLocalData}
              isOffline={!isOnline}
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 pb-28 pt-6 sm:px-6">
        <div className="flex w-full max-w-3xl flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-6 rounded-[32px] border border-transparent bg-transparent px-1 sm:px-0">
            <ChatWindow messages={messages} isLoading={isProcessing} />
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 z-30 flex justify-center bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/97 to-transparent px-4 pb-8 pt-4 sm:px-6">
        <div className="w-full max-w-3xl rounded-[32px] bg-[#F8F9FA]/70 backdrop-blur shadow-[0_-6px_24px_rgba(30,30,30,0.04)]">
          <div className="p-4 sm:p-6">
            <ChatInput
              onSubmit={handleSend}
              disabled={isProcessing && isOnline}
              isLoading={isProcessing}
            />
          </div>
          <div className="flex items-center justify-between px-6 pb-4 text-xs uppercase tracking-[0.12em] text-[#B9B9C5]">
            <span>Resumos anonimos · memoria hibrida</span>
            <span>Ultima sincronizacao: {formatTimestamp()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
