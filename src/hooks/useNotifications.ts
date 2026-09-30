"use client";

import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { useNotificationStore } from "@/store/notificationStore";
import { getSocketManager } from "@/lib/websocket";
import { reportApiError } from "@/lib/errors";

export function useNotifications() {
  const {
    notifications,
    settings,
    unreadCount,
    setNotifications,
    prependNotification,
    markRead,
    markAllRead,
    updateSettings,
  } = useNotificationStore();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      reportApiError("Could not load notifications", err);
    }
  }, [setNotifications]);

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await api.markNotificationRead(id);
        markRead(id);
      } catch (err) {
        reportApiError("Could not mark notification as read", err);
      }
    },
    [markRead],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      markAllRead();
    } catch (err) {
      reportApiError("Could not mark all notifications as read", err);
    }
  }, [markAllRead]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscribe to the WS channel when available (mock layer falls back to polling).
  useEffect(() => {
    const manager = getSocketManager();
    if (!manager) return;
    const unsubscribe = manager.on("notifications", (event) => {
      if ("category" in (event.event as object)) {
        prependNotification(event.event as Parameters<typeof prependNotification>[0]);
      }
    });
    return unsubscribe;
  }, [prependNotification]);

  return {
    notifications,
    settings,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updateSettings,
  };
}