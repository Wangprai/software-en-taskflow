"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { ActivityTimeline } from "@/features/activities/components/activity-timeline";
import { KanbanBoard } from "@/features/tasks/components/kanban-board";
import { TaskDetailModal } from "@/features/tasks/components/task-detail-modal";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectActivities } from "@/features/activities/hooks";
import { useCreateTask, useTasks } from "@/features/tasks/hooks";
import { useProject } from "@/features/projects/hooks";
import { useMembers } from "@/features/workspace-members/hooks";
import type { Task, TaskStatus } from "@/types";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useWorkspace } from "@/features/workspaces/hooks";
import { useAuth } from "@/providers/auth-provider";

export default function ProjectBoardPage() {
  const { slug, projectId } = useParams<{
    slug: string;
    projectId: string;
  }>();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const taskIdFromUrl = searchParams.get("taskId");

  const { data: project } = useProject(slug, projectId);
  const { data: tasks, isLoading } = useTasks(slug, projectId);
  const { data: members } = useMembers(slug);
  const { data: activities } = useProjectActivities(slug, projectId);

  const { data: workspace } = useWorkspace(slug);
  const { user } = useAuth();

  const isManager =
    workspace?.ownerId === user?.id ||
    workspace?.members?.some(
      (member) => member.user.id === user?.id && member.role === "ADMIN",
    );

  const canEditTask = (task: Task) =>
    !!user?.id &&
    (!!isManager ||
      task.createdById === user.id ||
      task.assigneeId === user.id);

  const createTask = useCreateTask(slug, projectId);

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("TODO");
  const assignees = useMemo(
    () => (members ?? []).map((m) => m.user),
    [members],
  );
  const activeTask = (tasks ?? []).find((t) => t.id === openTaskId) ?? null;

  const addTask = (status: TaskStatus = "TODO") => {
    setCreateStatus(status);
    setCreateOpen(true);
  };

  useEffect(() => {
    if (!taskIdFromUrl || !tasks) return;

    const taskExists = tasks.some((task) => task.id === taskIdFromUrl);

    if (taskExists) {
      setOpenTaskId(taskIdFromUrl);
    }
  }, [taskIdFromUrl, tasks]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={project?.name ?? "Project"}
        description={
          project?.description || "Drag cards between columns to update status."
        }
        actions={
          <>
            <Button onClick={() => addTask("TODO")}>
              <Plus className="size-4" /> New task
            </Button>
          </>
        }
      />

      {isLoading || !tasks ? (
        <CardGridSkeleton count={4} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks in this project"
          description="Create your first task and drag it through the workflow as work progresses."
          action={
            <Button onClick={() => addTask("TODO")}>
              <Plus className="size-4" /> New task
            </Button>
          }
        />
      ) : (
        <KanbanBoard
          slug={slug}
          projectId={projectId}
          tasks={tasks}
          onOpenTask={(task: Task) => setOpenTaskId(task.id)}
          onAddTask={addTask}
          canEditTask={canEditTask}
        />
      )}

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        assignees={assignees}
        defaultStatus={createStatus}
        isPending={createTask.isPending}
        onSubmit={(input) =>
          createTask.mutate(input, { onSuccess: () => setCreateOpen(false) })
        }
      />

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold">Project activity</h2>
        <ActivityTimeline
          activities={(activities ?? []).slice(0, 8)}
          emptyLabel="No activity in this project yet."
        />
      </Card>

      <TaskDetailModal
        task={activeTask}
        slug={slug}
        projectId={projectId}
        assignees={assignees}
        open={Boolean(activeTask)}
        onOpenChange={(next) => {
          if (!next) {
            setOpenTaskId(null);

            const params = new URLSearchParams(searchParams.toString());
            params.delete("taskId");

            const queryString = params.toString();

            router.replace(
              queryString ? `${pathname}?${queryString}` : pathname,
              { scroll: false },
            );
          }
        }}
      />
    </div>
  );
}
