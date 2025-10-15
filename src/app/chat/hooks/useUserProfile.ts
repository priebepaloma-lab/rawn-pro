"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ThemeOption = "light" | "dark" | "system";

export type UserProfile = {
  name: string;
  age?: number | null;
  practiceLevel?: string | null;
  sports?: string[];
  trainingLocation?: string | null;
  language?: string;
  theme?: ThemeOption;
  sharePerformanceData: boolean;
  shareSleepInsights: boolean;
};

const STORAGE_KEY = "rawn_pro_user_profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "Convidado RAWN",
  age: null,
  practiceLevel: null,
  sports: [],
  trainingLocation: null,
  language: "pt-BR",
  theme: "system",
  sharePerformanceData: false,
  shareSleepInsights: false,
};

function readProfile(): UserProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      sports: Array.isArray(parsed.sports) ? parsed.sports : [],
    };
  } catch (error) {
    console.warn("RAWN PRO profile read failure", error);
    return DEFAULT_PROFILE;
  }
}

function writeProfile(profile: UserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn("RAWN PRO profile write failure", error);
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    setProfile(readProfile());
  }, []);

  useEffect(() => {
    writeProfile(profile);
  }, [profile]);

  const updateProfile = useCallback((next: Partial<UserProfile>) => {
    setProfile((current) => {
      const merged: UserProfile = {
        ...current,
        ...next,
        sports: Array.isArray(next.sports) ? next.sports : current.sports,
      };
      return merged;
    });
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    writeProfile(DEFAULT_PROFILE);
  }, []);

  const profileSummary = useMemo(() => {
    const sportsLabel = profile.sports?.length
      ? profile.sports.join(", ")
      : "multi-modal";
    return `${profile.practiceLevel ?? "equilibrado"} · ${sportsLabel}`;
  }, [profile.practiceLevel, profile.sports]);

  return {
    profile,
    profileSummary,
    updateProfile,
    resetProfile,
  } as const;
}
