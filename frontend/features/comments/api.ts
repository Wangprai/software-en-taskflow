import { api } from "@/lib/axios";
import type { Comment } from "@/types";

export type { Comment };

export interface CommentInput {
  content: string;
}

export const commentsApi = {
  listByTask: (slug: string, projectId: string, taskId: string) =>
    api
      .get<
        Comment[]
      >(`/workspaces/${slug}/projects/${projectId}/tasks/${taskId}/comments`)
      .then((r) => r.data),

  create: (
    slug: string,
    projectId: string,
    taskId: string,
    input: CommentInput,
  ) =>
    api
      .post<Comment>(
        `/workspaces/${slug}/projects/${projectId}/tasks/${taskId}/comments`,
        input,
      )
      .then((r) => r.data),

  update: (
    slug: string,
    projectId: string,
    taskId: string,
    commentId: string,
    input: CommentInput,
  ) =>
    api
      .patch<Comment>(
        `/workspaces/${slug}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
        input,
      )
      .then((r) => r.data),

  remove: (
    slug: string,
    projectId: string,
    taskId: string,
    commentId: string,
  ) =>
    api.delete(
      `/workspaces/${slug}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    ),
};
