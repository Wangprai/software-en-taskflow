import { useState } from "react";
import { Pencil, Trash2, MessageSquare, Send } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useAuth } from "@/features/auth/hooks";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/features/comments/hooks";
import { formatRelative } from "@/lib/format";
import type { Comment } from "@/types";

export function CommentSection({
  slug,
  projectId,
  taskId,
}: {
  slug: string;
  projectId: string;
  taskId: string;
}) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(slug, projectId, taskId);
  const create = useCreateComment(slug, projectId, taskId);
  const update = useUpdateComment(slug, projectId, taskId);
  const remove = useDeleteComment(slug, projectId, taskId);

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const submit = () => {
    const content = draft.trim();

    if (!content) return;

    create.mutate(content, {
      onSuccess: () => setDraft(""),
    });
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = (commentId: string) => {
    const content = editContent.trim();

    if (!content) return;

    update.mutate(
      {
        commentId,
        content,
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent("");
        },
      },
    );
  };

  const deleteComment = (commentId: string) => {
    remove.mutate(commentId);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <UserAvatar
          user={
            user ?? {
              id: "anon",
              name: "Guest",
              email: "",
            }
          }
          className="size-7"
        />

        <div className="flex-1 space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                submit();
              }
            }}
            placeholder="Leave a comment… (⌘↵ to send)"
            className="min-h-20 resize-none"
            aria-label="New comment"
          />

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={submit}
              disabled={!draft.trim() || create.isPending}
            >
              <Send className="size-3.5" />
              Comment
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : (comments ?? []).length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-8 text-center">
          <MessageSquare className="mb-2 size-5 text-muted-foreground" />

          <p className="text-sm font-medium">No comments yet</p>

          <p className="text-xs text-muted-foreground">
            Start the discussion for this task.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {(comments ?? []).map((comment) => {
            const isEditing = editingId === comment.id;

            return (
              <li key={comment.id}>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <div className="flex gap-3">
                      <UserAvatar user={comment.user} className="size-7" />

                      <div className="min-w-0 flex-1 rounded-lg border border-border bg-card/60 p-3">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-medium">
                            {comment.user.name}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {formatRelative(comment.createdAt)}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              autoFocus
                              className="min-h-20 resize-none"
                            />

                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </Button>

                              <Button
                                size="sm"
                                disabled={
                                  !editContent.trim() || update.isPending
                                }
                                onClick={() => saveEdit(comment.id)}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                            {comment.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => startEdit(comment)}>
                      <Pencil className="size-4" />
                      Edit
                    </ContextMenuItem>

                    <ContextMenuSeparator />

                    <ContextMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => deleteComment(comment.id)}
                      disabled={remove.isPending}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
