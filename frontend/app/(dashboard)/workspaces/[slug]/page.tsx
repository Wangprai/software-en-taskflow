"use client";

import { useParams } from "next/navigation";
import { CalendarDays, FolderKanban, ListChecks, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RoleBadge } from "@/features/workspace-members/components/role-badge";
import { ProjectCard } from "@/features/projects/components/project-card";
import { CardGridSkeleton } from "@/components/shared/skeletons";
import { StatCard } from "@/components/shared/stat-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMembers } from "@/features/workspace-members/hooks";
import { useProjects } from "@/features/projects/hooks";
import { useWorkspace } from "@/features/workspaces/hooks";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export default function WorkspaceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: workspace, isLoading } = useWorkspace(slug);
  const { data: members } = useMembers(slug);
  const { data: projects } = useProjects(slug);

  const totalTasks = (projects ?? []).reduce((sum, p) => sum + p.taskCount, 0);
  const admins = (members ?? []).filter((m) => m.role === "ADMIN").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={workspace?.name ?? "Workspace"}
        description={workspace?.description || "No description yet."}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/workspaces/${slug}/members`}>
                <Users className="size-4" /> Members
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/workspaces/${slug}/projects`}>
                <FolderKanban className="size-4" /> Projects
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Members" value={members?.length ?? 0} hint={`${admins} admins`} />
        <StatCard icon={FolderKanban} label="Projects" value={projects?.length ?? 0} />
        <StatCard icon={ListChecks} label="Tasks" value={totalTasks} hint="Across all projects" />
        <StatCard
          icon={CalendarDays}
          label="Created"
          value={workspace ? formatDate(workspace.createdAt) : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Recent projects
            </h2>
            <Link
              href={`/workspaces/${slug}/projects`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {isLoading || !projects ? (
            <CardGridSkeleton count={2} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.slice(0, 4).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Members
            </h2>
            <Link
              href={`/workspaces/${ slug }/members`}
              className="text-sm text-primary hover:underline"
            >
              Manage
            </Link>
          </div>
          <Card className="divide-y divide-border gap-0 p-0">
            {(members ?? []).slice(0, 6).map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3">
                <UserAvatar user={member.user} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                </div>
                <RoleBadge role={member.role} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
