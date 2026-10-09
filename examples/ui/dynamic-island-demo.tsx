"use client";

import {
  Airplay,
  AudioLines,
  FastForward,
  Mic,
  Pause,
  Phone,
  PhoneOff,
  Play,
  Rewind,
  Timer,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  DynamicIsland,
  DynamicIslandContent,
  useDynamicIsland,
} from "@/registry/ui/dynamic-island";

const states = ["idle", "timer", "call", "music"] as const;

const iconButton =
  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-background/50 [&_svg]:pointer-events-none [&_svg]:shrink-0";

const Countdown = () => {
  const [seconds, setSeconds] = React.useState(299);
  React.useEffect(() => {
    const id = setInterval(
      () => setSeconds((value) => (value > 0 ? value - 1 : 299)),
      1000
    );
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-sm tabular-nums">
      {String(Math.floor(seconds / 60)).padStart(2, "0")}:
      {String(seconds % 60).padStart(2, "0")}
    </span>
  );
};

const CallActions = () => {
  const { setState } = useDynamicIsland();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        aria-label="Decline"
        onClick={() => setState("idle")}
        className={cn(
          iconButton,
          "bg-destructive text-white hover:bg-destructive/90"
        )}
      >
        <PhoneOff className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Accept"
        onClick={() => setState("idle")}
        className={cn(
          iconButton,
          "bg-emerald-500 text-white hover:bg-emerald-500/90"
        )}
      >
        <Phone className="size-4" />
      </button>
    </div>
  );
};

const Player = () => {
  const [playing, setPlaying] = React.useState(true);
  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="size-9" />
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Previous track"
          className={cn(iconButton, "hover:bg-background/15")}
        >
          <Rewind className="fill-current size-5" />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((value) => !value)}
          className={cn(iconButton, "size-10 hover:bg-background/15")}
        >
          {playing ? (
            <Pause className="fill-current size-6" />
          ) : (
            <Play className="fill-current size-6" />
          )}
        </button>
        <button
          type="button"
          aria-label="Next track"
          className={cn(iconButton, "hover:bg-background/15")}
        >
          <FastForward className="fill-current size-5" />
        </button>
      </div>
      <button
        type="button"
        aria-label="AirPlay"
        className={cn(iconButton, "hover:bg-background/15")}
      >
        <Airplay className="size-4" />
      </button>
    </div>
  );
};

export const DynamicIslandDemo = () => {
  const [state, setState] = React.useState<string>("idle");

  return (
    <div className="@container flex w-full flex-col items-center gap-6">
      {/* Fixed-height stage: the island grows into it, the page never moves. */}
      <div className="flex h-48 w-full items-start justify-center">
        <DynamicIsland state={state} onStateChange={setState}>
          <DynamicIslandContent
            state="idle"
            className="flex w-32 items-center justify-between px-4 py-3"
          >
            <span className="bg-emerald-400 size-2 rounded-full" />
            <Mic
              aria-label="Microphone in use"
              className="text-background/70 size-3.5"
            />
          </DynamicIslandContent>

          <DynamicIslandContent
            state="timer"
            className="flex w-44 items-center justify-between px-4 py-2.5"
          >
            <Timer aria-label="Timer" className="text-amber-400 size-4" />
            <Countdown />
          </DynamicIslandContent>

          <DynamicIslandContent
            state="call"
            className="flex w-[min(18rem,100cqw)] items-center gap-3 p-2.5"
          >
            <span className="bg-background/15 grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold">
              MJ
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-background/60 text-xs">mobile</p>
              <p className="truncate text-sm font-medium">Maya Jones</p>
            </div>
            <CallActions />
          </DynamicIslandContent>

          <DynamicIslandContent
            state="music"
            className="w-[min(20rem,100cqw)] px-5 pt-5 pb-4"
          >
            <div className="flex items-center gap-3.5">
              <span
                aria-hidden
                className="size-14 shrink-0 rounded-xl bg-[linear-gradient(135deg,#f97316,#db2777_55%,#7c3aed)]"
              />
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate font-semibold">Entropy</p>
                <p className="text-background/60 truncate text-sm">
                  Beach Bunny
                </p>
              </div>
              <AudioLines aria-hidden className="text-background/70 size-6" />
            </div>
            <div className="text-background/60 mt-5 flex items-center gap-3 text-[11px] tabular-nums">
              <span>2:50</span>
              <div
                role="progressbar"
                aria-label="Playback position"
                aria-valuemin={0}
                aria-valuemax={221}
                aria-valuenow={170}
                aria-valuetext="2:50 of 3:41"
                className="bg-background/20 h-1.5 flex-1 rounded-full"
              >
                <div className="bg-background h-full w-[77%] rounded-full" />
              </div>
              <span>-0:51</span>
            </div>
            <Player />
          </DynamicIslandContent>
        </DynamicIsland>
      </div>

      <div
        role="group"
        aria-label="Island state"
        className="bg-muted text-muted-foreground inline-flex h-9 items-center rounded-lg p-[3px]"
      >
        {states.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={state === value}
            onClick={() => setState(value)}
            className="hover:text-foreground focus-visible:ring-ring/50 aria-pressed:bg-background aria-pressed:text-foreground inline-flex h-full cursor-pointer items-center rounded-md px-3 text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-[3px] aria-pressed:shadow-sm"
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};
