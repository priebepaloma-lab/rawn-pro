"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { BioSnippet } from "./BioSnippet";
import { AlertBanner } from "./AlertBanner";
import { AttachmentCard } from "./AttachmentCard";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

type ChatWindowProps = {
  messages: ChatMessageType[];
  isLoading: boolean;
};

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || typeof node.scrollTo !== "function") return;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex flex-1 flex-col gap-5 overflow-y-auto px-1 pb-4 pt-2"
      aria-live="polite"
    >
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col gap-3">
          <ChatMessage
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />

          {message.context?.tipo === "dados_biometricos" &&
          message.context.dados_biometricos ? (
            <BioSnippet data={message.context.dados_biometricos} />
          ) : null}

          {message.context?.tipo === "alerta" && message.context.alerta ? (
            <AlertBanner alert={message.context.alerta} />
          ) : null}

          {message.context?.tipo === "anexo" && message.context.anexo ? (
            <AttachmentCard attachment={message.context.anexo} />
          ) : null}
        </div>
      ))}

      {isLoading ? (
        <div className="flex w-full animate-fade-in justify-start">
          <div className="flex max-w-[70%] items-center gap-3 rounded-3xl border border-[#EAEAEA] bg-white px-5 py-4 text-[#1E1E1E] shadow-[0_10px_28px_rgba(30,30,30,0.06)]">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#2EB67D]" />
            <span className="text-sm tracking-[0.08em] text-[#B9B9C5]">
              RAWN está analisando...
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
