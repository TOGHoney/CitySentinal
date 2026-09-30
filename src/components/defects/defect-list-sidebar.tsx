"use client";

import { useDefectStore } from "@/store/defectStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { timeAgo, formatCoords, cn } from "@/lib/utils";
import { DEFECT_LABELS } from "@/lib/constants";
import { MapPin } from "lucide-react";

export function DefectListSidebar() {
  const defects = useDefectStore((s) => s.defects);
  const loading = useDefectStore((s) => s.loading);
  const selectedDefectId = useDefectStore((s) => s.selectedDefectId);
  const selectDefect = useDefectStore((s) => s.selectDefect);

  return (
    <div className="flex min-h-[300px] flex-col rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Defects in view</p>
        <p className="text-xs text-muted-foreground">{loading ? "Loading…" : `${defects.length} matching defects`}</p>
      </div>
      <ScrollArea className="max-h-[520px] flex-1">
        {loading ? (
          <div className="p-3">
            <ListSkeleton rows={5} />
          </div>
        ) : defects.length === 0 ? (
          <div className="p-3">
            <EmptyState title="No defects" description="Try adjusting your filters." />
          </div>
        ) : (
          <div className="divide-y">
            {defects.map((d) => (
              <button
                key={d.id}
                onClick={() => selectDefect(d.id)}
                className={cn(
                  "w-full px-4 py-3 text-left transition-colors hover:bg-muted/60",
                  selectedDefectId === d.id && "bg-muted/60 ring-1 ring-inset ring-primary/30",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{DEFECT_LABELS[d.type] ?? d.type}</p>
                  <Badge variant={d.status === "resolved" ? "muted" : d.status === "in-review" ? "warning" : "default"}>
                    {d.status}
                  </Badge>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {formatCoords(d.lat, d.lng)}
                </p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {d.ward} · {timeAgo(d.detectedAt)}
                  </span>
                  <ConfidenceBadge value={d.confidence} />
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}