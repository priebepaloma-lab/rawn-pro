import type { ChatRole } from "@/types/chat";

export type SummaryInputMessage = {
  role: ChatRole;
  content: string;
};

const KEYWORD_MAP: Record<string, string> = {
  corrida: "corrida",
  correr: "corrida",
  bike: "ciclismo",
  ciclismo: "ciclismo",
  natacao: "natação",
  forca: "força",
  hipertrofia: "hipertrofia",
  foco: "foco mental",
  sono: "sono",
  recuperação: "recuperacao",
  recuperacao: "recuperacao",
  mobilidade: "mobilidade",
  resistencia: "resistência",
  performance: "performance",
};

const MOOD_KEYWORDS: Record<string, string> = {
  motivado: "motivacao crescente",
  animado: "motivacao positiva",
  confiante: "confianca alta",
  cansado: "fadiga relatada",
  exausto: "fadiga acentuada",
  ansioso: "ansiedade perceptivel",
  preocupado: "alerta emocional",
  frustrado: "frustracao relatada",
  satisfeito: "satisfacao declarada",
};

function normalizeContent(content: string): string {
  return content
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractFocusKeywords(messages: SummaryInputMessage[]): string[] {
  const focusSet = new Set<string>();

  messages.forEach((message) => {
    const normalized = normalizeContent(message.content);
    normalized.split(" ").forEach((word) => {
      const mapped = KEYWORD_MAP[word];
      if (mapped) {
        focusSet.add(mapped);
      }
    });
  });

  return Array.from(focusSet);
}

function detectFrequency(messages: SummaryInputMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const normalized = normalizeContent(messages[i].content);
    const match = normalized.match(/(\d+)\s*x\s*\/?\s*(semana|sem|semana|dias?)/);
    if (match) {
      return `${match[1]}x/semana`;
    }
  }
  return null;
}

function detectMood(messages: SummaryInputMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const normalized = normalizeContent(messages[i].content);
    for (const [keyword, mood] of Object.entries(MOOD_KEYWORDS)) {
      if (normalized.includes(keyword)) {
        return mood;
      }
    }
  }
  return null;
}

function extractEnvironment(messages: SummaryInputMessage[]): string | null {
  const environments = [
    { keyword: "ar livre", value: "prefere treinos ao ar livre" },
    { keyword: "academia", value: "utiliza academia regularmente" },
    { keyword: "casa", value: "executa sessoes em casa" },
    { keyword: "estudio", value: "treina em estúdios especializados" },
  ];

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const content = normalizeContent(messages[i].content);
    for (const env of environments) {
      if (content.includes(env.keyword.replace(/\s/g, ""))) {
        return env.value;
      }
    }
  }

  return null;
}

function combineSummaries(
  previous: string | null,
  current: string | null
): string | null {
  if (previous && current) {
    if (previous.includes(current)) {
      return previous;
    }
    const merged = `${previous.trim()} | ${current.trim()}`;
    return merged.slice(0, 500);
  }
  return previous ?? current;
}

export function summarizeConversation(
  messages: SummaryInputMessage[],
  previousSummary: string | null
): string | null {
  if (!messages.length) {
    return previousSummary ?? null;
  }

  const focus = extractFocusKeywords(messages);
  const frequency = detectFrequency(messages);
  const mood = detectMood(messages);
  const environment = extractEnvironment(messages);

  const goalSentence = focus.length
    ? `Enfoque atual em ${focus.join(", ")}.`
    : "Mantem foco em performance integrada.";

  const frequencySentence = frequency
    ? `Frequencia declarada: ${frequency}.`
    : null;

  const environmentSentence = environment ?? null;

  const moodSentence = mood
    ? `Estado emocional: ${mood}.`
    : "Estado emocional equilibrado.";

  const lastRequestSentence =
    focus.length > 0
      ? `Solicitacao recente reforca foco em ${focus[0]}.`
      : "Solicitacao recente mantem alinhamento com protocolo RAWN.";

  const segments = [
    goalSentence,
    frequencySentence,
    environmentSentence,
    moodSentence,
    lastRequestSentence,
  ].filter(Boolean) as string[];

  const currentSummary = segments.join(" ").slice(0, 500);

  return combineSummaries(previousSummary, currentSummary);
}

export function autoSummarize(
  persistedSummary: string | null,
  historicalMessages: SummaryInputMessage[]
): string | null {
  const condensedMessages = historicalMessages.slice(-20);
  return summarizeConversation(condensedMessages, persistedSummary);
}
