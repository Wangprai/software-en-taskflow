"use client";

import { LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { EntityFormDialog, type EntityValues } from "@/components/shared/entity-form-dialog";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from "@/features/workspaces/components/workspace-card";
import {
  useCreateWorkspace,
  useDeleteWorkspace,
  useUpdateWorkspace,
  useWorkspaces,
} from "@/features/workspaces/hooks";
import type { Workspace } from "@/types";


export default function WorkspacesPage() {
  const { data: workspaces, isLoading, isError, error } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Workspace | null>(null);
  const [deleting, setDeleting] = useState<Workspace | null>(null);

  const onCreate = (values: EntityValues) =>
    createWorkspace.mutate(values, { onSuccess: () => setCreateOpen(false) });

  const onUpdate = (values: EntityValues) => {
    if (!editing) return;
    updateWorkspace.mutate(
      { slug: editing.slug, ...values },
      { onSuccess: () => setEditing(null) },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Every team, client and initiative in your organisation."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New workspace
          </Button>
        }
      />

      {isLoading && <CardGridSkeleton />}

      {isError && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error).message}
        </p>
      )}

      {workspaces && workspaces.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title="No workspaces yet"
          description="Create your first workspace to start grouping projects and teammates."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> New workspace
            </Button>
          }
        />
      )}

      {workspaces && workspaces.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onEdit={() => setEditing(workspace)}
              onDelete={() => setDeleting(workspace)}
            />
          ))}
        </div>
      )}

      <EntityFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create workspace"
        description="Workspaces group projects, members and permissions."
        submitLabel="Create workspace"
        isPending={createWorkspace.isPending}
        onSubmit={onCreate}
      />

      <EntityFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Edit workspace"
        description="Update the workspace name and description."
        submitLabel="Save changes"
        isPending={updateWorkspace.isPending}
        defaultValues={
          editing ? { name: editing.name, description: editing.description } : undefined
        }
        onSubmit={onUpdate}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.name}”?`}
        description="This permanently removes the workspace along with its projects and tasks."
        onConfirm={() => {
          if (deleting) deleteWorkspace.mutate(deleting.slug);
          setDeleting(null);
        }}
      />
    </div>
  );
}
