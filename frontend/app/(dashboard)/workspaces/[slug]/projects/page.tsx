"use client";
import { FolderKanban, Plus } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  EntityFormDialog,
  type EntityValues,
} from "@/components/shared/entity-form-dialog";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/features/projects/hooks";
import type { Project } from "@/types";
import { useParams } from "next/navigation";

export default function ProjectsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: projects, isLoading } = useProjects(slug);
  const createProject = useCreateProject(slug);
  const updateProject = useUpdateProject(slug);
  const deleteProject = useDeleteProject(slug);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const onCreate = (values: EntityValues) =>
    createProject.mutate(values, { onSuccess: () => setCreateOpen(false) });

  const onUpdate = (values: EntityValues) => {
    if (!editing) return;
    updateProject.mutate(
      { id: editing.id, ...values },
      { onSuccess: () => setEditing(null) },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Each project has its own Kanban board and backlog."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New project
          </Button>
        }
      />

      {isLoading && <CardGridSkeleton />}

      {projects && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project to start planning work on a Kanban board."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" /> New project
            </Button>
          }
        />
      )}

      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              slug={slug}
              onEdit={() => setEditing(project)}
              onDelete={() => setDeleting(project)}
            />
          ))}
        </div>
      )}

      <EntityFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create project"
        description="Projects group tasks, owners and delivery timelines."
        submitLabel="Create project"
        namePlaceholder="Kanban Board v2"
        isPending={createProject.isPending}
        onSubmit={onCreate}
      />

      <EntityFormDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Edit project"
        description="Update the project name and description."
        submitLabel="Save changes"
        isPending={updateProject.isPending}
        {...(editing
          ? {
              defaultValues: {
                name: editing.name,
                description: editing.description ?? "",
              },
            }
          : {})}
        onSubmit={onUpdate}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.name}”?`}
        description="This permanently removes the project and all of its tasks."
        onConfirm={() => {
          if (deleting) deleteProject.mutate(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
