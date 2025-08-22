/**
 * Tabs Components for Tabbed Interfaces
 * 
 * @description Complete set of tab components built on Radix UI primitives.
 * Provides accessible tab navigation with keyboard support, focus management,
 * and smooth transitions. Perfect for organizing content into sections.
 */
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Root Tabs Container
 * 
 * @description Main tabs container that manages tab state and accessibility.
 * Use this as the wrapper for all tab-related components.
 */
const Tabs = TabsPrimitive.Root

/**
 * Tabs List Component
 * 
 * @description Container for tab triggers with consistent styling and layout.
 * Automatically handles keyboard navigation and focus management.
 * 
 * @example
 * ```tsx
 * <Tabs defaultValue="profile">
 *   <TabsList>
 *     <TabsTrigger value="profile">Profile</TabsTrigger>
 *     <TabsTrigger value="settings">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="profile">Profile content</TabsContent>
 *   <TabsContent value="settings">Settings content</TabsContent>
 * </Tabs>
 * ```
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * Tab Trigger Component
 * 
 * @description Individual tab button that users click to switch between content panels.
 * Includes proper accessibility attributes and visual feedback for active state.
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * Tab Content Component
 * 
 * @description Container for content that appears when a tab is selected.
 * Automatically handles visibility and accessibility attributes.
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
