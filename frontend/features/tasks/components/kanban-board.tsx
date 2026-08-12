import { useState } from "react";
import { CalendarDays, GripVertical, MessageSquare, Plus } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMoveTask } from "@/features/tasks/hooks";
import { formatDate, isOverdue } from "@/lib/format";
import type { Task, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
import { PRIORITY_LABEL, PRIORITY_STYLES } from "@/constants";

const COLUMNS: Array<{ status: TaskStatus; label: string; dot: string }> = [
  { status: "TODO", label: "To do", dot: "bg-muted-foreground" },
  { status: "IN_PROGRESS", label: "In progress", dot: "bg-info" },
  { status: "REVIEW", label: "In review", dot: "bg-warning" },
  { status: "DONE", label: "Done", dot: "bg-success" },
];

export function KanbanBoard({
  slug,
  projectId,
  tasks,
  onOpenTask,
  onAddTask,
}: {
  slug: string,
  projectId: string;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}) {
  const move = useMoveTask(slug, projectId);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const drop = (status: TaskStatus) => {
    setOverColumn(null);
    if (!draggingId) return;
    const task = tasks.find((t) => t.id === draggingId);
    setDraggingId(null);
    if (!task || task.status === status) return;
    move.mutate({ taskId: task.id, status });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {COLUMNS.map((column) => {
        const items = tasks.filter((t) => t.status === column.status);
        return (
          <section
            key={column.status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(column.status);
            }}
            onDragLeave={() =>
              setOverColumn((c) => (c === column.status ? null : c))
            }
            onDrop={() => drop(column.status)}
            className={cn(
              "flex min-h-64 flex-col rounded-xl border border-border bg-card p-3 transition-colors xl:min-h-[420px]",
              overColumn === column.status && "border-primary/60 bg-primary/5",
            )}
          >
            <header className="mb-3 flex items-center gap-2 px-1">
              <span className={cn("size-2 rounded-full", column.dot)} />
              <h2 className="text-sm font-semibold">{column.label}</h2>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {items.length}
              </span>
              {onAddTask ? (
                <button
                  type="button"
                  onClick={() => onAddTask(column.status)}
                  aria-label={`Add task to ${column.label}`}
                  className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Plus className="size-3.5" />
                </button>
              ) : null}
            </header>

            <div className="scroll-slim flex flex-1 flex-col gap-2 overflow-y-auto">
              {items.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpenTask(task)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpenTask(task);
                    }
                  }}
                  onDragStart={() => setDraggingId(task.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className={cn(
                    "group cursor-grab gap-0 border border-border bg-card p-3 shadow-none transition-all hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
                    draggingId === task.id && "opacity-50",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    <p className="text-sm font-medium leading-snug">
                      {task.title}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-[10px]",
                        PRIORITY_STYLES[task.priority],
                      )}
                    >
                      {PRIORITY_LABEL[task.priority]}
                    </Badge>
                    {task.dueDate ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] text-muted-foreground",
                          isOverdue(task.dueDate) &&
                            task.status !== "DONE" &&
                            "text-destructive",
                        )}
                      >
                        <CalendarDays className="size-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    ) : null}
                    <div className="ml-auto flex items-center gap-1.5">
                      <MessageSquare className="size-3 text-muted-foreground" />
                      {task.assignee ? (
                        <UserAvatar user={task.assignee} className="size-6" />
                      ) : (
                        <span className="flex size-6 items-center justify-center rounded-full border border-dashed border-border text-[10px] text-muted-foreground">
                          ?
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/70 py-8 text-center text-xs text-muted-foreground">
                  Drop tasks here
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
