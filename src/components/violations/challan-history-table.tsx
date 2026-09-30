"use client";

import { useEffect } from "react";
import { ExternalLink, Download } from "lucide-react";
import { useViolations } from "@/hooks/useViolations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { VIOLATION_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { exportChallanHistoryPdf } from "@/lib/export";

const STATUS_BADGE: Record<string, "default" | "success" | "warning"> = {
  pending: "warning",
  issued: "success",
  disputed: "default",
};

export function ChallanHistoryTable() {
  const { history, challanFilters, setChallanFilters, loading, loadHistory } = useViolations();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label htmlFor="chstatus" className="text-xs font-medium">
              Status
            </label>
            <Select value={challanFilters.status} onValueChange={(v) => setChallanFilters({ status: v as never })}>
              <SelectTrigger id="chstatus" className="w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="chtype" className="text-xs font-medium">
              Violation
            </label>
            <Select value={challanFilters.type} onValueChange={(v) => setChallanFilters({ type: v as never })}>
              <SelectTrigger id="chtype" className="w-44">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {Object.entries(VIOLATION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled={history.length === 0} onClick={() => exportChallanHistoryPdf(history)}>
          <Download className="mr-1.5 h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application ID</TableHead>
              <TableHead>Plate number</TableHead>
              <TableHead>Violation</TableHead>
              <TableHead>Detected at</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && history.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="No challan references" description="Generate a reference from a violation to see it here." />
                </TableCell>
              </TableRow>
            ) : (
              history.map((ref) => (
                <TableRow key={ref.id}>
                  <TableCell>
                    {ref.eChallanUrl ? (
                      <a
                        href={ref.eChallanUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-primary hover:underline"
                      >
                        {ref.applicationId}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="font-mono text-sm font-semibold">{ref.applicationId}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{ref.plateNumber}</TableCell>
                  <TableCell className="capitalize">{VIOLATION_LABELS[ref.violationType] ?? ref.violationType}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{formatDateTime(ref.detectedAt)}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs">{ref.locationLabel}</TableCell>
                  <TableCell>
                    <ConfidenceBadge value={ref.confidence} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE[ref.status] ?? "default"} className="capitalize">
                      {ref.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Owner and vehicle registration details are managed by the e-challan portal via the Application ID. This
        platform stores only the reference metadata shown above.
      </p>
    </div>
  );
}