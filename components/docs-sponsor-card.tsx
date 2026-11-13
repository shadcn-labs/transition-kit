import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { MAINTAINERS } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
export const DocsSponsorCard = ({ className }: { className?: string }) => (
  <div className={className}>
    <Link
      to={ROUTES.SPONSOR}
      viewTransition={{ types: ["nav-forward"] }}
      className="group hover:bg-muted/30 focus-visible:ring-ring/50 flex flex-col gap-3 px-4 py-5 transition-colors focus-visible:ring-inset outline-none focus-visible:ring-[3px]"
    >
      <div className="flex -space-x-2">
        {MAINTAINERS.map((maintainer) => (
          <img
            key={maintainer.login}
            src={maintainer.avatar}
            alt={maintainer.name}
            width={32}
            height={32}
            loading="lazy"
            className="ring-background size-8 rounded-full ring-2"
          />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Keep transition-kit free</p>
        <p className="text-muted-foreground text-[0.8rem] leading-relaxed">
          Two maintainers build every transition in the open. Sponsorships fund
          the next ones.
        </p>
      </div>
      <span className="text-brand inline-flex items-center gap-1 text-[0.8rem] font-medium">
        Back the project
        <ArrowRightIcon
          aria-hidden="true"
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  </div>
);
