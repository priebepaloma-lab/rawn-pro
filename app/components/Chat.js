// app/components/Chat.js — RAWN PRO ⚡ Chat com streaming em tempo real
"use client";

import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);
  const [partialResponse, setPartialResponse] = useState("");

  // 🔽 Scroll automático para última mensagem
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, partialResponse]);

  // Envio de mensagem
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setPartialResponse("");

    try {
      // Envia requisição streaming
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error("Falha na resposta da IA");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botMsg = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        botMsg += chunk;
        setPartialResponse(botMsg);
      }

      // Salva resposta completa
      setMessages((prev) => [...prev, { role: "assistant", content: botMsg }]);
    } catch (err) {
      console.error("Erro:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Ocorreu um erro. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
      setPartialResponse("");
    }
  };

  return (
    <div className="rp-chat">
      <div className="rp-window" ref={chatWindowRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rp-row ${msg.role === "user" ? "rp-right" : "rp-left"}`}
          >
            <div className={`rp-bubble ${msg.role === "user" ? "rp-user" : "rp-bot"}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Texto sendo gerado em tempo real */}
        {partialResponse && (
          <div className="rp-row rp-left">
            <div className="rp-bubble rp-bot rp-typing">
              {partialResponse}
              <span className="blinker">▋</span>
            </div>
          </div>
        )}

        {loading && !partialResponse && (
          <div className="rp-row rp-left">
            <div className="rp-bubble rp-bot rp-typing">Digitando...</div>
          </div>
        )}
      </div>

      <form className="rp-composer" onSubmit={sendMessage}>
        <input
          className="rp-input"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="rp-send" disabled={loading}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.4"
            stroke="currentColor"
            className="rp-send-ic"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12l15-7.5L13.5 12l6 7.5-15-7.5z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
