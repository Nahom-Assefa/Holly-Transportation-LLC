import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for combining and merging CSS class names
 * 
 * @description Combines multiple class names using clsx and merges conflicting Tailwind classes
 * using tailwind-merge. This ensures proper precedence for conditional styling.
 * 
 * @param {...ClassValue[]} inputs - Class names, objects, or arrays to merge
 * @returns {string} The merged class name string
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn("text-red-500", "font-bold") // "text-red-500 font-bold"
 * 
 * // Conditional classes
 * cn("base-class", isActive && "active-class") // "base-class active-class" or "base-class"
 * 
 * // Tailwind merge prevents conflicts
 * cn("text-red-500", "text-blue-500") // "text-blue-500" (last one wins)
 * 
 * // With component props
 * <Button className={cn("default-styles", className)} />
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
