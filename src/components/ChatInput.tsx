"use client";

import { FormEvent, useState } from "react";

type ChatInputProps = {
  onSubmit: (message: string) => Promise<void> | void;
  disabled?: boolean;
  isLoading?: boolean;
};

export function ChatInput({ onSubmit, disabled, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    try {
      await onSubmit(trimmed);
      setValue("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-[28px] border border-[#DADADA] bg-white p-3 shadow-[0_8px_18px_rgba(30,30,30,0.05)] transition focus-within:border-[#2EB67D]"
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={
          isLoading ? "RAWN está analisando..." : "Escreva sua mensagem..."
        }
        className="flex-1 border-none bg-transparent text-sm md:text-base leading-6 text-[#1E1E1E] placeholder:text-[#B9B9C5] focus:outline-none"
        aria-label="Mensagem para o RAWN PRO"
        autoComplete="off"
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0A84FF] transition hover:bg-[#006fdd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A84FF] disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Enviar mensagem"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 stroke-white"
          strokeWidth={1.5}
        >
          <path
            d="M3.75 12L20.25 3.75L16.5 20.25L12 13.5L7.5 17.25L9 12L3.75 12Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}
