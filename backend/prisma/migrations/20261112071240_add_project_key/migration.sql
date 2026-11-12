/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,key]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
ALTER TABLE "Project"
ADD COLUMN "key" TEXT;

UPDATE "Project"
SET "key" = 'TASKFLOW'
WHERE "id" = '09d7d14e-70d8-4518-888f-5b440aab17ad';

ALTER TABLE "Project"
ALTER COLUMN "key" SET NOT NULL;

CREATE UNIQUE INDEX "Project_workspaceId_key_key"
ON "Project"("workspaceId", "key");
