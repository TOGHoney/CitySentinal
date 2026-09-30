"use client";

import { useEffect, useState } from "react";
import { FolderPlus, Plus, Trash2, Download, Film } from "lucide-react";
import { useInvestigation } from "@/hooks/useInvestigation";
import { generateCaseId } from "@/store/investigationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTime } from "@/lib/utils";
import { exportCaseMetadataPdf } from "@/lib/export";
import { toast } from "@/lib/toast";
import type { CaseClip, InvestigationCase } from "@/types/investigation";

export function CaseFileBuilder() {
  const { draftCases, selectedBusId, results, upsertCase, addClipToCase, deleteCase, requestClip } = useInvestigation();
  const selectedBus = results.find((r) => r.busId === selectedBusId);
  const [title, setTitle] = useState("");

  const createCase = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const caseItem: InvestigationCase = {
      id: generateCaseId(),
      title: title.trim(),
      createdAt: now,
      updatedAt: now,
      searchParams: {
        bbox: selectedBus ? { west: 0, south: 0, east: 0, north: 0 } : { west: 0, south: 0, east: 0, north: 0 },
        from: now,
        to: now,
      },
      clips: [],
      notes: "",
    };
    upsertCase(caseItem);
    setTitle("");
    toast.success("Case file created");
  };

  const addClip = async (caseId: string) => {
    if (!selectedBus) return;
    const from = selectedBus.enteredAt;
    const to = selectedBus.exitedAt;
    const cameras = selectedBus.camerasAvailable.filter((c) => c.online).map((c) => c.position);
    const now = Date.now();
    const clip: CaseClip = {
      id: `CLIP-${now.toString(36).toUpperCase()}`,
      busId: selectedBus.busId,
      vehicleNumber: selectedBus.vehicleNumber,
      title: `Clip from ${selectedBus.vehicleNumber}`,
      notes: "",
      tags: ["manual"],
      from,
      to,
      cameras,
    };
    const res = await requestClip({ busId: selectedBus.busId, from, to, cameras });
    if (res) {
      addClipToCase(caseId, clip);
      toast.success(`Clip requested (${res.clipId}) and added to case`);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <FolderPlus className="h-3.5 w-3.5" /> Case file builder
      </p>

      <div className="flex gap-2">
        <Input
          placeholder="Case title (e.g. Hit-and-run probe — Race Course)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createCase()}
        />
        <Button variant="secondary" size="icon" onClick={createCase} disabled={!title.trim()} aria-label="Create case">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {draftCases.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Create a case, then select a vehicle in the results to add footage clips to it.
        </p>
      ) : (
        <ScrollArea className="max-h-[320px]">
          <div className="space-y-2 pr-3">
            {draftCases.map((c) => (
              <div key={c.id} className="rounded-md border p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.id} · Updated {formatDateTime(c.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={!selectedBus}
                      aria-label="Add selected clip"
                      onClick={() => addClip(c.id)}
                    >
                      <Film className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Export case metadata"
                      onClick={() => exportCaseMetadataPdf(c)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      aria-label="Delete case"
                      onClick={() => deleteCase(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {c.clips.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.clips.map((clip) => (
                      <Badge key={clip.id} variant="outline" className="font-mono text-[10px]">
                        {clip.title}
                        {clip.cameras.length > 0 && <> · {clip.cameras.join(", ")}</>}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Label className="text-[11px] text-muted-foreground">
        Clip requests are approved by the fleet consent workflow; the Application ID is returned immediately.
      </Label>
    </div>
  );
}