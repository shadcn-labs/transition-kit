import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getItem, items } from "@/registry/items";

const announced =
  items.find((item) => item.isNew && item.kind === "style") ??
  getItem("theme/clock-wipe");

export const Announcement = () =>
  announced ? (
    <Badge asChild variant="secondary" className="rounded-full">
      <Link to="/docs/$" params={{ _splat: `components/${announced.name}` }}>
        New: {announced.title} {announced.group} transition <ArrowRightIcon />
      </Link>
    </Badge>
  ) : null;
