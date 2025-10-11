// RAWN PRO — /api/chat (Edge streaming + roteamento de modelo + logs)
import OpenAI from "openai";

export const runtime = "edge"; // garante Web Streams/ReadableStream nativo no Vercel

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Heurística simples para decidir entre mini e 4o
function isComplexPrompt(text = "") {
  const len = text.length;
  const complexKeywords = [
    "plano", "semana", "cronograma", "dieta", "avançado",
    "personalizado", "periodização", "estratégia", "maratona",
    "nutrição", "fases", "competição", "progresso", "revisão",
  ];
  const hasComplexWords = complexKeywords.some((w) =>
    text.toLowerCase().includes(w)
  );
  return len > 280 || hasComplexWords;
}

export async function POST(req) {
  const t0 = Date.now();

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response("Bad request", { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const useGpt4o = isComplexPrompt(lastUserMessage);
    const model = useGpt4o ? "gpt-4o" : "gpt-4o-mini";

    console.log(`[RAWN PRO] usando modelo: ${model}`);

    const completion = await client.chat.completions.create({
      model,
      messages,
      stream: true,
      temperature: useGpt4o ? 0.7 : 0.6,
      max_tokens: 600,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of completion) {
            const token = part?.choices?.[0]?.delta?.content;
            if (token) {
              controller.enqueue(encoder.encode(token));
            }
          }
        } catch (err) {
          console.error("[RAWN PRO] erro durante streaming:", err);
          // envia uma linha para o cliente ver algo em vez de falhar mudo
          controller.enqueue(
            encoder.encode("⚠️ Erro ao processar a resposta. Tente novamente.\n")
          );
        } finally {
          const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
          console.log(`[RAWN PRO] streaming finalizado em ${elapsed}s (${model})`);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[RAWN PRO] erro geral /api/chat:", error);
    const msg =
      typeof error?.message === "string"
        ? error.message
        : "Falha ao processar requisição";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

