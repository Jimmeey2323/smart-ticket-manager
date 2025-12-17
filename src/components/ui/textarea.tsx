import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-input bg-background/50 backdrop-blur-sm px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:border-accent/70 hover:border-input/80 hover:bg-background/65 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted transition-all duration-200 resize-none md:text-sm shadow-xs focus-visible:shadow-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
