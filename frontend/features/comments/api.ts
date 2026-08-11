import { api } from "@/lib/axios";
import type { Comment } from "@/types";

export type { Comment };

export interface CommentInput {
  body: string;
}

export const commentsApi = {
  listByTask: (taskId: string) =>
    api.get<Comment[]>(`/tasks/${taskId}/comments`).then((r) => r.data),
  create: (taskId: string, input: CommentInput) =>
    api.post<Comment>(`/tasks/${taskId}/comments`, input).then((r) => r.data),
  remove: (commentId: string) => api.delete(`/comments/${commentId}`).then((r) => r.data),
};
