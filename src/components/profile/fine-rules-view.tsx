"use client";

import { useCallback, useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";
import { reportApiError } from "@/lib/errors";
import { VIOLATION_LABELS } from "@/lib/constants";
import type { FineRule } from "@/types/violation";

export function FineRulesView() {
  const [rules, setRules] = useState<FineRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRules(await api.getFineRules());
    } catch (err) {
      setError(reportApiError("Could not load fine rules", err));
      setRules([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Fine structure (referenced by E-Challan portal)</CardTitle>
        <CardDescription>
          Indicative penalty amounts shown in the challan Application ID workflow. Final billing is handled by the
          e-challan portal.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {!rules ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error ? (
          <div className="p-4">
            <EmptyState
              title="Could not load fine rules"
              description={error}
              action={
                <Button size="sm" variant="outline" onClick={() => void load()}>
                  Retry
                </Button>
              }
            />
          </div>
        ) : rules.length === 0 ? (
          <EmptyState title="No fine rules configured" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Violation</TableHead>
                <TableHead className="w-32">Fine amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.violationType}>
                  <TableCell className="font-medium capitalize">
                    {VIOLATION_LABELS[rule.violationType] ?? rule.label}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
                      <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatCurrency(rule.fineAmount)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[280px] text-xs text-muted-foreground">{rule.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}