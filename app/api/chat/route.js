// ⚡ RAWN PRO — API Chat Inteligente com Roteamento Automático + Streaming + Performance Boost
import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Função auxiliar: identifica se o prompt é complexo
function isComplexPrompt(text) {
  const len = text.length;
  const complexKeywords = [
    "plano", "semana", "cronograma", "dieta", "avançado",
    "personalizado", "periodização", "estratégia", "maratona",
    "nutrição", "fases", "competição", "progresso", "revisão"
  ];
  const hasComplexWords = complexKeywords.some((w) =>
    text.toLowerCase().includes(w)
  );
  return len > 280 || hasComplexWords;
}

// 🔄 Função principal
export async function POST(req) {
  const start = Date.now();

  try {
    const { messages } = await req.json();
    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // 🔍 Seleciona modelo dinamicamente
    const useGpt4o = isComplexPrompt(lastUserMessage);
    const model = useGpt4o ? "gpt-4o" : "gpt-4o-mini";

    console.log(`🤖 Modelo usado: ${model}`);

    // 🔥 Streaming de resposta
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
          for await (const chunk of completion) {
            const token = chunk.choices?.[0]?.delta?.content || "";
            controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          console.error("⚠️ Erro no stream:", err);
          controller.enqueue(
            encoder.encode("⚠️ Erro ao processar a resposta. Tente novamente.")
          );
        } finally {
          const duration = ((Date.now() - start) / 1000).toFixed(1);
          console.log(`✅ Resposta concluída em ${duration}s (${model})`);
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("❌ Erro geral no endpoint /api/chat:", error);
    return NextResponse.json(
      { error: "Falha ao processar requisição" },
      { status: 500 }
    );
  }
}
