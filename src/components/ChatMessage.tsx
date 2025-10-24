import type { ChatRole } from "@/types/chat";

export type ChatMessageProps = {
  role: ChatRole;
  content: string;
  timestamp: string;
};

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      data-testid="chat-message"
      className={`flex w-full animate-fade-in ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[85%] flex-col gap-2 rounded-3xl px-5 py-4 transition-colors duration-300 sm:max-w-[70%] ${
          isUser
            ? "bg-[#2EB67D] text-white"
            : "bg-white text-[#1E1E1E] border border-[#EAEAEA]"
        }`}
      >
        <p className="text-sm leading-6 tracking-[0.01em] md:text-base">
          {content}
        </p>
        <span
          className={`text-xs uppercase tracking-[0.18em] ${
            isUser ? "text-white/70" : "text-[#B9B9C5]"
          }`}
        >
          {timestamp}
        </span>
      </div>
    </div>
  );
}
