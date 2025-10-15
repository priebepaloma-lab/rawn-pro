"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "@/app/chat/hooks/useUserProfile";

type ProfileSheetProps = {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSubmit: (profile: Partial<UserProfile>) => void;
};

const LEVEL_OPTIONS = [
  "iniciante",
  "intermediario",
  "avancado",
  "profissional",
];

const THEMES: Array<{ label: string; value: UserProfile["theme"] }> = [
  { label: "Sistema", value: "system" },
  { label: "Claro", value: "light" },
  { label: "Escuro", value: "dark" },
];

export function ProfileSheet({ open, onClose, profile, onSubmit }: ProfileSheetProps) {
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    if (open) {
      setLocalProfile(profile);
    }
  }, [open, profile]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(localProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm px-4 pb-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1E1E1E]">
            Meu Perfil RAWN
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#0A84FF] hover:underline"
          >
            Fechar
          </button>
        </div>

        <fieldset className="space-y-4 text-sm text-[#1E1E1E]">
          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-[#B9B9C5]">
              Nome
            </span>
            <input
              className="rounded-2xl border border-[#E0E0E0] px-4 py-2 focus:border-[#0A84FF] focus:outline-none"
              value={localProfile.name}
              onChange={(event) =>
                setLocalProfile((prev) => ({ ...prev, name: event.target.value }))
              }
              maxLength={48}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-[#B9B9C5]">
              Idade
            </span>
            <input
              type="number"
              min={12}
              max={90}
              className="rounded-2xl border border-[#E0E0E0] px-4 py-2 focus:border-[#0A84FF] focus:outline-none"
              value={localProfile.age ?? ""}
              onChange={(event) =>
                setLocalProfile((prev) => ({
                  ...prev,
                  age: event.target.value ? Number(event.target.value) : null,
                }))
              }
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-[#B9B9C5]">
              Nivel de pratica
            </span>
            <select
              className="rounded-2xl border border-[#E0E0E0] px-4 py-2 focus:border-[#0A84FF] focus:outline-none"
              value={localProfile.practiceLevel ?? ""}
              onChange={(event) =>
                setLocalProfile((prev) => ({
                  ...prev,
                  practiceLevel: event.target.value || null,
                }))
              }
            >
              <option value="">Selecione</option>
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-[#B9B9C5]">
              Esportes principais
            </span>
            <input
              className="rounded-2xl border border-[#E0E0E0] px-4 py-2 focus:border-[#0A84FF] focus:outline-none"
              placeholder="Corrida, mobilidade, condicionamento"
              value={localProfile.sports?.join(", ") ?? ""}
              onChange={(event) =>
                setLocalProfile((prev) => ({
                  ...prev,
                  sports: event.target.value
                    .split(",")
                    .map((sport) => sport.trim())
                    .filter(Boolean),
                }))
              }
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-[#B9B9C5]">
              Local preferido
            </span>
            <input
              className="rounded-2xl border border-[#E0E0E0] px-4 py-2 focus:border-[#0A84FF] focus:outline-none"
              value={localProfile.trainingLocation ?? ""}
              onChange={(event) =>
                setLocalProfile((prev) => ({
                  ...prev,
                  trainingLocation: event.target.value || null,
                }))
              }
              placeholder="Ar livre, academia, casa..."
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.28em] text-[#B9B9C5]">
              Tema visual
            </span>
            <div className="flex gap-2">
              {THEMES.map((themeOption) => (
                <button
                  type="button"
                  key={themeOption.value}
                  onClick={() =>
                    setLocalProfile((prev) => ({
                      ...prev,
                      theme: themeOption.value,
                    }))
                  }
                  className={`flex-1 rounded-2xl border px-4 py-2 text-sm transition ${
                    localProfile.theme === themeOption.value
                      ? "border-[#0A84FF] bg-[#0A84FF]/10 text-[#0A84FF]"
                      : "border-[#E0E0E0] text-[#1E1E1E]"
                  }`}
                >
                  {themeOption.label}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#B9B9C5]/60 px-4 py-2 text-sm text-[#1E1E1E]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-full bg-[#2EB67D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#25a36f]"
          >
            Guardar ajustes
          </button>
        </div>
      </form>
    </div>
  );
}
