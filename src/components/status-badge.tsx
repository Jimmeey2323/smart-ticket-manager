import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-400/40 dark:border-blue-400/60 shadow-sm hover:shadow-md hover:bg-blue-500/20 transition-all",
  },
  assigned: {
    label: "Assigned",
    className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/40 dark:border-purple-400/60 shadow-sm hover:shadow-md hover:bg-purple-500/20 transition-all",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border border-yellow-400/40 dark:border-yellow-400/60 shadow-sm hover:shadow-md hover:bg-yellow-500/20 transition-all animate-pulse-glow",
  },
  pending_customer: {
    label: "Pending Customer",
    className: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-400/40 dark:border-orange-400/60 shadow-sm hover:shadow-md hover:bg-orange-500/20 transition-all",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-400/40 dark:border-green-400/60 shadow-sm hover:shadow-md hover:bg-green-500/20 transition-all",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-500/15 text-gray-700 dark:text-gray-300 border border-gray-400/40 dark:border-gray-400/60 shadow-sm hover:shadow-md hover:bg-gray-500/20 transition-all",
  },
  reopened: {
    label: "Reopened",
    className: "bg-red-500/15 text-red-700 dark:text-red-300 border border-red-400/40 dark:border-red-400/60 shadow-sm hover:shadow-md hover:bg-red-500/20 transition-all animate-glow",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[(status ?? '').toLowerCase()] || statusConfig.new;
  
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs no-default-hover-elevate no-default-active-elevate", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
