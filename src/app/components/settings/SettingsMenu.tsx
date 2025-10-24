"use client";

import { useState } from "react";
import type { UserProfile } from "@/app/chat/hooks/useUserProfile";
import { ProfileSheet } from "./ProfileSheet";
import { PrivacySheet } from "./PrivacySheet";
import { OfflineBadge } from "./OfflineBadge";

type SettingsMenuProps = {
  profile: UserProfile;
  onProfileChange: (profile: Partial<UserProfile>) => void;
  onPrivacyChange: (settings: {
    sharePerformanceData?: boolean;
    shareSleepInsights?: boolean;
  }) => void;
  onResetLocalData: () => Promise<void>;
  isOffline: boolean;
};

export function SettingsMenu({
  profile,
  onProfileChange,
  onPrivacyChange,
  onResetLocalData,
  isOffline,
}: SettingsMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [privacySheetOpen, setPrivacySheetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await onResetLocalData();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Abrir menu RAWN"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0E0] bg-white text-[#1E1E1E] shadow-sm transition hover:border-[#0A84FF] hover:text-[#0A84FF]"
      >
        ⋯
      </button>

      {isMenuOpen ? (
        <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-[#E0E0E0] bg-white/95 p-3 text-sm text-[#1E1E1E] shadow-lg backdrop-blur">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setProfileSheetOpen(true);
                setIsMenuOpen(false);
              }}
              className="rounded-2xl px-4 py-2 text-left transition hover:bg-[#F3F4F6]"
            >
              Meu Perfil
              <span className="block text-xs text-[#6C6C7A]">
                {profile.practiceLevel ?? "equilibrado"} · {profile.sports?.join(", ") ?? "multimodal"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrivacySheetOpen(true);
                setIsMenuOpen(false);
              }}
              className="rounded-2xl px-4 py-2 text-left transition hover:bg-[#F3F4F6]"
            >
              Privacidade
              <span className="block text-xs text-[#6C6C7A]">
                Dados locais + resumo etico
              </span>
            </button>

            <div className="rounded-2xl bg-[#F8F9FA] px-4 py-2">
              <OfflineBadge isOffline={isOffline} />
            </div>
          </div>
        </div>
      ) : null}

      <ProfileSheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        profile={profile}
        onSubmit={onProfileChange}
      />

      <PrivacySheet
        open={privacySheetOpen}
        onClose={() => setPrivacySheetOpen(false)}
        sharePerformanceData={profile.sharePerformanceData}
        shareSleepInsights={profile.shareSleepInsights}
        onUpdate={onPrivacyChange}
        onResetLocal={handleReset}
        isResetting={resetting}
      />
    </div>
  );
}
