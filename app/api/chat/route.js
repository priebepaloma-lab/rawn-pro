// RAWN PRO — rota estável (versão original funcional)
// Simples e compatível com Vercel Edge, usa apenas gpt-4o-mini

import OpenAI from "openai";

export const runtime = "edge";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Bad request", { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      temperature: 0.7,
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
        } catch (error) {
          console.error("[RAWN PRO] Erro no streaming:", error);
          controller.enqueue(
            encoder.encode("⚠️ Erro ao gerar resposta. Tente novamente.\n")
          );
        } finally {
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
    console.error("[RAWN PRO] Erro geral:", error);
    return new Response("Erro interno no servidor.", { status: 500 });
  }
}
