import { Badge } from "@/components/ui/badge";

interface ScoreBadgeProps {
  score: number | null;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  if (score == null) return <span className="text-muted-foreground">-</span>;

  const variant =
    score >= 8 ? "default" : score >= 5 ? "secondary" : "destructive";

  return <Badge variant={variant}>{score}/10</Badge>;
}
