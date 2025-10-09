// app/page.js
"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Olá! Eu sou o RAWN PRO 💬 Como posso te ajudar no treino hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage() {
    if (!input.trim() || sending) return;

    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      // cria placeholder para stream
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let streamed = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const rest = prev.slice(0, -1);
          return [...rest, { ...last, content: streamed }];
        });
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ops — tive um problema para responder agora. Podemos tentar de novo? 🙂",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className="rp-chat">
      {/* área de mensagens */}
      <div className="rp-window">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rp-row ${m.role === "user" ? "rp-right" : "rp-left"}`}
          >
            <div
              className={`rp-bubble ${
                m.role === "user" ? "rp-user" : "rp-bot"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="rp-row rp-left">
            <div className="rp-bubble rp-bot rp-typing">Digitando…</div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* composer fixo no final do cartão */}
      <form
        className="rp-composer"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="rp-input"
          type="text"
          placeholder="Digite sua mensagem…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={sending}
        />

        <button
          type="submit"
          className={`rp-send ${sending ? "rp-send--disabled" : ""}`}
          aria-label="Enviar"
          disabled={sending}
        >
          {/* Ícone de aviãozinho (paper plane) */}
          <svg
            viewBox="0 0 24 24"
            className="rp-send-ic"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </section>
  );
}
