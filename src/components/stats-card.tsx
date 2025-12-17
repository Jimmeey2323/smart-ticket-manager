import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  delay?: number;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
  delay = 0,
}: StatsCardProps) {
  return (
    <div 
      className={cn(
        "stats-card group animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>
      
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <span className="text-4xl font-bold tabular-nums tracking-tight gradient-text-accent">
            {value}
          </span>
          {subtitle && (
            <span className="text-sm text-muted-foreground/80 mt-0.5">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold mt-2 px-2 py-0.5 rounded-full w-fit",
                trend.isPositive 
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" 
                  : "text-red-600 dark:text-red-400 bg-red-500/10"
              )}
            >
              <span className="text-sm">{trend.isPositive ? "↑" : "↓"}</span>
              {Math.abs(trend.value)}% from last week
            </span>
          )}
        </div>
        <div className={cn(
          "icon-container h-14 w-14 shrink-0 group-hover:scale-110 transition-transform duration-300",
          iconClassName
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}
