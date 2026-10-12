"use client";

import { Link } from "@tanstack/react-router";
import { useCallback, useRef } from "react";

import type { ArrowLeftIconHandle } from "@/components/animated-icons/arrow-left";
import { ArrowLeftIcon } from "@/components/animated-icons/arrow-left";
import type { ArrowRightIconHandle } from "@/components/animated-icons/arrow-right";
import { ArrowRightIcon } from "@/components/animated-icons/arrow-right";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const DocsNavLink = ({
  href,
  children,
  className,
  tooltip,
  direction,
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  tooltip?: { title: string; icon: React.ReactNode };
  /** Which arrow to show: before the label (previous) or after it (next). */
  direction: "previous" | "next";
}) => {
  const iconRef = useRef<ArrowLeftIconHandle | ArrowRightIconHandle>(null);

  const handleMouseEnter = useCallback(() => {
    iconRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    iconRef.current?.stopAnimation();
  }, []);

  const link = (
    <Button
      variant="secondary"
      size={size}
      className={cn("shadow-none", className)}
      asChild
      sound="click"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <Link
        to={href}
        viewTransition={{
          types: [direction === "next" ? "nav-forward" : "nav-back"],
        }}
      >
        {direction === "previous" && <ArrowLeftIcon ref={iconRef} />}
        {children}
        {direction === "next" && <ArrowRightIcon ref={iconRef} />}
      </Link>
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent className="pr-2 pl-3">
          <div className="flex items-center gap-3">
            {tooltip.title}
            {tooltip.icon && <Kbd>{tooltip.icon}</Kbd>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
};
