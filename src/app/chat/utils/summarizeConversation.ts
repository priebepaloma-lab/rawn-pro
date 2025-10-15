"use client";

import type { ChatRole } from "@/types/chat";

export type LocalSummaryMessage = {
  role: ChatRole;
  content: string;
};

const SUMMARY_LIMIT = 500;

const KEYWORDS: Record<string, string> = {
  corrida: "corrida",
  correr: "corrida",
  bike: "ciclismo",
  ciclismo: "ciclismo",
  natacao: "natacao",
  forca: "forca",
  hipertrofia: "hipertrofia",
  foco: "foco mental",
  sono: "sono",
  recuperacao: "recuperacao",
  mobilidade: "mobilidade",
  resistencia: "resistencia",
  performance: "performance",
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function detectFocus(messages: LocalSummaryMessage[]): string[] {
  const focus = new Set<string>();
  messages.forEach((message) => {
    const normalized = normalize(message.content);
    normalized.split(" ").forEach((word) => {
      const mapped = KEYWORDS[word];
      if (mapped) {
        focus.add(mapped);
      }
    });
  });
  return Array.from(focus);
}

function detectFrequency(messages: LocalSummaryMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const normalized = normalize(messages[i].content);
    const match = normalized.match(/(\d+)x\s*(semana|dias?)/);
    if (match) {
      return `${match[1]}x/semana`;
    }
  }
  return null;
}

export function summarizeConversationLocal(
  messages: LocalSummaryMessage[],
  previousSummary: string | null
): string | null {
  if (!messages.length) {
    return previousSummary;
  }

  const focus = detectFocus(messages);
  const frequency = detectFrequency(messages);

  const sentences: string[] = [];
  if (focus.length) {
    sentences.push(`Foco atual: ${focus.join(", ")}.`);
  }
  if (frequency) {
    sentences.push(`Frequencia declarada: ${frequency}.`);
  }
  if (!focus.length && !frequency) {
    sentences.push("Mantem rotina consistente com protocolos RAWN.");
  }

  const summary = sentences.join(" ").slice(0, SUMMARY_LIMIT);

  if (!previousSummary) {
    return summary;
  }

  if (!summary) {
    return previousSummary.slice(0, SUMMARY_LIMIT);
  }

  if (previousSummary.includes(summary)) {
    return previousSummary.slice(0, SUMMARY_LIMIT);
  }

  const merged = `${previousSummary} | ${summary}`.slice(0, SUMMARY_LIMIT);
  return merged;
}
