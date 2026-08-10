import { Prisma } from '@prisma/client';
import { CommentDetail, CommentList } from '../types/comment.type';

export abstract class CommentInterface {
  abstract create(data: Prisma.CommentCreateInput): Promise<CommentDetail>;

  abstract findAllByTaskId(taskId: string): Promise<CommentList>;

  abstract findById(id: string): Promise<CommentDetail | null>;

  abstract findByTaskAndId(
    taskId: string,
    commentId: string,
  ): Promise<CommentDetail | null>;

  abstract update(
    id: string,
    data: Prisma.CommentUpdateInput,
  ): Promise<CommentDetail>;

  abstract delete(id: string): Promise<CommentDetail>;
}
