import type {
  ChatContext,
  ChatAttachmentData,
  ChatContextType,
} from "@/types/chat";
import { CHAT_CONTEXT_TYPES } from "@/types/chat";
import type { SummaryInputMessage } from "../memory/summarize";
import { getRAWNOpenAIClient } from "./openaiClient";

export type ConversationRequest = {
  user: string;
  message: string;
  attachments?: Array<Partial<ChatAttachmentData>>;
  history?: SummaryInputMessage[];
  summary?: string | null;
  requestId: string;
};

export type ConversationResponse = {
  reply: string;
  context: ChatContext;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  model: string | null;
  raw: unknown;
};

const RAWN_IDENTITY_PROMPT = `
Voce e o RAWN PRO - um conselheiro de performance humana.
Fale sempre com precisao cientifica e empatia.

Seu papel:
- Entender o contexto fisico e mental do usuario.
- Traduzir ciencia e comportamento em planos praticos.
- Acompanhar evolucao com inteligencia e presenca.

O que voce NAO faz:
- Nao diagnostica nem prescreve clinicamente.
- Nao aborda temas fora do universo fitness, fisiologico ou psicologico da performance.

O que voce SEMPRE faz:
- Explica o porque de cada orientacao.
- Fala com calma, confianca e clareza.
- Adapta o plano ao historico do usuario (memoria contextual).
- Incentiva o usuario com proposito, nao com frases prontas.

Tom: mentor tecnico, cientista pratico, empatico e humano.
Estilo: minimalista, etico e inspirador.

Responda SEMPRE com um JSON seguindo este formato:
{
  "reply": "Mensagem textual do RAWN PRO em portugues brasileiro",
  "context": {
    "tipo": "resposta_normal | dados_biometricos | alerta | anexo",
    "dados_biometricos": {
      "fc": 0,
      "sono": 0,
      "variabilidade": 0,
      "energia": 0
    } | null,
    "alerta": {
      "tipo": "string",
      "texto": "string"
    } | null,
    "anexo": {
      "tipo": "string",
      "titulo": "string",
      "descricao": "string | null",
      "url": "string | null",
      "thumbnail": "string | null"
    } | null
  }
}
Obrigatorio: mantenha a resposta enxuta, tecnica e acolhedora.
`;

type ModelResponse = {
  reply?: string;
  context?: Partial<ChatContext>;
};

function normalizeAttachment(
  attachment: Partial<ChatAttachmentData>
): ChatAttachmentData {
  return {
    tipo: attachment.tipo?.toString().slice(0, 60) ?? "Recurso",
    titulo: attachment.titulo?.toString().slice(0, 120) ?? "Material RAWN",
    descricao: attachment.descricao ? attachment.descricao.toString() : null,
    url: attachment.url ? attachment.url.toString() : null,
    thumbnail: attachment.thumbnail ? attachment.thumbnail.toString() : null,
  };
}

function normalizeContext(context?: Partial<ChatContext>): ChatContext {
  const tipo: ChatContextType =
    context?.tipo && CHAT_CONTEXT_TYPES.includes(context.tipo)
      ? context.tipo
      : "resposta_normal";

  return {
    tipo,
    dados_biometricos:
      tipo === "dados_biometricos" && context?.dados_biometricos
        ? {
            fc: Number(context.dados_biometricos.fc),
            sono: Number(context.dados_biometricos.sono),
            variabilidade:
              context.dados_biometricos.variabilidade !== undefined &&
              context.dados_biometricos.variabilidade !== null
                ? Number(context.dados_biometricos.variabilidade)
                : null,
            energia:
              context.dados_biometricos.energia !== undefined &&
              context.dados_biometricos.energia !== null
                ? Number(context.dados_biometricos.energia)
                : null,
          }
        : null,
    alerta:
      tipo === "alerta" && context?.alerta
        ? {
            tipo: context.alerta.tipo?.toString().slice(0, 60) ?? "informativo",
            texto: context.alerta.texto?.toString() ?? "",
          }
        : null,
    anexo:
      tipo === "anexo" && context?.anexo
        ? normalizeAttachment(context.anexo)
        : null,
  };
}

function extractJSONPayload(output: string): ModelResponse | null {
  try {
    return JSON.parse(output);
  } catch {
    const match = output.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildHistorySummary(history: SummaryInputMessage[]): string | null {
  if (!history.length) {
    return null;
  }

  const recentHistory = history.slice(-10);

  return recentHistory
    .map((entry) => {
      const speaker = entry.role === "assistant" ? "RAWN PRO" : "Usuario";
      return `${speaker}: ${entry.content}`;
    })
    .join("\n");
}

function sanitizeMessageText(text: string): string {
  return text.slice(0, 4000);
}

export async function generateRAWNResponse({
  user,
  message,
  attachments = [],
  history = [],
  summary,
  requestId,
}: ConversationRequest): Promise<ConversationResponse> {
  const client = getRAWNOpenAIClient();

  const sanitizedMessage = sanitizeMessageText(message);
  const sanitizedAttachments = attachments.map((attachment) =>
    normalizeAttachment(attachment)
  );
  const historySummary = buildHistorySummary(history);

  const contentBlocks: Array<{ type: "input_text"; text: string }> = [];

  if (historySummary) {
    contentBlocks.push({
      type: "input_text",
      text: `Historico contextual (max. 500 registros):\n${historySummary}`,
    });
  }

  contentBlocks.push({
    type: "input_text",
    text: `Nova mensagem do usuario ${user}:\n${sanitizedMessage}`,
  });

  if (sanitizedAttachments.length > 0) {
    contentBlocks.push({
      type: "input_text",
      text: `Metadados de anexos confiaveis: ${sanitizedAttachments
        .map(
          (attachment, index) =>
            `#${index + 1} tipo=${attachment.tipo}, titulo=${attachment.titulo}, url=${
              attachment.url ?? "n/a"
            }`
        )
        .join(" | ")}`,
    });
  }

  contentBlocks.push({
    type: "input_text",
    text: `Identificador da requisicao: ${requestId}. Retorne apenas o JSON no formato especificado.`,
  });

  if (summary) {
    contentBlocks.unshift({
      type: "input_text",
      text: `Resumo persistente: ${summary}`,
    });
  }

  const completion = await client.responses.create({
    model: "gpt-4-turbo",
    temperature: 0.6,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: RAWN_IDENTITY_PROMPT,
          },
        ],
      },
      {
        role: "user",
        content: contentBlocks,
      },
    ],
  });

  const parsed = extractJSONPayload(completion.output_text ?? "");
  const reply =
    parsed?.reply && parsed.reply.trim().length > 0
      ? parsed.reply.trim()
      : "Estou analisando seus dados e retornarei com um plano claro na proxima interacao.";
  const context = normalizeContext(parsed?.context);

  const usage = {
    inputTokens: completion.usage?.input_tokens,
    outputTokens: completion.usage?.output_tokens,
    totalTokens: completion.usage?.total_tokens,
  };

  return {
    reply,
    context,
    usage,
    model: completion.model ?? null,
    raw: completion,
  };
}

export { normalizeContext };
