import { Badge } from "@/components/ui/badge";

interface UrgencyBadgeProps {
  level: string | null;
}

const URGENCY_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "낮음", variant: "secondary" },
  normal: { label: "보통", variant: "default" },
  high: { label: "높음", variant: "destructive" },
  urgent: { label: "긴급", variant: "destructive" },
};

export function UrgencyBadge({ level }: UrgencyBadgeProps) {
  if (!level) return <span className="text-muted-foreground">-</span>;

  const info = URGENCY_MAP[level.toLowerCase()] ?? {
    label: level,
    variant: "outline" as const,
  };

  return <Badge variant={info.variant}>{info.label}</Badge>;
}
