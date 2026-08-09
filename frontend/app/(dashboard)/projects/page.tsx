"use client";

import { useQueries } from "@tanstack/react-query";
import { FolderKanban } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/features/projects/components/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { projectsQueryOptions } from "@/features/projects/hooks";
import { useWorkspaces } from "@/features/workspaces/hooks";

export default function AllProjectsPage() {
  const { data: workspaces } = useWorkspaces();
  const results = useQueries({
    queries: (workspaces ?? []).map((w) => projectsQueryOptions(w.slug)),
  });

  const isLoading = !workspaces || results.some((r) => r.isLoading);
  const projects = results.flatMap((r) => r.data ?? []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All projects"
        description="Everything in flight across your workspaces."
      />
      {isLoading ? (
        <CardGridSkeleton />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Open a workspace and create your first project."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
