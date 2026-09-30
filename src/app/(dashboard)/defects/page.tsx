"use client";

import { Route, Wrench, CheckCircle2, Flame } from "lucide-react";
import { useDefects } from "@/hooks/useDefects";
import { MapView } from "@/components/maps/MapView";
import { DefectMarkers } from "@/components/maps/defect-markers";
import { DefectFilters } from "@/components/defects/defect-filters";
import { DefectListSidebar } from "@/components/defects/defect-list-sidebar";
import { DefectDetailModal } from "@/components/defects/defect-detail-modal";
import { DefectExportButton } from "@/components/defects/defect-export-button";
import { StatCard } from "@/components/shared/stat-card";

export default function DefectsPage() {
  const { stats, defects } = useDefects();
  const wards = Array.from(new Set(defects.map((d) => d.ward).filter(Boolean))) as string[];

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Road Condition &amp; Infrastructure Defects</h1>
          <p className="text-sm text-muted-foreground">
            Bus-mounted cameras detect and geo-tag potholes, damaged roads, missing signboards and waterlogging.
          </p>
        </div>
        <DefectExportButton />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total detections" value={stats?.total ?? 0} icon={<Route className="h-4 w-4" />} />
        <StatCard label="Open" value={stats?.open ?? 0} icon={<Wrench className="h-4 w-4" />} />
        <StatCard label="Resolved" value={stats?.resolved ?? 0} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard
          label="Critical"
          value={stats?.critical ?? 0}
          icon={<Flame className="h-4 w-4" />}
          hint="Confidence above threshold"
        />
      </div>

      <DefectFilters wards={wards} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="relative min-h-[420px] overflow-hidden rounded-lg border bg-muted/40">
          <MapView className="absolute inset-0">
            <DefectMarkers />
          </MapView>
          <p className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-card/90 px-2.5 py-1 text-xs text-muted-foreground shadow backdrop-blur">
            Click a marker for defect details
          </p>
        </div>
        <DefectListSidebar />
      </div>

      <DefectDetailModal />
    </div>
  );
}