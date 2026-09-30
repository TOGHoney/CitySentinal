"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { reportApiError } from "@/lib/errors";
import type { AlertThreshold } from "@/types/fleet";

const severityStyle = {
  minor: "border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  critical: "border-red-300/60 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
} as const;

export function AlertConfigView() {
  const [thresholds, setThresholds] = useState<AlertThreshold[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setThresholds(await api.getAlertThresholds());
    } catch (err) {
      setError(reportApiError("Could not load detection thresholds", err));
      setThresholds([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" /> AI detection confidence thresholds
        </CardTitle>
        <CardDescription>
          Detections below these confidence values are queued as low-priority. Thresholds are managed by the platform
          vendor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!thresholds ? (
          <Skeleton className="h-32 w-full" />
        ) : error ? (
          <EmptyState
            title="Could not load detection thresholds"
            description={error}
            action={
              <Button size="sm" variant="outline" onClick={() => void load()}>
                Retry
              </Button>
            }
          />
        ) : thresholds.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alert thresholds configured.</p>
        ) : (
          <ul className="space-y-2">
            {thresholds.map((t) => (
              <li
                key={t.rule}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{t.rule}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Confidence threshold for AI alert classification
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono tabular-nums">
                    {t.value}%
                  </Badge>
                  <Badge className={`capitalize ${severityStyle[t.severity]}`}>{t.severity}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}