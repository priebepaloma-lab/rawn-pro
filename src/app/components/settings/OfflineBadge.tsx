"use client";

type OfflineBadgeProps = {
  isOffline: boolean;
};

export function OfflineBadge({ isOffline }: OfflineBadgeProps) {
  if (!isOffline) {
    return (
      <span className="flex items-center gap-2 text-xs text-[#2EB67D]">
        <span className="h-2 w-2 rounded-full bg-[#2EB67D]" />
        Conectado ao RAWN Cloud
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2 text-xs text-[#FF5A5F]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF5A5F]" />
      Modo offline · sincroniza ao voltar
    </span>
  );
}
