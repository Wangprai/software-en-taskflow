import { useEffect, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";

import { ActivityTimeline } from "@/features/activities/components/activity-timeline";
import { CommentSection } from "@/features/comments/components/comment-section";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useTaskActivities } from "@/features/activities/hooks";

import { useDeleteTask, useUpdateTask } from "@/features/tasks/hooks";
import { formatDate, formatRelative, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
  User,
} from "@/types";
import {
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  PRIORITY_STYLES,
  STATUS_DOT,
  STATUS_LABEL,
  STATUS_ORDER,
} from "@/constants";

export function TaskDetailModal({
  slug,
  task,
  projectId,
  assignees,
  open,
  onOpenChange,
}: {
  task: Task | null;
  slug: string;
  projectId: string;
  assignees: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateTask(slug, projectId);
  const remove = useDeleteTask(slug, projectId);
  const { data: activities } = useTaskActivities(
    slug,
    projectId,
    task?.id ?? null,
  );

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");

  useEffect(() => {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
  }, [task?.id, task?.title, task?.description]);

  if (!task) return null;

  const patch = (input: UpdateTaskInput) =>
    update.mutate({ taskId: task.id, ...input });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="space-y-1 border-b border-border p-5 pr-12 text-left">
          <div className="flex items-center gap-2">
            <Badge
              className={cn("text-[10px]", PRIORITY_STYLES[task.priority])}
            >
              {PRIORITY_LABEL[task.priority]}
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn("size-2 rounded-full", STATUS_DOT[task.status])}
              />
              {STATUS_LABEL[task.status]}
            </span>
          </div>
          <DialogTitle className="sr-only">{task.title}</DialogTitle>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              const next = title.trim();
              if (next && next !== task.title) patch({ title: next });
              else setTitle(task.title);
            }}
            aria-label="Task title"
            className="h-auto border-0 px-0 !text-lg font-semibold shadow-none focus-visible:ring-0"
          />
          <DialogDescription className="text-xs">
            Created {formatRelative(task.createdAt)} · updated{" "}
            {formatRelative(task.updatedAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 p-5 md:grid-cols-[1fr_240px]">
          <div className="min-w-0 space-y-5">
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => {
                  if (description !== (task.description ?? ""))
                    patch({ description });
                }}
                placeholder="Add a more detailed description…"
                className="min-h-24 resize-none"
                aria-label="Task description"
              />
            </section>

            <Tabs defaultValue="comments">
              <TabsList>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="comments" className="pt-4">
                <CommentSection
                  slug={slug}
                  projectId={projectId}
                  taskId={task.id}
                />
              </TabsContent>
              <TabsContent value="activity" className="pt-4">
                <ActivityTimeline
                  activities={activities ?? []}
                  emptyLabel="Nothing has happened on this task yet."
                />
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-4 md:border-l md:border-border md:pl-5">
            <Field label="Status">
              <Select
                value={task.status}
                onValueChange={(value) =>
                  patch({ status: value as TaskStatus })
                }
              >
                <SelectTrigger className="w-full" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Priority">
              <Select
                value={task.priority}
                onValueChange={(value) =>
                  patch({ priority: value as TaskPriority })
                }
              >
                <SelectTrigger className="w-full" aria-label="Priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_ORDER.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {PRIORITY_LABEL[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Assignee">
              <Select
                value={task.assignee?.id ?? "unassigned"}
                onValueChange={(value) =>
                  patch({ assigneeId: value === "unassigned" ? null : value })
                }
              >
                <SelectTrigger className="w-full" aria-label="Assignee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {assignees.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Created by">
              <div className="flex items-center gap-2">
                <UserAvatar user={task.createdBy} className="size-6" />
                <span className="truncate text-sm">{task.createdBy.name}</span>
              </div>
            </Field>

            <Field label="Due date">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm",
                  isOverdue(task.dueDate) &&
                    task.status !== "DONE" &&
                    "text-destructive",
                )}
              >
                <CalendarDays className="size-3.5" />
                {formatDate(task.dueDate)}
              </span>
            </Field>

            <Separator />

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(task.id, { onSuccess: () => onOpenChange(false) })
              }
            >
              <Trash2 className="size-4" /> Delete task
            </Button>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
