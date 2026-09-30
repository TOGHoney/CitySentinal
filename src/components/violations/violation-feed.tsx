"use client";

import { useEffect } from "react";
import { useViolations } from "@/hooks/useViolations";
import { ViolationCard } from "./violation-card";
import { ViolationFeedFilters } from "./violation-feed-filters";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { EmptyState } from "@/components/shared/empty-state";

export function ViolationFeed() {
  const { liveViolations, loading, loadViolations } = useViolations();

  useEffect(() => {
    loadViolations();
  }, [loadViolations]);

  return (
    <div className="space-y-4">
      <ViolationFeedFilters />
      <div className="grid gap-4 xl:grid-cols-2">
        {loading && liveViolations.length === 0 ? (
          <div className="xl:col-span-2">
            <ListSkeleton rows={4} />
          </div>
        ) : liveViolations.length === 0 ? (
          <div className="xl:col-span-2">
            <EmptyState title="No violations match" description="Try clearing the filters." />
          </div>
        ) : (
          liveViolations.map((v) => <ViolationCard key={v.id} violation={v} />)
        )}
      </div>
    </div>
  );
}