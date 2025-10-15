export type UserProfileDraft = {
  userId: string;
  age?: number;
  level?: string;
  sport?: string;
  metadata?: Record<string, string>;
};

export type UserProfileStore = {
  createOrUpdate: (profile: UserProfileDraft) => Promise<void>;
  fetch: (userId: string) => Promise<UserProfileDraft | null>;
};

// Placeholder for future Supabase-backed implementation.
