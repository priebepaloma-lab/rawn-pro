"use client";

import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [partial, setPartial] = useState("");
  const chatRef = useRef(null);

  // Scroll automático
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, partial]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMsg = { role: "user", content: input };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setPartial("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Falha ao gerar resposta");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        botReply += chunk;
        setPartial(botReply);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: botReply }]);
    } catch (err) {
      console.error("Erro:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Erro ao gerar resposta. Tente novamente." },
      ]);
    } finally {
      setLoading(false);
      setPartial("");
    }
  };

  return (
    <div className="rp-chat">
      <div className="rp-window" ref={chatRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`rp-row ${msg.role === "user" ? "rp-right" : "rp-left"}`}>
            <div className={`rp-bubble ${msg.role === "user" ? "rp-user" : "rp-bot"}`}>
              {msg.content}
            </div>
          </div>
        ))}

        {partial && (
          <div className="rp-row rp-left">
            <div className="rp-bubble rp-bot rp-typing">
              {partial}
              <span className="blinker">▋</span>
            </div>
          </div>
        )}

        {loading && !partial && (
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.4" stroke="currentColor" className="rp-send-ic">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12l15-7.5L13.5 12l6 7.5-15-7.5z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
