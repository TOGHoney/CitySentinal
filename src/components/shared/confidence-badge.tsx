import { Badge } from "@/components/ui/badge";

export function ConfidenceBadge({ value }: { value: number }) {
  const variant = value >= 90 ? "success" : value >= 70 ? "warning" : "destructive";
  const label = value >= 90 ? "High" : value >= 70 ? "Medium" : "Low";
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge variant={variant} className="font-mono">
        {value.toFixed(0)}%
      </Badge>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </span>
  );
}