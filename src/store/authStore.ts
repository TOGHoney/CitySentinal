"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";
import { getCachedUser, cacheUser, clearSession, isSessionExpired } from "@/lib/auth";

interface AuthState {
  user: AuthUser | null;
  status: "idle" | "authenticated" | "unauthenticated";
  hydrated: boolean;
  hydrate: () => void;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",
      hydrated: false,
      hydrate: () => {
        const cached = getCachedUser();
        const expired = isSessionExpired();
        if (cached && !expired) {
          set({ user: cached, status: "authenticated", hydrated: true });
        } else {
          if (expired) clearSession();
          set({ user: null, status: "unauthenticated", hydrated: true });
        }
      },
      login: (user) => {
        cacheUser(user);
        set({ user, status: "authenticated", hydrated: true });
      },
      logout: async () => {
        set({ user: null, status: "unauthenticated" });
        clearSession();
      },
    }),
    {
      name: "cs-auth",
      partialize: (state) => ({ user: state.user }),
      skipHydration: true,
    },
  ),
);