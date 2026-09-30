"use client";

import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDefectStore } from "@/store/defectStore";
import { DEFECT_LABELS } from "@/lib/constants";

export function DefectFilters({ wards }: { wards: string[] }) {
  const { filters, setFilters } = useDefectStore();

  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="dtype" className="text-xs">
            Defect type
          </Label>
          <Select value={filters.type} onValueChange={(v) => setFilters({ type: v as never })}>
            <SelectTrigger id="dtype">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(DEFECT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="dstatus" className="text-xs">
            Status
          </Label>
          <Select value={filters.status} onValueChange={(v) => setFilters({ status: v as never })}>
            <SelectTrigger id="dstatus">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-review">In review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="dward" className="text-xs">
            Ward
          </Label>
          <Select value={filters.ward ?? "all"} onValueChange={(v) => setFilters({ ward: v === "all" ? undefined : v })}>
            <SelectTrigger id="dward">
              <SelectValue placeholder="All wards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All wards</SelectItem>
              {Array.from(new Set(wards)).map((ward) => (
                <SelectItem key={ward} value={ward}>
                  {ward}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="dq" className="text-xs">
            Detected from
          </Label>
          <Input
            id="dq"
            type="date"
            value={filters.from?.slice(0, 10) ?? ""}
            onChange={(e) => setFilters({ from: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
          />
        </div>
      </div>
    </div>
  );
}