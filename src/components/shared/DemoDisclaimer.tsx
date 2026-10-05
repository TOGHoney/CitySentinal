import { Info } from "lucide-react";

export function DemoDisclaimer() {
  return (
    <div className="shrink-0 border-t border-blue-900 bg-[#0f2747] px-6 py-3.5">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-white">
        <Info className="h-4 w-4 shrink-0 text-blue-300" />

        <p>
          <span className="font-bold">
            DEMO / PROTOTYPE DATA:
          </span>{" "}
          The information displayed is simulated data for demonstration
          purposes and is not fetched from real-time sources.
        </p>
      </div>
    </div>
  );
}