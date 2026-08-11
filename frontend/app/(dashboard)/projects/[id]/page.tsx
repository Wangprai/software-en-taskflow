"use client";

import { useMemo, useState } from "react";
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
import { useWorkspaces } from "@/features/workspaces/hooks";
import type { Task, TaskStatus } from "@/types";
import { useParams } from "next/navigation";

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { data: tasks, isLoading } = useTasks(id);
  const { data: workspaces } = useWorkspaces();
  const slug = workspaces?.find((w) => w.id === project?.workspaceId)?.slug ?? "";
  const { data: members } = useMembers(slug);
  const { data: activities } = useProjectActivities(id);
  const createTask = useCreateTask(id);

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("TODO");
  const assignees = useMemo(() => (members ?? []).map((m) => m.user), [members]);
  const activeTask = (tasks ?? []).find((t) => t.id === openTaskId) ?? null;

  const addTask = (status: TaskStatus = "TODO") => {
    setCreateStatus(status);
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={project?.name ?? "Project"}
        description={project?.description || "Drag cards between columns to update status."}
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
          projectId={id}
          tasks={tasks}
          onOpenTask={(task: Task) => setOpenTaskId(task.id)}
          onAddTask={addTask}
        />
      )}

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        assignees={assignees}
        defaultStatus={createStatus}
        isPending={createTask.isPending}
        onSubmit={(input) => createTask.mutate(input, { onSuccess: () => setCreateOpen(false) })}
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
        projectId={id}
        assignees={assignees}
        open={Boolean(activeTask)}
        onOpenChange={(next) => !next && setOpenTaskId(null)}
      />
    </div>
  );
}
