/**
 * Badge Component for Status Indicators and Labels
 * 
 * @description Small, versatile badge component for displaying status, categories,
 * or other short information. Built with class-variance-authority for consistent
 * styling across different variants and use cases.
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge variant styles configuration
 * 
 * @description Defines visual variants for the Badge component including
 * default, secondary, destructive, and outline styles.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Props interface for the Badge component
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge Component
 * 
 * @description Displays small status indicators, labels, or categories.
 * Perfect for showing booking status, user roles, or content categories.
 * 
 * @param {BadgeProps} props - Badge properties including variant and HTML attributes
 * 
 * @example
 * ```tsx
 * // Status badge
 * <Badge variant="default">Active</Badge>
 * 
 * // Warning badge
 * <Badge variant="destructive">Cancelled</Badge>
 * 
 * // Outline badge
 * <Badge variant="outline">Pending</Badge>
 * ```
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
