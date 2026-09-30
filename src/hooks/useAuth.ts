"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const router = useRouter();
  const { user, status, hydrate, login, logout } = useAuthStore();

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(
    async (username: string, password: string) => {
      const res = await api.login({ username, password });
      login(res.user);
      toast.success("Signed in", `Welcome back, ${res.user.name}`);
      // Hard navigation guarantees the freshly written `cs_session` cookie is sent
      // on the request, so middleware authorizes the dashboard reliably.
      window.location.assign("/dashboard");
      return res;
    },
    [login],
  );

  const signOut = useCallback(async () => {
    await logout();
    toast.info("Signed out");
    router.push("/login");
  }, [logout, router]);

  const requestPasswordReset = useCallback(async (username: string) => {
    const res = await api.forgotPassword(username);
    toast.success("Reset link sent", res.message);
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    await api.resetPassword({ token, password });
    toast.success("Password updated", "You can now sign in with your new password.");
  }, []);

  return {
    user,
    isAuthenticated: status === "authenticated",
    isHydrated: status !== "idle",
    signIn,
    signOut,
    requestPasswordReset,
    resetPassword,
  };
}