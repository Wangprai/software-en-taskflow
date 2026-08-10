import { Injectable } from '@nestjs/common';
import { CommentInterface } from '../interfaces/comment.interface.abstract';
import { PrismaService } from '../../../prisma/prisma.service';
import { Comment, Prisma } from '@prisma/client';
import { CommentDetail, CommentList } from '../types/comment.type';
import { commentInclude } from '../types/comment.include';

@Injectable()
export class CommentRepository implements CommentInterface {
  constructor(private readonly prisma: PrismaService) {}

  // Create comment in database
  async create(data: Prisma.CommentCreateInput): Promise<CommentDetail> {
    return this.prisma.comment.create({
      data,
      include: commentInclude,
    });
  }

  // find comment by task ID
  async findAllByTaskId(taskId: string): Promise<CommentList> {
    return this.prisma.comment.findMany({
      where: {
        taskId,
      },
      include: commentInclude,
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // find comment by ID
  async findById(id: string): Promise<CommentDetail | null> {
    return this.prisma.comment.findUnique({
      where: {
        id,
      },
      include: commentInclude,
    });
  }

  // find by task and comment ID
  async findByTaskAndId(
    taskId: string,
    commentId: string,
  ): Promise<CommentDetail | null> {
    return this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
      },
      include: commentInclude,
    });
  }

  // Update comment
  async update(
    id: string,
    data: Prisma.CommentUpdateInput,
  ): Promise<CommentDetail> {
    return this.prisma.comment.update({
      where: {
        id,
      },
      data,
      include: commentInclude,
    });
  }

  // Delete comment
  async delete(id: string): Promise<CommentDetail> {
    return this.prisma.comment.delete({
      where: {
        id,
      },
      include: commentInclude,
    });
  }
}
