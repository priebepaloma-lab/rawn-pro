"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá! Eu sou o RAWN PRO 🧠 Como posso te ajudar no treino hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Enviar mensagem
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const botMessage = { role: "assistant", content: data.reply };
      setMessages([...updatedMessages, botMessage]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "⚠️ Houve um erro ao gerar a resposta. Tente novamente.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    // ❗️Sem header/rodapé aqui — o layout.js já fornece.
    <section className="rp-chat">
      <div className="rp-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rp-row ${
              message.role === "user" ? "rp-right" : "rp-left"
            }`}
          >
            <div
              className={`rp-bubble ${
                message.role === "user" ? "rp-user" : "rp-bot"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}

        {/* 💬 “digitando…” */}
        {isTyping && (
          <div className="rp-row rp-left">
            <div className="rp-bubble rp-bot rp-typing flex items-center gap-2">
              <span className="inline-block animate-pulse">💬</span>
              <span className="flex gap-1">
                <span className="animate-bounce delay-[0ms]">.</span>
                <span className="animate-bounce delay-[150ms]">.</span>
                <span className="animate-bounce delay-[300ms]">.</span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="rp-composer">
        <input
          className="rp-input"
          type="text"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className={`rp-send ${!input.trim() ? "rp-send--disabled" : ""}`}
          disabled={!input.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rp-send-ic"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </section>
  );
}
