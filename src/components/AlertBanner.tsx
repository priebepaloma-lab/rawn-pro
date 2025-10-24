import type { ChatAlertData } from "@/types/chat";

type AlertBannerProps = {
  alert: ChatAlertData;
};

const VARIANT_BG: Record<string, string> = {
  risco: "from-[#0A84FF] to-[#4DA3FF]",
  foco: "from-[#2EB67D] to-[#61D19A]",
  default: "from-[#0A84FF] to-[#4DA3FF]",
};

export function AlertBanner({ alert }: AlertBannerProps) {
  const gradient =
    VARIANT_BG[alert.tipo.toLowerCase()] ?? VARIANT_BG.default;

  return (
    <div className="ml-0 flex max-w-xl items-center gap-3 rounded-3xl bg-white p-[1px] shadow-[0_12px_28px_rgba(30,30,30,0.08)] sm:ml-[72px]">
      <div
        className={`flex w-full items-center gap-3 rounded-[calc(1.5rem-1px)] bg-gradient-to-r ${gradient} px-4 py-3`}
      >
        <svg
          className="h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9V13" />
          <path d="M12 17H12.01" />
          <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" />
        </svg>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.36em] text-white/80">
            {alert.tipo}
          </span>
          <span className="text-sm leading-6 text-white">{alert.texto}</span>
        </div>
      </div>
    </div>
  );
}
