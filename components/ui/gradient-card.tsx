import * as React from "react"
import { cn } from "@/lib/utils"

export interface GradientCardProps extends React.ComponentProps<"div"> {
  gradient?: "primary" | "success" | "accent";
}

export function GradientCard({
  className,
  gradient = "primary",
  children,
  ...props
}: GradientCardProps) {
  const gradients = {
    primary: "from-primary/10 via-primary/5 to-transparent",
    success: "from-success/10 via-success/5 to-transparent",
    accent: "from-accent/20 via-accent/10 to-transparent"
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card",
        "shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          gradients[gradient]
        )}
      />
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
