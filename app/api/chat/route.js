// RAWN PRO — /api/chat (versão estável)
import OpenAI from "openai";
import { systemPrompt } from "../../lib/system-prompt";
import { buildMemory } from "../../lib/memory-engine";

export const runtime = "edge";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const TEMPERATURE = isNaN(Number(process.env.OPENAI_TEMPERATURE))
  ? 0.6
  : Number(process.env.OPENAI_TEMPERATURE);
const MAX_TOKENS = isNaN(Number(process.env.OPENAI_MAX_TOKENS))
  ? 600
  : Number(process.env.OPENAI_MAX_TOKENS);

async function createCompletionWithRetry(options, retries = 2) {
  let attempt = 0;
  const base = 600; // ms
  while (true) {
    try {
      return await client.chat.completions.create(options);
    } catch (err) {
      const status = err?.status || err?.code;
      const retriable = status === 429 || status === 500 || status === 503;
      if (attempt < retries && retriable) {
        const delay = base * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
        continue;
      }
      throw err;
    }
  }
}

export async function POST(req) {
  try {
    if (!apiKey) {
      return new Response("Missing OpenAI API key", { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const { messages } = body || {};
    if (!messages || !Array.isArray(messages)) {
      return new Response("Bad request", { status: 400 });
    }

    const recent = buildMemory(messages);
    const payload = [{ role: "system", content: systemPrompt }, ...recent];

    const completion = await createCompletionWithRetry({
      model: MODEL,
      stream: true,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      messages: payload,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of completion) {
            const token = part?.choices?.[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch (err) {
          console.error("[RAWN PRO] Erro no stream:", err);
          controller.enqueue(encoder.encode("Erro na resposta.\n"));
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
  } catch (err) {
    console.error("[RAWN PRO] Erro geral:", err);
    const status = err?.status || 500;
    return new Response(JSON.stringify({ error: "Falha no processamento" }), {
      status,
    });
  }
}

