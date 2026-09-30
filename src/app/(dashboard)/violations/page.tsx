"use client";

import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViolationFeed } from "@/components/violations/violation-feed";
import { ChallanHistoryTable } from "@/components/violations/challan-history-table";
import { useViolations } from "@/hooks/useViolations";

export default function ViolationsPage() {
  const { loadViolations } = useViolations();

  useEffect(() => {
    void loadViolations();
  }, [loadViolations]);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Traffic Violations &amp; E-Challan References</h1>
        <p className="text-sm text-muted-foreground">
          Real-time violation detections with ANPR results. Generate e-challan references (Application ID, location,
          time) without storing any owner or registration data.
        </p>
      </div>

      <Tabs defaultValue="feed">
        <TabsList>
          <TabsTrigger value="feed">Live violation feed</TabsTrigger>
          <TabsTrigger value="history">Challan reference history</TabsTrigger>
        </TabsList>
        <TabsContent value="feed">
          <ViolationFeed />
        </TabsContent>
        <TabsContent value="history">
          <ChallanHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}