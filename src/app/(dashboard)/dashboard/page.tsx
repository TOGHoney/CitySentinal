"use client";

import { Bus, AlertTriangle, Radar, Gauge } from "lucide-react";
import { useFleet } from "@/hooks/useFleet";
import { MapView } from "@/components/maps/MapView";
import { BusMarkers } from "@/components/maps/fleet-bus-markers";
import { MapLayerToggle } from "@/components/maps/map-layer-toggle";
import { LiveAlertPanel } from "@/components/dashboard/live-alert-panel";
import { BusDetailModal } from "@/components/dashboard/bus-detail-modal";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";

export default function DashboardPage() {
  const { buses, stats, loading } = useFleet();

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Fleet Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Real-time positions of active buses with camera status and alert conditions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {loading && !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Active buses" value={stats?.total ?? buses.length} icon={<Bus className="h-4 w-4" />} />
            <StatCard
              label="Operating normally"
              value={stats?.normal ?? 0}
              icon={<Radar className="h-4 w-4" />}
              hint="Green markers"
            />
            <StatCard
              label="Attention required"
              value={(stats?.minor ?? 0) + (stats?.critical ?? 0)}
              icon={<AlertTriangle className="h-4 w-4" />}
              hint="Orange / red markers"
            />
            <StatCard label="Avg fleet speed" value={stats?.avgSpeed ? `${stats.avgSpeed} km/h` : "—"} icon={<Gauge className="h-4 w-4" />} />
          </>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="relative min-h-[420px] overflow-hidden rounded-lg border bg-muted/40">
          <MapView className="absolute inset-0">
            <BusMarkers />
          </MapView>
          <MapLayerToggle className="absolute left-3 top-3 z-10" />
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-lg border bg-card/90 px-3 py-2 text-xs text-card-foreground shadow backdrop-blur">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Minor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical
            </span>
          </div>
        </div>

        <LiveAlertPanel />
      </div>

      <BusDetailModal />
    </div>
  );
}