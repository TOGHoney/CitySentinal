"use client";

import { useEffect } from "react";
import { Download, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { InvestigationSearchForm } from "@/components/investigation/investigation-search-form";
import { FootageResultsList } from "@/components/investigation/footage-results-list";
import { MultiCamPlayer } from "@/components/investigation/multi-cam-player";
import { CaseFileBuilder } from "@/components/investigation/case-file-builder";
import { EmptyState } from "@/components/shared/empty-state";
import { useInvestigation } from "@/hooks/useInvestigation";
import { exportInvestigationResultPdf } from "@/lib/export";

export default function InvestigationPage() {
  const { results, loading, searchParams } = useInvestigation();

  useEffect(() => {
    if (searchParams && results.length === 0) {
      // leave results empty until the next explicit search
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Witness Footage Investigation</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ShieldAlert className="h-4 w-4" /> Search vehicles that passed through a geo-fenced area in a time window and
          review their dash-cam footage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <InvestigationSearchForm />
          <CaseFileBuilder />
        </div>

        <Tabs defaultValue="results" className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="player">Player</TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              disabled={results.length === 0 || loading}
              onClick={() => results.length > 0 && exportInvestigationResultPdf(results)}
            >
              <Download className="mr-1.5 h-4 w-4" /> Export results
            </Button>
          </div>
          <TabsContent value="results" className="mt-0">
            {results.length === 0 && !loading ? (
              <div className="rounded-lg border bg-card p-3">
<EmptyState
                title="Run a search to begin"
                description="Draw the geo-fence on the map, set the time window, and search for vehicles in range."
              />
              </div>
            ) : (
              <FootageResultsList />
            )}
          </TabsContent>
          <TabsContent value="player" className="mt-0">
            <MultiCamPlayer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}