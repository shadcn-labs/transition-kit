"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

export interface KanbanColumnData {
  id: string;
  title: string;
}

export interface KanbanCardData {
  id: string;
  /** The `id` of the column the card sits in. */
  column: string;
  /** Used for the accessible name and screen reader announcements. */
  title: string;
}

type FocusPart = "card" | "prev" | "next";

interface Position {
  column: string;
  /** Index within the column, counted without the card being moved. */
  index: number;
}

interface DropTarget extends Position {
  top: number;
}

interface Grab {
  id: string;
  x: number;
  y: number;
}

interface Latest {
  cards: KanbanCardData[];
  columns: KanbanColumnData[];
  lifted: { id: string; origin: Position } | null;
  onCardsChange?: (cards: KanbanCardData[]) => void;
}

interface KanbanContextValue {
  cards: KanbanCardData[];
  columns: KanbanColumnData[];
  dragging: string | null;
  instructionsId: string;
  lifted: string | null;
  moved: string | null;
  name: TransitionNames;
  target: DropTarget | null;
  onCardBlur: (id: string) => void;
  onCardKeyDown: (event: React.KeyboardEvent<HTMLElement>, id: string) => void;
  onDragEnd: () => void;
  onDragLeave: (event: React.DragEvent<HTMLElement>, column: string) => void;
  onDragOver: (event: React.DragEvent<HTMLElement>, column: string) => void;
  onDragStart: (event: React.DragEvent<HTMLElement>, id: string) => void;
  onDrop: (event: React.DragEvent<HTMLElement>, column: string) => void;
  shiftColumn: (id: string, delta: -1 | 1) => void;
}

const KanbanContext = React.createContext<KanbanContextValue | null>(null);
const KanbanCardContext = React.createContext<KanbanCardData | null>(null);

const useKanban = () => {
  const context = React.useContext(KanbanContext);
  if (!context) {
    throw new Error("Kanban parts must be used within <KanbanBoard>.");
  }
  return context;
};

const useKanbanCard = () => {
  const card = React.useContext(KanbanCardContext);
  if (!card) {
    throw new Error("<KanbanCard> parts must be rendered by <KanbanColumn>.");
  }
  return card;
};

/**
 * The transition type that rolls a column's count: "up" for the column a card
 * entered, "down" for the one it left. Scoped to the board instance.
 */
const countRoll = (
  name: TransitionNames,
  column: string,
  direction: "up" | "down"
) => name("count", column, direction);

const columnCards = <T extends KanbanCardData>(cards: T[], column: string) =>
  cards.filter((card) => card.column === column);

const positionOf = (cards: KanbanCardData[], id: string): Position | null => {
  const card = cards.find((item) => item.id === id);
  if (!card) {
    return null;
  }
  return {
    column: card.column,
    index: columnCards(cards, card.column).indexOf(card),
  };
};

const samePosition = (a: Position, b: Position) =>
  a.column === b.column && a.index === b.index;

/** Returns a new array with the card moved to `to`. */
const moveCard = (
  cards: KanbanCardData[],
  id: string,
  to: Position
): KanbanCardData[] => {
  const card = cards.find((item) => item.id === id);
  if (!card) {
    return cards;
  }
  const rest = cards.filter((item) => item.id !== id);
  const target = columnCards(rest, to.column);
  const before = target[to.index];
  const last = target.at(-1);
  let at = rest.length;
  if (before) {
    at = rest.indexOf(before);
  } else if (last) {
    at = rest.indexOf(last) + 1;
  }
  return [
    ...rest.slice(0, at),
    { ...card, column: to.column },
    ...rest.slice(at),
  ];
};

const describe = (
  cards: KanbanCardData[],
  columns: KanbanColumnData[],
  id: string
) => {
  const position = positionOf(cards, id);
  if (!position) {
    return "";
  }
  const title =
    columns.find((column) => column.id === position.column)?.title ??
    position.column;
  const count = columnCards(cards, position.column).length;
  return `${title}, position ${position.index + 1} of ${count}`;
};

const titleOf = (cards: KanbanCardData[], id: string) =>
  cards.find((card) => card.id === id)?.title ?? id;

const announceMove = (title: string, where: string) =>
  `${title} moved to ${where}.`;

const announceCancel = (title: string, where: string) =>
  `Move cancelled. ${title} returned to ${where}.`;

