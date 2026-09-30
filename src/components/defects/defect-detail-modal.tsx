"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import { useDefectStore } from "@/store/defectStore";
import { useDefects } from "@/hooks/useDefects";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { formatDateTime, formatCoords } from "@/lib/utils";
import { DEFECT_LABELS } from "@/lib/constants";
import { useConfirmPending } from "@/lib/toast";

export function DefectDetailModal() {
  const selectedDefect = useDefectStore((s) => s.defects.find((d) => d.id === s.selectedDefectId));
  const selectDefect = useDefectStore((s) => s.selectDefect);
  const { resolve } = useDefects();
  const confirm = useConfirmPending();

  if (!selectedDefect) return null;

  const handleResolve = () => {
    confirm({
      title: "Mark as resolved?",
      description: `This will mark "${DEFECT_LABELS[selectedDefect.type]}" (${selectedDefect.id}) as resolved.`,
      confirmLabel: "Resolve",
      onConfirm: () => resolve(selectedDefect.id),
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && selectDefect(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {DEFECT_LABELS[selectedDefect.type] ?? selectedDefect.type}
            <Badge variant={selectedDefect.status === "resolved" ? "muted" : "secondary"}>{selectedDefect.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            {selectedDefect.id} · Detected by {selectedDefect.busId}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-md border">
          <img
            src={selectedDefect.imageUrl}
            alt={`Snapshot of ${DEFECT_LABELS[selectedDefect.type]}`}
            className="aspect-video w-full object-cover"
          />
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">GPS coordinates</dt>
            <dd className="font-mono text-xs font-medium">{formatCoords(selectedDefect.lat, selectedDefect.lng)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Detected at</dt>
            <dd className="text-xs font-medium">{formatDateTime(selectedDefect.detectedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Ward / Zone</dt>
            <dd className="text-xs font-medium">
              {selectedDefect.ward} · {selectedDefect.zone}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Confidence</dt>
            <dd>
              <ConfidenceBadge value={selectedDefect.confidence} />
            </dd>
          </div>
        </dl>

        {selectedDefect.description && (
          <p className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">{selectedDefect.description}</p>
        )}

        <DialogFooter>
          {selectedDefect.status !== "resolved" && (
            <Button onClick={handleResolve}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark as resolved
            </Button>
          )}
          <Button variant="outline" asChild>
            <a href={selectedDefect.imageUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4" /> View snapshot
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}