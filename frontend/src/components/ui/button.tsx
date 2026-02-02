import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D342] focus-visible:ring-offset-2 focus-visible:ring-offset-[#292826] disabled:pointer-events-none disabled:opacity-50",
          variant === "default" &&
            "bg-[#F9D342] text-[#292826] hover:bg-[#f7c400]",
          variant === "outline" &&
            "border border-[#F9D342] bg-transparent text-[#F9D342] hover:bg-[#F9D342] hover:text-[#292826]",
          variant === "ghost" &&
            "bg-transparent text-[#F9D342] hover:bg-[#3a3835]",
          variant === "link" &&
            "bg-transparent text-[#F9D342] underline-offset-4 hover:underline",
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-11 px-8",
          size === "icon" && "h-9 w-9",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }

