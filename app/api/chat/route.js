// app/api/chat/route.js — RAWN PRO ⚡ Streaming + Pré-diálogo inteligente (sem libs novas)
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../../lib/system-prompt";

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response("OPENAI_API_KEY não configurada.", { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { messages, message } = body || {};
    const history =
      messages ?? (message ? [{ role: "user", content: String(message) }] : []);

    if (!history.length) {
      return new Response("Nenhuma mensagem recebida.", { status: 400 });
    }

    // 🔎 Pré-diálogo inteligente
    const last = history[history.length - 1];
    const lastText = (last?.content || "").toLowerCase();
    const isUser = last?.role === "user";

    const gatilhos = [
      "treino",
      "treinamento",
      "planilha",
      "corrida",
      "maratona",
      "musculação",
      "força",
      "hipertrofia",
      "emagrecimento",
      "dieta",
      "alimentação",
      "plano",
    ];

    const primeiraRespostaDoAssistente =
      history.findIndex((m) => m.role === "assistant") === -1;

    const pedePlano = isUser && gatilhos.some((t) => lastText.includes(t));

    if (primeiraRespostaDoAssistente && pedePlano) {
      const texto =
        "👋 Perfeito! Antes de montar seu plano completo, preciso de **3 informações rápidas** para personalizar de verdade:\n\n" +
        "1️⃣ Qual é o seu **nível atual** (iniciante, intermediário ou avançado)?\n" +
        "2️⃣ Quantos **dias/semana** você consegue treinar?\n" +
        "3️⃣ Qual o **foco principal** agora (força, resistência, perda de gordura, ou corrida/maratona) ?\n\n" +
        "Assim que você responder, eu gero o plano completo com progressões, volumes e ajustes.\n" +
        "_⚙️ Leva cerca de **20 segundos** porque o RAWN PRO calcula cargas, intensidades e recuperação de forma automática._";

      // Resposta direta (um único chunk). Seu Chat.js lida bem com isso.
      return new Response(texto, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // ✅ Resposta normal com streaming (como você já usava)
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 800,
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of completion) {
            const delta = part.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (e) {
          console.error("Stream error:", e);
          controller.enqueue(encoder.encode("⚠️ Erro ao gerar resposta."));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("❌ Erro interno na rota /api/chat:", error);
    return new Response("Erro interno no RAWN PRO", { status: 500 });
  }
}
