"use client";

import Link from "next/link";
import {
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Workspace } from "@/types";

export function WorkspaceCard({
  workspace,
  onEdit,
  onDelete,
}: {
  workspace: Workspace;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group relative gap-0 overflow-hidden p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
          {workspace.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/workspaces/${workspace.slug}`}
            className="block truncate text-base font-semibold hover:text-primary"
          >
            {workspace.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            /{workspace.slug}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Workspace actions"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {workspace.description || "No description yet."}
      </p>

      <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-3.5" /> {workspace.memberCount} members
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FolderKanban className="size-3.5" /> {workspace.projectCount}{" "}
          projects
        </span>
      </div>
    </Card>
  );
}
