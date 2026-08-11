import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/hooks";
import { useComments, useCreateComment } from "@/features/comments/hooks";
import { formatRelative } from "@/lib/format";

export function CommentSection({ taskId }: { taskId: string }) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(taskId);
  const create = useCreateComment(taskId);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    create.mutate(body, { onSuccess: () => setDraft("") });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <UserAvatar user={user ?? { id: "anon", name: "Guest", email: "" }} className="size-7" />
        <div className="flex-1 space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            }}
            placeholder="Leave a comment… (⌘↵ to send)"
            className="min-h-20 resize-none"
            aria-label="New comment"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={submit} disabled={!draft.trim() || create.isPending}>
              <Send className="size-3.5" /> Comment
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
          <p className="text-xs text-muted-foreground">Start the discussion for this task.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {(comments ?? []).map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <UserAvatar user={comment.author} className="size-7" />
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-card/60 p-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-medium">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelative(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
