import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:brightness-75 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 active:shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-foreground border border-accent/50 shadow-sm hover:shadow-glow hover:brightness-110 active:brightness-100",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive/50 shadow-sm hover:shadow-md hover:brightness-110 active:brightness-100",
        outline:
          "border border-input/50 bg-background/30 backdrop-blur-xs hover:bg-background/70 hover:border-accent/60 shadow-xs hover:shadow-sm",
        secondary:
          "bg-secondary/80 text-secondary-foreground border border-secondary/50 shadow-sm hover:shadow-md hover:brightness-110",
        ghost:
          "border border-transparent text-accent hover:bg-accent/15 hover:text-accent-foreground",
      },
      size: {
        default: "min-h-10 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-11 rounded-lg px-6 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
