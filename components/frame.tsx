import { cn } from "@/lib/utils";

export const Frame = ({
  label,
  action,
  tone = "default",
  className,
  innerClassName,
  children,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  label?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "default" | "brand";
  innerClassName?: string;
}) => (
  <section
    data-slot="frame"
    data-tone={tone}
    className={cn(
      "bezel flex min-w-0 flex-col",
      tone === "brand" && "border-brand/40 bg-brand/8",
      className
    )}
    {...props}
  >
    {label || action ? (
      <div
        data-slot="frame-header"
        className="flex min-h-8 items-center justify-between gap-3 px-2.5 py-1 text-xs font-medium"
      >
        <span className="text-muted-foreground flex min-w-0 items-center gap-2">
          {label}
        </span>
        {action}
      </div>
    ) : null}
    <div
      data-slot="frame-content"
      className={cn("bezel-inner flex flex-1 flex-col p-5", innerClassName)}
    >
      {children}
    </div>
  </section>
);
