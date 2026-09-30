"use client";

import { useState } from "react";
import { Camera, MapPin, Clock3, FileText, Loader2, Maximize2 } from "lucide-react";
import type { Violation } from "@/types/violation";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { VIOLATION_LABELS } from "@/lib/constants";
import { formatDateTime, maskPlate } from "@/lib/utils";
import { useViolations } from "@/hooks/useViolations";
import { EvidenceModal } from "./evidence-modal";

export function ViolationCard({ violation }: { violation: Violation }) {
  const { generateChallan } = useViolations();
  const [generating, setGenerating] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<{
    title: string;
    imageUrl: string;
    videoUrl?: string;
  } | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateChallan(violation.id);
      if (res) setReference(res.applicationId);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="capitalize">
              {VIOLATION_LABELS[violation.type] ?? violation.type}
            </Badge>
            <Badge variant="secondary" className="font-mono">
              {violation.busId}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">{formatDateTime(violation.detectedAt)}</span>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-[1fr_110px] gap-3">
            <button
              onClick={() =>
                setEvidence({
                  title: `Vehicle snapshot · ${violation.anpr.plateNumber}`,
                  imageUrl: violation.vehicleSnapshot.imageUrl,
                  videoUrl: violation.evidenceVideoUrl,
                })
              }
              className="group relative overflow-hidden rounded-md border bg-muted"
              aria-label="Open vehicle snapshot"
            >
              <img
                src={violation.vehicleSnapshot.imageUrl}
                alt="Violation vehicle"
                className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute right-2 top-2 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            </button>
            <button
              onClick={() =>
                setEvidence({
                  title: `License plate crop · ${violation.anpr.plateNumber}`,
                  imageUrl: violation.vehicleSnapshot.plateCropUrl,
                })
              }
              className="group relative overflow-hidden rounded-md border bg-muted"
              aria-label="Open plate crop"
            >
              <img
                src={violation.vehicleSnapshot.plateCropUrl}
                alt="License plate crop"
                className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute right-1.5 top-1.5 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                Plate
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-base font-bold tracking-wide">{violation.anpr.plateNumber}</p>
              <p className="text-[11px] text-muted-foreground">Masked preview: {maskPlate(violation.anpr.plateNumber)}</p>
            </div>
            <ConfidenceBadge value={violation.anpr.confidence} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {violation.locationLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" /> {new Date(violation.detectedAt).toLocaleTimeString("en-IN")}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center gap-2">
          <Button size="sm" onClick={handleGenerate} disabled={generating || !!reference}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {reference ? "Reference created" : "Generate E-Challan Reference"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEvidence({
            title: `Vehicle snapshot · ${violation.anpr.plateNumber}`,
            imageUrl: violation.vehicleSnapshot.imageUrl,
            videoUrl: violation.evidenceVideoUrl,
          })}>
            <Camera className="mr-1 h-4 w-4" /> Evidence
          </Button>
          {reference && (
            <span className="ml-auto font-mono text-xs font-semibold text-primary">ID: {reference}</span>
          )}
        </CardFooter>
      </Card>

      <EvidenceModal media={evidence} onClose={() => setEvidence(null)} />
    </>
  );
}