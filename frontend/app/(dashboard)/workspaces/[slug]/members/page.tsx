"use client";

import { Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { AddMemberDialog } from "@/features/workspace-members/components/add-member-dialog";
import { RoleBadge } from "@/features/workspace-members/components/role-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { RowsSkeleton } from "@/components/shared/skeletons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMembers, useRemoveMember } from "@/features/workspace-members/hooks";
import { formatDate } from "@/lib/format";
import type { WorkspaceMember } from "@/types";

export default function MembersPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: members, isLoading } = useMembers(slug);
  const removeMember = useRemoveMember(slug);
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<WorkspaceMember | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="People with access to this workspace and its projects."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" /> Add member
          </Button>
        }
      />

      {isLoading && <RowsSkeleton />}

      {members && members.length === 0 && (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Invite your teammates so they can collaborate on projects."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus className="size-4" /> Add member
            </Button>
          }
        />
      )}

      {members && members.length > 0 && (
        <Card className="gap-0 overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14" />
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <UserAvatar user={member.user} />
                  </TableCell>
                  <TableCell className="font-medium">{member.user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{member.user.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={member.role} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.joinedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${member.user.name}`}
                      onClick={() => setRemoving(member)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AddMemberDialog slug={slug} open={addOpen} onOpenChange={setAddOpen} />

      <ConfirmDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing?.user.name}?`}
        description="They will immediately lose access to this workspace."
        confirmLabel="Remove"
        onConfirm={() => {
          if (removing) removeMember.mutate(removing.id);
          setRemoving(null);
        }}
      />
    </div>
  );
}
