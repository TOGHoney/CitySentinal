"use client";

import { AlertTriangle, Bell, MapPin, ShieldAlert, Search, ChevronRight, CheckCheck, Settings2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { NOTIFICATION_CATEGORY_LABELS } from "@/lib/constants";
import type { AppNotification } from "@/types/notification";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const severityIcon: Record<AppNotification["severity"], typeof AlertTriangle> = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: MapPin,
};

const severityColor: Record<AppNotification["severity"], string> = {
  critical: "text-red-500",
  warning: "text-amber-500",
  info: "text-sky-500",
};

function NotificationItem({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: (n: AppNotification) => void;
}) {
  const Icon = severityIcon[notification.severity];
  return (
    <button
      onClick={() => onOpen(notification)}
      className={cn(
        "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
        !notification.read && "bg-primary/5",
      )}
    >
      <span className="mt-0.5 shrink-0">
        <Icon className={cn("h-4 w-4", severityColor[notification.severity])} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{notification.title}</span>
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </span>
        <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
        <span className="mt-1 block text-[11px] text-muted-foreground/70">
          {timeAgo(notification.timestamp)} · {NOTIFICATION_CATEGORY_LABELS[notification.category]}
        </span>
      </span>
      <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
    </button>
  );
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, settings, updateSettings } = useNotifications();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const router = useRouter();

  const handleOpen = (n: AppNotification) => {
    void markAsRead(n.id);
    if (n.link?.href) router.push(n.link.href);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unreadCount} unread`}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between px-3 py-2.5">
            <DropdownMenuLabel className="px-0 text-sm">Notifications</DropdownMenuLabel>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={() => void markAllAsRead()} className="text-xs">
                  <CheckCheck className="mr-1 h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
            ) : (
              notifications.slice(0, 25).map((n) => <NotificationItem key={n.id} notification={n} onOpen={handleOpen} />)
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="cursor-pointer">
            <Settings2 className="mr-2 h-4 w-4" />
            Notification settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(
              [
                ["criticalIncident", "critical-incident"],
                ["violation", "violation"],
                ["defect", "defect"],
                ["investigation", "investigation"],
              ] as const
            ).map(([key, category]) => (
              <div key={key} className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor={key} className="cursor-pointer">
                  {NOTIFICATION_CATEGORY_LABELS[category]}
                </Label>
                <Switch
                  id={key}
                  checked={settings[key]}
                  onCheckedChange={(v) => updateSettings({ [key]: v })}
                />
              </div>
            ))}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="secondary" className="font-normal">
                {Object.values(settings).filter(Boolean).length}/4 categories enabled
              </Badge>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}