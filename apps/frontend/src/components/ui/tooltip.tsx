import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delayDuration?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function Tooltip({
  children,
  content,
  side = "top",
  align = "center",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 p-2 text-sm rounded-md shadow-md bg-secondary text-secondary-foreground",
            "animate-in fade-in-0 zoom-in-95",
            {
              "bottom-full mb-2": side === "top",
              "top-0 left-full ml-2": side === "right",
              "top-full mt-2": side === "bottom",
              "top-0 right-full mr-2": side === "left",
            },
            {
              "left-1/2 -translate-x-1/2":
                align === "center" && (side === "top" || side === "bottom"),
              "top-1/2 -translate-y-1/2":
                align === "center" && (side === "left" || side === "right"),
              "left-0":
                align === "start" && (side === "top" || side === "bottom"),
              "top-0":
                align === "start" && (side === "left" || side === "right"),
              "right-0":
                align === "end" && (side === "top" || side === "bottom"),
              "bottom-0":
                align === "end" && (side === "left" || side === "right"),
            },
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip as TooltipProvider, Tooltip as TooltipRoot };

// For compatibility with existing code
export const TooltipTrigger: React.FC<React.ComponentProps<"div">> = ({
  children,
  ...props
}) => {
  return <div {...props}>{children}</div>;
};

export const TooltipContent: React.FC<React.ComponentProps<"div">> = ({
  children,
  ...props
}) => {
  return <div {...props}>{children}</div>;
};
