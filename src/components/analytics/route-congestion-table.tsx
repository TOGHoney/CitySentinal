"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CONGESTION_LABELS } from "@/lib/constants";

export function RouteCongestionTable() {
  const { data, loading } = useAnalytics();
  const routes = data?.topRoutes ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Congestion by route</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading && !data ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead className="w-24">Avg speed</TableHead>
                <TableHead className="w-32">Congestion index</TableHead>
                <TableHead className="w-24">Vehicles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((r) => {
                const level =
                  r.congestionIndex >= 0.8 ? "severe" : r.congestionIndex >= 0.6 ? "high" : r.congestionIndex >= 0.4 ? "moderate" : "low";
                return (
                  <TableRow key={r.routeId}>
                    <TableCell className="font-medium">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary/40" />
                      {r.routeName}
                    </TableCell>
                    <TableCell className="text-sm">{r.avgSpeed} km/h</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(r.congestionIndex * 100, 100)}%`, backgroundColor: r.congestionIndex >= 0.8 ? "#ef4444" : "#f97316" }}
                          />
                        </div>
                        <span className="text-xs tabular-nums">{r.congestionIndex.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{r.vehicleCount.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">{CONGESTION_LABELS[level]}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}