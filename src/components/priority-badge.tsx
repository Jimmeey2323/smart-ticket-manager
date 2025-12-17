import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-400/40 dark:border-red-400/60 shadow-sm hover:shadow-md hover:bg-red-500/20 transition-all animate-glow",
  },
  high: {
    label: "High",
    className: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-400/40 dark:border-orange-400/60 shadow-sm hover:shadow-md hover:bg-orange-500/20 transition-all",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border border-yellow-400/40 dark:border-yellow-400/60 shadow-sm hover:shadow-md hover:bg-yellow-500/20 transition-all",
  },
  low: {
    label: "Low",
    className: "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-400/40 dark:border-green-400/60 shadow-sm hover:shadow-md hover:bg-green-500/20 transition-all",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[(priority ?? '').toLowerCase()] || priorityConfig.medium;
  
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs no-default-hover-elevate no-default-active-elevate", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
