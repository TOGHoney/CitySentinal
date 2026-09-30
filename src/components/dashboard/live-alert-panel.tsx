"use client";

import { ShieldAlert, ShieldOff } from "lucide-react";
import { useFleetStore } from "@/store/fleetStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function LiveAlertPanel() {
  const alerts = useFleetStore((s) => s.alerts);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          Live Alerts
          <Badge variant="secondary" className="ml-1">
            {alerts.length}
          </Badge>
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {alerts.length === 0 ? (
            <p className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
              <ShieldOff className="h-6 w-6 text-muted-foreground/50" />
              No active alerts. All buses operating normally.
            </p>
          ) : (
            alerts.map((alert, i) => (
              <div key={`${alert.timestamp}-${i}`} className="flex gap-3 px-4 py-3">
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    alert.severity === "critical" ? "bg-red-500" : "bg-amber-500",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.type.replace(/-/g, " ")} · {timeAgo(alert.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}