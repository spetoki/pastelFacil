
"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

// Componentes da Timeline

const Timeline = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn("flex flex-col", className)} {...props} />
  )
);
Timeline.displayName = "Timeline";

const TimelineItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("relative flex flex-col gap-3 pb-8 pl-6", className)}
      {...props}
    />
  )
);
TimelineItem.displayName = "TimelineItem";

const TimelineConnector = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("absolute left-0 top-0 h-full w-px bg-border", className)}
      {...props}
    />
  )
);
TimelineConnector.displayName = "TimelineConnector";


const TimelineHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-3", className)}
      {...props}
    />
  )
);
TimelineHeader.displayName = "TimelineHeader";

const TimelineIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute left-[-5px] z-10 flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineIcon.displayName = "TimelineIcon";

const TimelineTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  )
);
TimelineTitle.displayName = "TimelineTitle";


const TimelineDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
TimelineDescription.displayName = "TimelineDescription";

const TimelineContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      />
    )
  );
TimelineContent.displayName = "TimelineContent";


export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineTitle,
  TimelineDescription,
  TimelineContent,
};
