"use client";

import { MountainIcon, SailboatIcon, TentTreeIcon } from "lucide-react";

import {
  ExpandableCard,
  ExpandableCardBody,
  ExpandableCardContent,
  ExpandableCardDescription,
  ExpandableCardMedia,
  ExpandableCardTitle,
  ExpandableCardTrigger,
} from "@/registry/ui/expandable-card";

const TRIPS = [
  {
    art: "from-neutral-950 via-neutral-700 to-neutral-400",
    body: "Three days of glacier walks, hot springs and long blue evenings. Small group, local guide, every night in a cabin with a view of the fjord.",
    icon: MountainIcon,
    place: "Iceland · 3 days",
    title: "Northern Lights",
  },
  {
    art: "from-neutral-500 via-neutral-700 to-neutral-950",
    body: "Hop between quiet islands on a traditional boat. Swim in coves you can only reach by sea and eat whatever the morning catch brings in.",
    icon: SailboatIcon,
    place: "Greece · 5 days",
    title: "Aegean Sailing",
  },
  {
    art: "from-neutral-800 via-neutral-600 to-neutral-900",
    body: "Hike ancient forest trails by day and fall asleep under redwoods. Gear, permits and campfire dinners are all included.",
    icon: TentTreeIcon,
    place: "California · 4 days",
    title: "Redwood Camp",
  },
];

export const ExpandableCardDemo = () => (
  <div className="grid w-full max-w-2xl grid-cols-1 gap-4 @md:grid-cols-3">
    {TRIPS.map(({ art, body, icon: Icon, place, title }) => (
      <ExpandableCard key={title}>
        <ExpandableCardTrigger>
          <ExpandableCardMedia
            className={`flex items-center justify-center bg-linear-to-br ${art}`}
          >
            <Icon className="size-10 text-white/90" aria-hidden="true" />
          </ExpandableCardMedia>
          <span className="flex flex-col gap-0.5">
            <ExpandableCardTitle>{title}</ExpandableCardTitle>
            <ExpandableCardDescription>{place}</ExpandableCardDescription>
          </span>
        </ExpandableCardTrigger>
        <ExpandableCardContent>
          <ExpandableCardMedia
            className={`flex aspect-video items-center justify-center bg-linear-to-br ${art}`}
          >
            <Icon className="size-14 text-white/90" aria-hidden="true" />
          </ExpandableCardMedia>
          <div className="flex flex-col gap-1">
            <ExpandableCardTitle>{title}</ExpandableCardTitle>
            <ExpandableCardDescription>{place}</ExpandableCardDescription>
          </div>
          <ExpandableCardBody>{body}</ExpandableCardBody>
        </ExpandableCardContent>
      </ExpandableCard>
    ))}
  </div>
);
