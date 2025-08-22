/**
 * Textarea Component for Multi-line Text Input
 * 
 * @description Accessible textarea component with consistent styling and proper focus management.
 * Ideal for longer text inputs like comments, descriptions, or message content.
 * Includes responsive text sizing and proper validation states.
 */
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Multi-line Text Input Component
 * 
 * @description Styled textarea with accessibility features and responsive design.
 * Automatically handles focus states, validation styling, and disabled states.
 * 
 * @param {React.ComponentProps<"textarea">} props - All native textarea attributes
 * @param {React.Ref<HTMLTextAreaElement>} ref - Forwarded ref to the textarea element
 * 
 * @example
 * ```tsx
 * // Basic textarea
 * <Textarea placeholder="Enter your message..." />
 * 
 * // Controlled textarea with validation
 * <Textarea 
 *   value={message} 
 *   onChange={(e) => setMessage(e.target.value)}
 *   required
 *   rows={5}
 * />
 * ```
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
