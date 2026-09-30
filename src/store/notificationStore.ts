"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppNotification, NotificationSettings } from "@/types/notification";

const DEFAULT_SETTINGS: NotificationSettings = {
  criticalIncident: true,
  violation: true,
  defect: true,
  investigation: true,
};

interface NotificationState {
  notifications: AppNotification[];
  settings: NotificationSettings;
  unreadCount: number;
  setNotifications: (n: AppNotification[]) => void;
  prependNotification: (n: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  updateSettings: (s: Partial<NotificationSettings>) => void;
  computeUnread: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      settings: DEFAULT_SETTINGS,
      unreadCount: 0,
      setNotifications: (notifications) => set({ notifications, unreadCount: notifications.filter((n) => !n.read).length }),
      prependNotification: (n) =>
        set((s) => {
          const notifications = [n, ...s.notifications.filter((x) => x.id !== n.id)].slice(0, 50);
          return { notifications, unreadCount: notifications.filter((x) => !x.read).length };
        }),
      markRead: (id) =>
        set((s) => {
          const notifications = s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
          return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
        }),
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 })),
      updateSettings: (settings) => set((s) => ({ settings: { ...s.settings, ...settings } })),
      computeUnread: () => get().notifications.filter((n) => !n.read && settingsEnabled(n.category, get().settings)).length,
    }),
    {
      name: "cs-notifications",
      partialize: (state) => ({ notifications: state.notifications, settings: state.settings }),
      skipHydration: true,
    },
  ),
);

function settingsEnabled(category: AppNotification["category"], s: NotificationSettings): boolean {
  switch (category) {
    case "critical-incident":
      return s.criticalIncident;
    case "violation":
      return s.violation;
    case "defect":
      return s.defect;
    case "investigation":
      return s.investigation;
  }
}