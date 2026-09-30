"use client";

import { CalendarRange, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";

const RANGES = {
  "24h": { from: new Date(Date.now() - 24 * 3_600_000).toISOString(), label: "Last 24 hours" },
  "7d": { from: new Date(Date.now() - 7 * 24 * 3_600_000).toISOString(), label: "Last 7 days" },
  "30d": { from: new Date(Date.now() - 30 * 24 * 3_600_000).toISOString(), label: "Last 30 days" },
} as const;

type RangeKey = keyof typeof RANGES;

export function TimeRangePicker() {
  const { range, load, loading } = useAnalytics();

  const current: RangeKey = Object.keys(RANGES).find(
    (k) => RANGES[k as RangeKey].from === range.from,
  ) as RangeKey;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => load({ ...range, to: new Date().toISOString() })} disabled={loading} aria-label="Refresh data">
        <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
      </Button>
      <Select
        value={current}
        onValueChange={(r) => {
          const key = r as RangeKey;
          load({ from: RANGES[key].from, to: new Date().toISOString(), label: RANGES[key].label });
        }}
      >
        <SelectTrigger className="w-44">
          <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(RANGES) as RangeKey[]).map((k) => (
            <SelectItem key={k} value={k}>
              {RANGES[k].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}