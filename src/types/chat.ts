export type ChatRole = "assistant" | "user";

export const CHAT_CONTEXT_TYPES = [
  "resposta_normal",
  "dados_biometricos",
  "alerta",
  "anexo",
] as const;

export type ChatContextType = (typeof CHAT_CONTEXT_TYPES)[number];

export type ChatBiometricData = {
  fc: number;
  sono: number;
  variabilidade?: number | null;
  energia?: number | null;
};

export type ChatAlertData = {
  tipo: string;
  texto: string;
};

export type ChatAttachmentData = {
  tipo: string;
  titulo: string;
  descricao?: string | null;
  url?: string | null;
  thumbnail?: string | null;
};

export type ChatContext = {
  tipo: ChatContextType;
  dados_biometricos: ChatBiometricData | null;
  alerta: ChatAlertData | null;
  anexo: ChatAttachmentData | null;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  context?: ChatContext;
};
