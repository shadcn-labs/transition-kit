import { CssIcon, ShadcnIcon, TsIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const ReactIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="-11.5 -10.23 23 20.46"
    fill="none"
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <circle r="2.05" fill="currentColor" stroke="none" />
    <ellipse rx="11" ry="4.2" />
    <ellipse rx="11" ry="4.2" transform="rotate(60)" />
    <ellipse rx="11" ry="4.2" transform="rotate(120)" />
  </svg>
);

const TailwindIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35C13.39 10.84 14.5 12 17 12c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.61 7.16 14.5 6 12 6Zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.39 16.84 9.5 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.61 13.16 9.5 12 7 12Z" />
  </svg>
);

const STACK = [
  { Icon: ReactIcon, label: "React 19.3" },
  { Icon: CssIcon, label: "View Transitions" },
  { Icon: ShadcnIcon, label: "shadcn" },
  { Icon: TailwindIcon, label: "Tailwind" },
  { Icon: TsIcon, label: "TypeScript" },
];
export const BuiltOn = ({ className }: { className?: string }) => (
  <section
    className={cn(
      "rail grid divide-y md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:divide-x md:divide-y-0",
      className
    )}
  >
    <p className="text-muted-foreground flex items-center px-4 py-4 text-sm sm:py-5 md:px-8">
      <span>
        No animation library. Just{" "}
        <span className="text-foreground font-medium">
          React and the platform
        </span>
        .
      </span>
    </p>
    <ul className="grid grid-cols-5 divide-x">
      {STACK.map(({ Icon, label }) => (
        <li
          key={label}
          className="group hover:bg-muted/40 flex flex-col items-center justify-center gap-2 px-1 py-4 text-center transition-colors sm:py-5"
        >
          <Icon className="text-muted-foreground group-hover:text-brand size-5 transition-colors" />
          <span className="text-muted-foreground group-hover:text-foreground sr-only text-[0.7rem] leading-tight transition-colors sm:not-sr-only">
            {label}
          </span>
        </li>
      ))}
    </ul>
  </section>
);
