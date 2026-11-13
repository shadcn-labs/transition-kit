import { cn } from "@/lib/utils";

const NOTCH =
  "bg-background absolute hidden size-4 rounded-[4px] border sm:block sm:size-5 sm:rounded-sm";

export const SectionDivider = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      "bg-background relative z-10 h-6 border-y sm:h-16",
      className
    )}
  >
    <div className="relative mx-auto h-full w-full max-w-6xl border-x">
      <div
        className={cn(NOTCH, "-top-2 left-0 -translate-x-1/2 sm:-top-2.5")}
      />
      <div
        className={cn(
          NOTCH,
          "bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
        )}
      />
      <div
        className={cn(NOTCH, "-top-2 right-0 translate-x-1/2 sm:-top-2.5")}
      />
      <div
        className={cn(
          NOTCH,
          "right-0 bottom-0 translate-x-1/2 translate-y-1/2"
        )}
      />
    </div>
  </div>
);