/** A relative keyboard move, resolved against the cards at update time. */
const shift =
  (columns: KanbanColumnData[], dx: number, dy: number) =>
  (cards: KanbanCardData[], from: Position): Position | null => {
    if (dx !== 0) {
      const index = columns.findIndex((column) => column.id === from.column);
      const column = columns[index + dx];
      if (!column) {
        return null;
      }
      const count = columnCards(cards, column.id).length;
      return { column: column.id, index: Math.min(from.index, count) };
    }
    const index = from.index + dy;
    const count = columnCards(cards, from.column).length;
    if (index < 0 || index >= count) {
      return null;
    }
    return { column: from.column, index };
  };

const arrows: Record<string, [number, number]> = {
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
};

const cardSelector = (id: string) => `[data-card-id="${CSS.escape(id)}"]`;

/** Where a drop at the pointer lands, plus the indicator offset in px. */
const dropTargetAt = (
  event: React.DragEvent<HTMLElement>,
  column: string,
  id: string
): DropTarget => {
  const list = event.currentTarget.querySelector<HTMLElement>(
    '[data-slot="kanban-column-list"]'
  );
  const items = [...(list?.children ?? [])].filter(
    (item): item is HTMLElement =>
      item instanceof HTMLElement && item.dataset.cardId !== id
  );
  let index = items.findIndex((item) => {
    const rect = item.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2;
  });
  if (index === -1) {
    index = items.length;
  }
  const prev = items[index - 1];
  const next = items[index];
  let top = 0;
  if (prev && next) {
    top = (prev.offsetTop + prev.offsetHeight + next.offsetTop) / 2;
  } else if (next) {
    top = next.offsetTop - 4;
  } else if (prev) {
    top = prev.offsetTop + prev.offsetHeight + 4;
  }
  return { column, index, top };
};

