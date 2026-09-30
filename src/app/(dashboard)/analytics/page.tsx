"use client";

import { useEffect } from "react";
import { AlertTriangle, Gauge, Download } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { TimeRangePicker } from "@/components/analytics/time-range-picker";
import { CongestionMap } from "@/components/analytics/congestion-map";
import { HourlyTrafficChart } from "@/components/analytics/hourly-traffic-chart";
import { RouteCongestionTable } from "@/components/analytics/route-congestion-table";
import { ODFlowDiagram } from "@/components/analytics/od-flow-diagram";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { exportAnalyticsPdf } from "@/lib/export";
import { CONGESTION_LABELS } from "@/lib/constants";

export default function AnalyticsPage() {
  const { data, range, loading, error, load } = useAnalytics();

  useEffect(() => {
    if (!data) void load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const peak = data?.hourly.reduce((m, h) => (h.vehicleCount > m.vehicleCount ? h : m), data?.hourly[0]);
  const severeCount = data?.zones.filter((z) => z.level === "severe").length ?? 0;
  const avgSpeed =
    data && data.topRoutes.length > 0
      ? Math.round(data.topRoutes.reduce((sum, r) => sum + r.avgSpeed, 0) / data.topRoutes.length)
      : 0;

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Congestion &amp; Traffic Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Heatmap, hourly trends and origin–destination flows derived from camera density estimates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TimeRangePicker />
          <Button
            variant="outline"
            size="icon"
            disabled={!data}
            onClick={() => data && exportAnalyticsPdf(data, range.label)}
            aria-label="Export PDF report"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-destructive">{error}</span>
          <Button size="sm" variant="outline" className="ml-auto" disabled={loading} onClick={() => void load(range)}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Severe zones" value={loading && !data ? "-" : severeCount} icon={<Gauge className="h-4 w-4" />} hint={CONGESTION_LABELS.severe} />
        <StatCard label="Average speed" value={loading && !data ? "-" : `${avgSpeed} km/h`} icon={<Gauge className="h-4 w-4" />} />
        <StatCard label="Peak hour" value={peak ? peak.hour : "-"} icon={<Gauge className="h-4 w-4" />} hint={peak ? `${peak.vehicleCount.toLocaleString("en-IN")} vehicles` : undefined} />
        <StatCard label="Total zone volume" value={loading && !data ? "-" : (data?.zones.reduce((s, z) => s + z.vehicleCount, 0) ?? 0).toLocaleString("en-IN")} icon={<Gauge className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CongestionMap />
        </div>
        <div className="space-y-4">
          <RouteCongestionTable />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HourlyTrafficChart />
        </div>
        <ODFlowDiagram />
      </div>
    </div>
  );
}