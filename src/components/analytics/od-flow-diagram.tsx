"use client";

import { ArrowRight } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ODFlowDiagram() {
  const { data, loading } = useAnalytics();
  const flows = data?.odFlows ?? [];
  const max = Math.max(...flows.map((f) => f.volume), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Origin–Destination flows</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <Skeleton className="h-52 w-full" />
        ) : flows.length === 0 ? (
          <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">No flow data</p>
        ) : (
          <ul className="space-y-2.5">
            {flows.slice(0, 8).map((f, i) => (
              <li key={`${f.from}-${f.to}`} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-1 font-medium">
                    <span className="truncate max-w-28">{f.from}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-28">{f.to}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{f.volume.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", i % 2 === 0 ? "bg-primary" : "bg-primary/50")}
                    style={{ width: `${(f.volume / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}