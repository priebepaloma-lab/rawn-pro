// app/api/chat/route.js
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../../lib/system-prompt";

export const runtime = "edge"; // melhora latência no Vercel

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Nenhuma mensagem válida recebida." }),
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.8,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    });

    const reply = completion.choices?.[0]?.message?.content || "⚠️ Erro na geração da resposta.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Erro interno na rota /api/chat:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno no RAWN PRO." }),
      { status: 500 }
    );
  }
}
