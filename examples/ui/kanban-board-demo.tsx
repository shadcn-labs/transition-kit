import {
  KanbanBoard,
  KanbanCard,
  KanbanCardActions,
  KanbanColumn,
} from "@/registry/ui/kanban-board";

const columns = [
  { id: "todo", title: "Todo" },
  { id: "doing", title: "In progress" },
  { id: "done", title: "Done" },
];

const tasks = [
  {
    assignee: "MK",
    column: "todo",
    id: "t1",
    tag: "Design",
    title: "Empty state illustrations",
  },
  {
    assignee: "JS",
    column: "todo",
    id: "t2",
    tag: "Docs",
    title: "Write migration guide",
  },
  {
    assignee: "AL",
    column: "todo",
    id: "t3",
    tag: "Bug",
    title: "Fix Safari focus ring",
  },
  {
    assignee: "RP",
    column: "doing",
    id: "t4",
    tag: "Feature",
    title: "Keyboard shortcuts",
  },
  {
    assignee: "MK",
    column: "doing",
    id: "t5",
    tag: "Design",
    title: "Dark mode tokens",
  },
  {
    assignee: "JS",
    column: "done",
    id: "t6",
    tag: "Feature",
    title: "Billing settings page",
  },
  {
    assignee: "AL",
    column: "done",
    id: "t7",
    tag: "Bug",
    title: "Flaky upload test",
  },
];

const tagClassName: Record<string, string> = {
  Bug: "bg-red-500/10 text-red-700 dark:text-red-300",
  Design: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  Docs: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Feature: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export const KanbanBoardDemo = () => (
  <div className="@container w-full max-w-2xl">
    <KanbanBoard
      aria-label="Sprint board"
      columns={columns}
      defaultCards={tasks}
      className="auto-cols-[minmax(10.5rem,1fr)]"
    >
      {columns.map((column) => (
        <KanbanColumn key={column.id} value={column.id}>
          {(task: (typeof tasks)[number]) => (
            <KanbanCard className="flex flex-col gap-2 p-2.5">
              <p className="leading-snug font-medium">{task.title}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${tagClassName[task.tag]}`}
                >
                  {task.tag}
                </span>
                <KanbanCardActions className="ml-auto" />
                <span
                  aria-label={`Assigned to ${task.assignee}`}
                  className="bg-muted text-muted-foreground grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold"
                >
                  {task.assignee}
                </span>
              </div>
            </KanbanCard>
          )}
        </KanbanColumn>
      ))}
    </KanbanBoard>
  </div>
);
