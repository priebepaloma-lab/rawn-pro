// app/api/chat/route.js — RAWN PRO • Streaming em tempo real (final)
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { SYSTEM_PROMPT } from "../../lib/system-prompt";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Rota principal (POST)
export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensagem vazia." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Cria resposta em streaming real
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });

    // ✅ Converte stream OpenAI para streaming de texto
    const stream = OpenAIStream(response);

    // ✅ Retorna streaming em tempo real para o frontend
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error("❌ Erro na rota /api/chat:", err);
    return new Response(JSON.stringify({ error: "Erro interno no servidor." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
