"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDefectStore } from "@/store/defectStore";
import { exportDefectsCsv, exportDefectsPdf } from "@/lib/export";

export function DefectExportButton() {
  const defects = useDefectStore((s) => s.defects);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={defects.length === 0}
          onClick={() => exportDefectsCsv(defects)}
        >
          Download CSV report
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={defects.length === 0}
          onClick={() => exportDefectsPdf(defects)}
        >
          Download PDF report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}