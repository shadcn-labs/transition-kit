import { cn } from "@/lib/utils";

export const ProBadge = ({ className }: { className?: string }) => (
  <span
    data-slot="pro-badge"
    className={cn(
      "bg-brand text-brand-foreground inline-flex h-4 items-center rounded-sm px-1.5 text-[10px] leading-none font-medium",
      className
    )}
  >
    Pro
  </span>
);
