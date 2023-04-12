"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { cn } from "~/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("flex-shrink-0 flex border-b border-gray-300", className)}
    {...props}
  />
));

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    className={cn(
      "inline-flex min-w-[100px] items-center justify-center text-sm font-medium text-slate-700 transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-underline flex-shrink-0 px-4 py-2 select-none cursor-pointer dark:text-slate-400 data-[state=active]:dark:bg-slate-900 data-[state=active]:dark:text-slate-100",
      className
    )}
    {...props}
    ref={ref}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    className={cn("mt-2 rounded-md border border-slate-200 p-6", className)}
    {...props}
    ref={ref}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;

export default Tabs;

export { TabsList, TabsTrigger, TabsContent };