const KanbanBoard = <T extends KanbanCardData>({
  columns,
  cards: cardsProp,
  defaultCards,
  onCardsChange,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  columns: KanbanColumnData[];
  cards?: T[];
  defaultCards?: T[];
  onCardsChange?: (cards: T[]) => void;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState<KanbanCardData[]>(
    defaultCards ?? []
  );
  const cards: KanbanCardData[] = cardsProp ?? uncontrolled;
  const [lifted, setLiftedState] = React.useState<Latest["lifted"]>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);
  const [target, setTarget] = React.useState<DropTarget | null>(null);
  const [moved, setMoved] = React.useState<string | null>(null);
  const [announcement, setAnnouncement] = React.useState("");
  const [version, setVersion] = React.useState(0);
  const name = useTransitionNames();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const grabRef = React.useRef<Grab | null>(null);
  const focusRef = React.useRef<{ id: string; part: FocusPart } | null>(null);
  const parkedRef = React.useRef<HTMLElement | null>(null);
  const latest = React.useRef<Latest>({ cards, columns, lifted });

  React.useLayoutEffect(() => {
    latest.current = {
      cards,
      columns,
      lifted,
      onCardsChange: onCardsChange as Latest["onCardsChange"],
    };
  });

  // Runs inside the move's transition, before the new snapshot: un-park a
  // dropped card, and put focus back on a card that remounted in another
  // column.
  React.useLayoutEffect(() => {
    parkedRef.current?.style.removeProperty("translate");
    parkedRef.current = null;
    const pending = focusRef.current;
    if (!pending) {
      return;
    }
    focusRef.current = null;
    const card = rootRef.current?.querySelector(cardSelector(pending.id));
    const part =
      card?.querySelector<HTMLElement>(
        `[data-kanban-focus="${pending.part}"]:not(:disabled)`
      ) ?? card?.querySelector<HTMLElement>('[data-kanban-focus="card"]');
    part?.focus();
  }, [version]);

  const setLifted = React.useCallback((next: Latest["lifted"]) => {
    latest.current.lifted = next;
    setLiftedState(next);
  }, []);

  const actions = React.useMemo(() => {
    /**
     * Moves a card inside a transition. The move is applied to `latest` right
     * away, so quick repeated key presses build on each other.
     */
    const commit = (
      id: string,
      to: (cards: KanbanCardData[], from: Position) => Position | null,
      announce: (title: string, where: string) => string,
      focus?: FocusPart
    ) => {
      const { cards: current, columns: order } = latest.current;
      const from = positionOf(current, id);
      const dest = from && to(current, from);
      if (!from || !dest || samePosition(from, dest)) {
        return false;
      }
      if (focus) {
        focusRef.current = { id, part: focus };
      }
      const next = moveCard(current, id, dest);
      latest.current.cards = next;
      React.startTransition(() => {
        // The count of the column the card left rolls down, the other up.
        if (from.column !== dest.column) {
          React.addTransitionType(countRoll(name, from.column, "down"));
          React.addTransitionType(countRoll(name, dest.column, "up"));
        }
        setUncontrolled(next);
        latest.current.onCardsChange?.(next);
        setMoved(id);
        setVersion((value) => value + 1);
        setAnnouncement(announce(titleOf(next, id), describe(next, order, id)));
      });
      return true;
    };

    const drop = (id: string) => {
      const { cards: current, columns: order } = latest.current;
      setLifted(null);
      setAnnouncement(
        `${titleOf(current, id)} dropped in ${describe(current, order, id)}.`
      );
    };

    const cancel = (id: string, origin: Position) => {
      setLifted(null);
      if (!commit(id, () => origin, announceCancel, "card")) {
        const { cards: current, columns: order } = latest.current;
        setAnnouncement(
          announceCancel(titleOf(current, id), describe(current, order, id))
        );
      }
    };

    const focusNeighbour = (id: string, dx: number, dy: number) => {
      const { cards: current, columns: order } = latest.current;
      const from = positionOf(current, id);
      if (!from) {
        return;
      }
      let next: KanbanCardData | undefined;
      if (dy === 0) {
        // Skip empty columns on the way.
        let index = order.findIndex((column) => column.id === from.column) + dx;
        while (!next && order[index]) {
          const list = columnCards(current, order[index].id);
          next = list[Math.min(from.index, list.length - 1)];
          index += dx;
        }
      } else {
        next = columnCards(current, from.column)[from.index + dy];
      }
      if (next) {
        rootRef.current
          ?.querySelector(cardSelector(next.id))
          ?.querySelector<HTMLElement>('[data-kanban-focus="card"]')
          ?.focus();
      }
    };

    const onCardKeyDown = (
      event: React.KeyboardEvent<HTMLElement>,
      id: string
    ) => {
      if (event.defaultPrevented || event.altKey || event.metaKey) {
        return;
      }
      const { key } = event;
      const arrow = arrows[key];
      const isLifted = latest.current.lifted?.id === id;
      if (key === " " || key === "Enter") {
        event.preventDefault();
        if (isLifted) {
          drop(id);
          return;
        }
        const position = positionOf(latest.current.cards, id);
        if (!position) {
          return;
        }
        setLifted({ id, origin: position });
        const { cards: current, columns: order } = latest.current;
        setAnnouncement(
          `Picked up ${titleOf(current, id)}. ${describe(current, order, id)}. Use the arrow keys to move it, Space to drop, Escape to cancel.`
        );
      } else if (key === "Escape" && isLifted) {
        event.preventDefault();
        const { lifted: current } = latest.current;
        if (current) {
          cancel(id, current.origin);
        }
      } else if (arrow) {
        event.preventDefault();
        if (isLifted) {
          commit(
            id,
            shift(latest.current.columns, ...arrow),
            announceMove,
            "card"
          );
        } else {
          focusNeighbour(id, ...arrow);
        }
      }
    };

    const onCardBlur = (id: string) => {
      // Ignore the blur caused by the card remounting mid-move.
      if (latest.current.lifted?.id === id && !focusRef.current) {
        drop(id);
      }
    };

    const shiftColumn = (id: string, delta: -1 | 1) => {
      commit(
        id,
        shift(latest.current.columns, delta, 0),
        announceMove,
        delta < 0 ? "prev" : "next"
      );
    };

    const onDragStart = (event: React.DragEvent<HTMLElement>, id: string) => {
      if (latest.current.lifted) {
        event.preventDefault();
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      grabRef.current = {
        id,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(
        "text/plain",
        titleOf(latest.current.cards, id)
      );
      // Fade the source after the browser has taken the drag image.
      requestAnimationFrame(() => {
        if (grabRef.current?.id === id) {
          setDragging(id);
        }
      });
    };

    const onDragEnd = () => {
      grabRef.current = null;
      setDragging(null);
      setTarget(null);
    };

    const onDragOver = (
      event: React.DragEvent<HTMLElement>,
      column: string
    ) => {
      const grab = grabRef.current;
      // Only accept cards dragged from this board.
      if (!grab) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const next = dropTargetAt(event, column, grab.id);
      const from = positionOf(latest.current.cards, grab.id);
      const visible = from && samePosition(from, next) ? null : next;
      setTarget((current) =>
        current?.column === visible?.column &&
        current?.index === visible?.index &&
        current?.top === visible?.top
          ? current
          : visible
      );
    };

    const onDragLeave = (
      event: React.DragEvent<HTMLElement>,
      column: string
    ) => {
      if (
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return;
      }
      setTarget((current) => (current?.column === column ? null : current));
    };

    const onDrop = (event: React.DragEvent<HTMLElement>, column: string) => {
      const grab = grabRef.current;
      if (!grab) {
        return;
      }
      event.preventDefault();
      grabRef.current = null;
      const dest = dropTargetAt(event, column, grab.id);
      const card = rootRef.current?.querySelector<HTMLElement>(
        cardSelector(grab.id)
      );
      // Urgent, so the drag state is gone from the snapshot the move starts
      // from.
      setDragging(null);
      setTarget(null);
      if (!card) {
        commit(grab.id, () => dest, announceMove);
        return;
      }
      // Park the card where it was dropped, so the old snapshot starts there.
      // The layout effect above lets go of it inside the move.
      const rect = card.getBoundingClientRect();
      card.style.translate = `${event.clientX - grab.x - rect.left}px ${event.clientY - grab.y - rect.top}px`;
      if (commit(grab.id, () => dest, announceMove)) {
        parkedRef.current = card;
      } else {
        card.style.removeProperty("translate");
      }
    };

    return {
      onCardBlur,
      onCardKeyDown,
      onDragEnd,
      onDragLeave,
      onDragOver,
      onDragStart,
      onDrop,
      shiftColumn,
    };
  }, [name, setLifted]);

  const instructionsId = name("instructions");
  const context = React.useMemo(
    () => ({
      ...actions,
      cards,
      columns,
      dragging,
      instructionsId,
      lifted: lifted?.id ?? null,
      moved,
      name,
      target,
    }),
    [
      actions,
      cards,
      columns,
      dragging,
      instructionsId,
      lifted,
      moved,
      name,
      target,
    ]
  );

  return (
    <KanbanContext.Provider value={context}>
      <div
        ref={rootRef}
        data-slot="kanban-board"
        className={cn(
          "grid auto-cols-[minmax(11rem,1fr)] grid-flow-col gap-3 overflow-x-auto p-1",
          className
        )}
        {...props}
      >
        {children}
        <p id={instructionsId} hidden>
          Press Space or Enter to pick up a card. While it is picked up, use the
          arrow keys to move it between positions and columns, Space or Enter to
          drop it, and Escape to cancel. Arrow keys move focus between cards.
        </p>
        <div aria-live="assertive" aria-atomic className="sr-only">
          {announcement}
        </div>
      </div>
    </KanbanContext.Provider>
  );
};

const KanbanColumn = <T extends KanbanCardData>({
  value,
  className,
  children,
  onDragLeave,
  onDragOver,
  onDrop,
  ...props
}: Omit<React.ComponentProps<"section">, "children"> & {
  /** The `id` of a column passed to `<KanbanBoard columns>`. */
  value: string;
  /** Renders each card in the column; return a `<KanbanCard>`. */
  children: (card: T) => React.ReactNode;
}) => {
  const kanban = useKanban();
  const column = kanban.columns.find((item) => item.id === value);
  const cards = columnCards(kanban.cards, value) as T[];
  const headingId = kanban.name("column", value);
  const target = kanban.target?.column === value ? kanban.target : null;

  return (
    <section
      aria-labelledby={headingId}
      data-slot="kanban-column"
      data-drop-target={target ? "" : undefined}
      onDragOver={(event) => {
        onDragOver?.(event);
        if (!event.defaultPrevented) {
          kanban.onDragOver(event, value);
        }
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        kanban.onDragLeave(event, value);
      }}
      onDrop={(event) => {
        onDrop?.(event);
        if (!event.defaultPrevented) {
          kanban.onDrop(event, value);
        }
      }}
      className={cn(
        "bg-muted/50 flex min-w-0 flex-col gap-2 rounded-xl border border-transparent p-2 transition-colors data-[drop-target]:border-border data-[drop-target]:bg-muted",
        className
      )}
      {...props}
    >
      <header
        data-slot="kanban-column-header"
        className="flex h-7 items-center justify-between gap-2 px-1.5"
      >
        <h3 id={headingId} className="truncate text-sm font-medium">
          {column?.title ?? value}
        </h3>
        <span
          data-slot="kanban-column-count"
          className="bg-background text-muted-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-xs font-medium tabular-nums"
        >
          <React.ViewTransition
            default="none"
            update={{
              [countRoll(kanban.name, value, "down")]: tk(
                "tk-roll",
                "tk-clip",
                "tk-down"
              ),
              [countRoll(kanban.name, value, "up")]: tk(
                "tk-roll",
                "tk-clip",
                "tk-up"
              ),
              default: tk("tk-morph"),
            }}
          >
            <span>{cards.length}</span>
          </React.ViewTransition>
          <span className="sr-only"> cards</span>
        </span>
      </header>
      <div className="relative flex-1">
        <ul
          data-slot="kanban-column-list"
          className="flex min-h-20 flex-col gap-2"
        >
          {cards.map((card) => (
            <KanbanCardContext.Provider key={card.id} value={card}>
              {children(card)}
            </KanbanCardContext.Provider>
          ))}
        </ul>
        {cards.length === 0 ? (
          <p className="border-border text-muted-foreground pointer-events-none absolute inset-0 grid place-items-center rounded-lg border border-dashed text-xs">
            Drop cards here
          </p>
        ) : null}
        {target ? (
          <div
            aria-hidden
            data-slot="kanban-drop-indicator"
            className="bg-primary pointer-events-none absolute inset-x-1 h-0.5 -translate-y-1/2 rounded-full"
            style={{ top: target.top }}
          />
        ) : null}
      </div>
    </section>
  );
};

const KanbanCard = ({
  className,
  children,
  onDragEnd,
  onDragStart,
  ...props
}: React.ComponentProps<"li">) => {
  const kanban = useKanban();
  const card = useKanbanCard();
  const lifted = kanban.lifted === card.id;
  let state = "idle";
  if (lifted) {
    state = "lifted";
  } else if (kanban.dragging === card.id) {
    state = "dragging";
  }

  // Named, so a card moving to another column (a remount) glides there; the
  // moved card stays on top of the neighbours making room.
  return (
    <React.ViewTransition
      name={kanban.name("card", card.id)}
      default={tk("tk-morph", kanban.moved === card.id && "tk-top")}
    >
      <li
        data-slot="kanban-card"
        data-card-id={card.id}
        data-state={state}
        draggable={!lifted}
        onDragStart={(event) => {
          onDragStart?.(event);
          if (!event.defaultPrevented) {
            kanban.onDragStart(event, card.id);
          }
        }}
        onDragEnd={(event) => {
          onDragEnd?.(event);
          kanban.onDragEnd();
        }}
        className={cn(
          "group/kanban-card bg-card text-card-foreground relative cursor-grab rounded-lg border p-3 text-sm shadow-xs transition-[opacity,box-shadow] select-none active:cursor-grabbing has-[[data-kanban-focus=card]:focus-visible]:border-ring has-[[data-kanban-focus=card]:focus-visible]:ring-[3px] has-[[data-kanban-focus=card]:focus-visible]:ring-ring/50 data-[state=dragging]:opacity-40 data-[state=lifted]:border-primary data-[state=lifted]:shadow-lg data-[state=lifted]:ring-2 data-[state=lifted]:ring-primary/30",
          className
        )}
        {...props}
      >
        {/* Covers the card for keyboard and screen reader users; the pointer drags the card itself. */}
        <button
          type="button"
          data-kanban-focus="card"
          aria-label={card.title}
          aria-roledescription="draggable card"
          aria-describedby={kanban.instructionsId}
          aria-pressed={lifted}
          onKeyDown={(event) => kanban.onCardKeyDown(event, card.id)}
          onBlur={() => kanban.onCardBlur(card.id)}
          className="pointer-events-none absolute inset-0 rounded-[inherit] outline-none"
        />
        {children}
      </li>
    </React.ViewTransition>
  );
};

const KanbanCardActions = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const kanban = useKanban();
  const card = useKanbanCard();
  const index = kanban.columns.findIndex((column) => column.id === card.column);
  const prev = kanban.columns[index - 1];
  const next = kanban.columns[index + 1];
  const buttonClassName =
    "text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-6 cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-[3px] disabled:invisible [&_svg]:size-3.5";

  return (
    <div
      data-slot="kanban-card-actions"
      className={cn(
        "relative flex items-center opacity-0 transition-opacity group-hover/kanban-card:opacity-100 group-focus-within/kanban-card:opacity-100 [@media(hover:none)]:opacity-100",
        className
      )}
      {...props}
    >
      <button
        type="button"
        data-kanban-focus="prev"
        disabled={!prev}
        aria-label={prev ? `Move ${card.title} to ${prev.title}` : undefined}
        onClick={() => kanban.shiftColumn(card.id, -1)}
        className={buttonClassName}
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        data-kanban-focus="next"
        disabled={!next}
        aria-label={next ? `Move ${card.title} to ${next.title}` : undefined}
        onClick={() => kanban.shiftColumn(card.id, 1)}
        className={buttonClassName}
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export { KanbanBoard, KanbanCard, KanbanCardActions, KanbanColumn };
