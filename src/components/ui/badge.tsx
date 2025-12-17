import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Whitespace-nowrap: Badges should never wrap.
  "whitespace-nowrap inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-accent/30 bg-accent/10 text-accent shadow-sm hover:bg-accent/15 hover:border-accent/50",
        secondary: "border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/15 shadow-sm",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive shadow-sm hover:bg-destructive/15 hover:border-destructive/50",

        outline: "border border-input/50 bg-background/50 text-foreground hover:border-input/80 hover:bg-background/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants }
