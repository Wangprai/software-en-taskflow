"use client";

import {
  CalendarDays,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/types";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export function ProjectCard({
  project,
  slug,
  onEdit,
  onDelete,
}: {
  project: Project;
  slug: string;
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
}) {
  return (
    <Card className="group gap-0 p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {project.key}
            </Badge>

            <span className="text-xs text-muted-foreground">
              {project.taskCount}
              {project.taskCount === 1 ? "task" : "tasks"}
            </span>
          </div>

          <Link
            href={`/workspaces/${slug}/projects/${project.id}`}
            className="mt-2 block truncate text-base font-semibold hover:text-primary"
          >
            {project.name}
          </Link>
        </div>

        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label="Project actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="size-4" /> Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {project.description || "No description yet."}
      </p>

      <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          {formatDate(project.createdAt)}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-3.5" /> {project.taskCount} tasks
        </span>
      </div>
    </Card>
  );
}
