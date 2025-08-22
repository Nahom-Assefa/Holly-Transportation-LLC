/**
 * Input Component for Form Fields
 * 
 * @description Accessible input component with consistent styling across the application.
 * Includes proper focus states, validation styling, and responsive design.
 * Supports all native HTML input types and attributes.
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Field Component
 * 
 * @description Styled input component with accessibility features and theme support.
 * Automatically handles focus states, validation styling, and disabled states.
 * 
 * @param {React.ComponentProps<"input">} props - All native input attributes
 * @param {React.Ref<HTMLInputElement>} ref - Forwarded ref to the input element
 * 
 * @example
 * ```tsx
 * // Basic text input
 * <Input type="text" placeholder="Enter your name" />
 * 
 * // Email input with validation
 * <Input type="email" required placeholder="email@example.com" />
 * 
 * // Controlled input
 * <Input 
 *   type="text" 
 *   value={value} 
 *   onChange={(e) => setValue(e.target.value)} 
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
