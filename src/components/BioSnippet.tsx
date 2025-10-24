import type { ReactNode } from "react";
import type { ChatBiometricData } from "@/types/chat";

type BioSnippetProps = {
  data: ChatBiometricData;
};

const metrics: Array<{
  key: keyof ChatBiometricData;
  label: string;
  unit: string;
  icon: ReactNode;
}> = [
  {
    key: "fc",
    label: "Frequência cardíaca",
    unit: "bpm",
    icon: (
      <svg
        className="h-4 w-4 text-[#0A84FF]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 12.75C3.1 10.5 3.7 7.63 5.8 5.95C7.55 4.55 10.02 4.62 11.7 6.09L12 6.35L12.3 6.09C13.98 4.62 16.45 4.55 18.2 5.95C20.3 7.63 20.9 10.5 19.5 12.75L12 20.25L4.5 12.75Z" />
      </svg>
    ),
  },
  {
    key: "sono",
    label: "Sono reparador",
    unit: "h",
    icon: (
      <svg
        className="h-4 w-4 text-[#2EB67D]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 17C6.12 17 7 17.88 7 19C7 20.12 6.12 21 5 21C3.88 21 3 20.12 3 19C3 17.88 3.88 17 5 17Z" />
        <path d="M12 16C13.66 16 15 17.34 15 19C15 20.66 13.66 22 12 22C10.34 22 9 20.66 9 19C9 17.34 10.34 16 12 16Z" />
        <path d="M19 14C20.66 14 22 15.34 22 17C22 18.66 20.66 20 19 20C17.34 20 16 18.66 16 17C16 15.34 17.34 14 19 14Z" />
        <path d="M6 4H10" />
        <path d="M8 2V6" />
        <path d="M14 4H18" />
        <path d="M16 2V6" />
      </svg>
    ),
  },
  {
    key: "variabilidade",
    label: "Variabilidade HRV",
    unit: "ms",
    icon: (
      <svg
        className="h-4 w-4 text-[#B9B9C5]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12L8.5 6L12 12L15 8L20 16" />
        <path d="M20 16H15" />
      </svg>
    ),
  },
  {
    key: "energia",
    label: "Energia percebida",
    unit: "%",
    icon: (
      <svg
        className="h-4 w-4 text-[#0A84FF]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L6 12H12L10 22L18 10H12L14 2H12Z" />
      </svg>
    ),
  },
];

export function BioSnippet({ data }: BioSnippetProps) {
  return (
    <div className="ml-0 w-full max-w-xs rounded-3xl border border-[#E8E9EC] bg-white/90 px-4 py-3 shadow-[0_12px_26px_rgba(30,30,30,0.05)] backdrop-blur sm:ml-[72px]">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-[#B9B9C5]">
          BIO FEEDBACK
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ key, label, unit, icon }) => {
          const value = data[key];
          if (value === undefined || value === null) return null;
          return (
            <div
              key={key}
              className="flex flex-col gap-1 rounded-2xl bg-[#F8F9FA] p-3"
            >
              <div className="flex items-center gap-2 text-xs text-[#74748F]">
                {icon}
                <span>{label}</span>
              </div>
              <span className="text-[1.25rem] font-semibold text-[#1E1E1E]">
                {value}
                <span className="ml-1 text-sm font-medium text-[#B9B9C5]">
                  {unit}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
