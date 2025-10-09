// ==========================================================
// 🔱 RAWN PRO – API Chat Route
// Inteligência de Conversa com OpenAI + System Prompt
// Versão 2025 – Compatível com Next.js 15 e Streaming
// ==========================================================

import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../../lib/system-prompt"; // ✅ Caminho corrigido (relativo)

// ==========================================================
// 🧠 Configuração do Cliente OpenAI
// ==========================================================
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==========================================================
// 🚀 Rota Principal – Comunicação com o Modelo GPT
// ==========================================================
export async function POST(req) {
  try {
    // Recebe mensagens do frontend (Chat)
    const { messages } = await req.json();

    // Requisição ao modelo com System Prompt do RAWN PRO
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // rápido, coerente e otimizado
      temperature: 0.8,
      max_tokens: 800,
      stream: true,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...messages,
      ],
    });

    // ========================================================
    // 📡 STREAMING – Envia o texto conforme o modelo responde
    // ========================================================
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) controller.enqueue(encoder.encode(content));
          }
        } catch (err) {
          console.error("Erro no streaming:", err);
          controller.enqueue(encoder.encode("⚠️ Erro ao gerar resposta."));
        } finally {
          controller.close();
        }
      },
    });

    // Retorna o stream da resposta para o frontend
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("❌ Erro interno na rota /api/chat:", error);
    return new Response("Erro interno no RAWN PRO", { status: 500 });
  }
}
