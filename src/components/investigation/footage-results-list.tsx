"use client";

import { Bus, Route, Clock3 } from "lucide-react";
import { useInvestigation } from "@/hooks/useInvestigation";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, relativeTimeLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function FootageResultsList() {
  const { results, selectedBusId, selectBus, loading } = useInvestigation();

  if (loading && results.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-3">
        <ListSkeleton rows={4} />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-3">
        <EmptyState
          title="No matching vehicles"
          description="Adjust the search area or timestamps, or provide a vehicle number."
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {results.length} vehicle{results.length > 1 ? "s" : ""} in area
      </p>
      {results.map((r) => {
        const online = r.camerasAvailable.filter((c) => c.online).length;
        const selected = selectedBusId === r.busId;
        return (
          <button
            key={r.busId}
            onClick={() => selectBus(selected ? null : r.busId)}
            className={cn(
              "w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/60",
              selected && "bg-muted/60 ring-1 ring-inset ring-primary/40",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 font-mono text-sm font-bold">
                <Bus className="h-4 w-4 text-primary" /> {r.vehicleNumber}
              </p>
              <Badge variant={selected ? "default" : "outline"} className="font-mono">
                {r.busId}
              </Badge>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Route className="h-3 w-3" /> {r.routeName} ({r.routeId})
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" /> In zone {relativeTimeLabel(r.durationInZoneSec)}
              </span>
              <span className="text-right">
                {online}/{r.camerasAvailable.length} cameras online
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Entered {formatDateTime(r.enteredAt)} · Exited {formatDateTime(r.exitedAt)}
            </p>
          </button>
        );
      })}
    </div>
  );
}