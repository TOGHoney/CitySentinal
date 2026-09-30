"use client";

import { SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useViolationStore } from "@/store/violationStore";
import { VIOLATION_LABELS } from "@/lib/constants";

export function ViolationFeedFilters() {
  const { filters, setFilters } = useViolationStore();

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-1.5 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
      </div>
      <div className="min-w-[160px] flex-1 space-y-1 sm:max-w-[220px]">
        <Label htmlFor="vtype" className="text-xs">
          Violation type
        </Label>
        <Select value={filters.type} onValueChange={(v) => setFilters({ type: v as never })}>
          <SelectTrigger id="vtype">
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
      <div className="space-y-1">
        <Label htmlFor="vfrom" className="text-xs">
          From
        </Label>
        <Input
          id="vfrom"
          type="date"
          className="w-36"
          value={filters.from?.slice(0, 10) ?? ""}
          onChange={(e) => setFilters({ from: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="vto" className="text-xs">
          To
        </Label>
        <Input
          id="vto"
          type="date"
          className="w-36"
          value={filters.to?.slice(0, 10) ?? ""}
          onChange={(e) => setFilters({ to: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
        />
      </div>
    </div>
  );
}