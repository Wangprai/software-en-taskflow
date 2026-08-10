import { Prisma } from "@prisma/client";
import { commentInclude } from "./comment.include";

export type CommentDetail = Prisma.CommentGetPayload<{
  include: typeof commentInclude;
}>;

export type CommentList = CommentDetail[];