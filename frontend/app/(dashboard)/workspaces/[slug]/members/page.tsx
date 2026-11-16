"use client";

import { Trash2, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  useMembers,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/features/workspace-members/hooks";
import { formatDate } from "@/lib/format";
import type { Role, WorkspaceMember } from "@/types";
import { useWorkspace } from "@/features/workspaces/hooks";
import { useAuth } from "@/providers/auth-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransferOwnershipDialog } from "@/features/workspace-members/components/transfer-member-dialog";
import { LeaveWorkspaceDialog } from "@/features/workspace-members/components/leave-workspace-dialog";

export default function MembersPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: members, isLoading } = useMembers(slug);
  const { data: workspace } = useWorkspace(slug);

  const { user } = useAuth();
  const isOwner = Boolean(workspace && user && workspace.ownerId === user.id);

  const currentMember = members?.find((member) => member.user.id === user?.id);

  const isAdmin = currentMember?.role === "ADMIN";
  const canInvite = Boolean(workspace && members && (isOwner || isAdmin));

  const updateMemberRole = useUpdateMemberRole(slug);

  const removeMember = useRemoveMember(slug);
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<WorkspaceMember | null>(null);

  const [transferOpen, setTransferOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const sortedMembers = useMemo(() => {
    if (!members || !workspace) return [];

    const roleOrder = {
      ADMIN: 1,
      MEMBER: 2,
    };

    return [...members].sort((a, b) => {
      const aIsOwner = a.user.id === workspace.ownerId;
      const bIsOwner = b.user.id === workspace.ownerId;

      if (aIsOwner) return -1;
      if (bIsOwner) return 1;

      const roleDifference = roleOrder[a.role] - roleOrder[b.role];

      if (roleDifference !== 0) return roleDifference;

      return a.user.name.localeCompare(b.user.name);
    });
  }, [members, workspace]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="People with access to this workspace and its projects."
        actions={
          canInvite ? (
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus className="size-4" /> Add member
            </Button>
          ) : undefined
        }
      />

      {isLoading && <RowsSkeleton />}

      {members && members.length === 0 && (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Invite your teammates so they can collaborate on projects."
          action={
            canInvite ? (
              <Button onClick={() => setAddOpen(true)}>
                <UserPlus className="size-4" /> Add member
              </Button>
            ) : undefined
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
                {isOwner && (
                  <TableHead className="w-16 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <UserAvatar user={member.user} />
                  </TableCell>
                  <TableCell className="font-medium">
                    {member.user.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.user.email}
                  </TableCell>
                  <TableCell>
                    {member.user.id === workspace?.ownerId ? (
                      <RoleBadge role="OWNER" />
                    ) : isOwner ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          updateMemberRole.mutate({
                            memberId: member.id,
                            role: value as Role,
                          })
                        }
                        disabled={updateMemberRole.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="MEMBER">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.joinedAt)}
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {member.user.id !== workspace?.ownerId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${member.user.name}`}
                          onClick={() => setRemoving(member)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {workspace && user && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Workspace Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage workspace ownership and your membership.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {isOwner && (
                <Button variant="outline" onClick={() => setTransferOpen(true)}>
                  Transfer ownership
                </Button>
              )}

              <Button variant="destructive" onClick={() => setLeaveOpen(true)}>
                Leave workspace
              </Button>
            </div>
          </div>
        </Card>
      )}

      {workspace && user && members && (
        <>
          {isOwner && (
            <TransferOwnershipDialog
              slug={slug}
              members={members}
              currentUserId={user.id}
              open={transferOpen}
              onOpenChange={setTransferOpen}
            />
          )}

          <LeaveWorkspaceDialog
            slug={slug}
            members={members}
            currentUserId={user.id}
            isOwner={isOwner}
            open={leaveOpen}
            onOpenChange={setLeaveOpen}
          />
        </>
      )}

      {canInvite && (
        <AddMemberDialog slug={slug} open={addOpen} onOpenChange={setAddOpen} />
      )}

      {isOwner && (
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
      )}
    </div>
  );
}
