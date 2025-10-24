"use client";

type PrivacySheetProps = {
  open: boolean;
  onClose: () => void;
  sharePerformanceData: boolean;
  shareSleepInsights: boolean;
  onUpdate: (settings: {
    sharePerformanceData?: boolean;
    shareSleepInsights?: boolean;
  }) => void;
  onResetLocal: () => void;
  isResetting: boolean;
};

export function PrivacySheet({
  open,
  onClose,
  sharePerformanceData,
  shareSleepInsights,
  onUpdate,
  onResetLocal,
  isResetting,
}: PrivacySheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-sm px-4 pb-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1E1E1E]">
            Privacidade
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#0A84FF] hover:underline"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-5 text-sm text-[#1E1E1E]">
          <p className="text-[#6C6C7A]">
            O RAWN PRO armazena apenas resumos anonimizados para evolucao do
            protocolo. Suas conversas integrais vivem somente neste dispositivo.
          </p>

          <label className="flex items-start gap-3 rounded-2xl border border-[#E0E0E0] p-4">
            <input
              type="checkbox"
              checked={sharePerformanceData}
              onChange={(event) =>
                onUpdate({ sharePerformanceData: event.target.checked })
              }
              className="mt-1 h-4 w-4 accent-[#2EB67D]"
            />
            <div>
              <p className="font-medium">Compartilhar dados agregados</p>
              <p className="text-xs text-[#6C6C7A]">
                Permite que o RAWN ajuste protocolos de forma estatistica, sem
                identificar voce.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-[#E0E0E0] p-4">
            <input
              type="checkbox"
              checked={shareSleepInsights}
              onChange={(event) =>
                onUpdate({ shareSleepInsights: event.target.checked })
              }
              className="mt-1 h-4 w-4 accent-[#2EB67D]"
            />
            <div>
              <p className="font-medium">Consentir insights de recuperacao</p>
              <p className="text-xs text-[#6C6C7A]">
                Habilita correlacoes anonimas para sugerir estrategias de descanso.
              </p>
            </div>
          </label>

          <div className="rounded-2xl bg-[#F8F9FA] p-4 text-xs text-[#6C6C7A]">
            <p>
              Os dados podem ser resetados a qualquer momento. Isso apaga perfil,
              mensagens locais e resumo contextual armazenado neste dispositivo.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={onResetLocal}
            disabled={isResetting}
            className="rounded-full border border-[#FF5A5F] px-4 py-2 text-sm font-semibold text-[#FF5A5F] transition hover:bg-[#FF5A5F]/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResetting ? "Resetando..." : "Resetar dados locais"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#1E1E1E] px-4 py-2 text-sm font-semibold text-white"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
