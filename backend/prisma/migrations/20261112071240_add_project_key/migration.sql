/*
  Warnings:

  - A unique constraint covering the columns `[workspaceId,key]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Project` table without a default value. This is not possible if the table is not empty.

*/

-- 1. Add project key column
ALTER TABLE "Project"
ADD COLUMN "key" TEXT;

-- 2. Generate unique keys for all existing projects
DO $$
DECLARE
    project_record RECORD;
    base_key TEXT;
    candidate_key TEXT;
    suffix INTEGER;
BEGIN
    FOR project_record IN
        SELECT
            id,
            "workspaceId" AS workspace_id,
            name
        FROM "Project"
        ORDER BY "workspaceId", "createdAt", id
    LOOP
        -- Generate base key from the first word of project name
        base_key := UPPER(
            REGEXP_REPLACE(
                (REGEXP_SPLIT_TO_ARRAY(BTRIM(project_record.name), '\s+'))[1],
                '[^a-zA-Z0-9]',
                '',
                'g'
            )
        );

        -- Fallback when project name has no valid characters
        IF base_key IS NULL OR base_key = '' THEN
            base_key := 'PROJECT';
        END IF;

        candidate_key := base_key;
        suffix := 2;

        -- Ensure key is unique within the workspace
        WHILE EXISTS (
            SELECT 1
            FROM "Project" p
            WHERE p."workspaceId" = project_record.workspace_id
              AND p."key" = candidate_key
        ) LOOP
            candidate_key := base_key || '-' || suffix;
            suffix := suffix + 1;
        END LOOP;

        -- Update project key
        UPDATE "Project"
        SET "key" = candidate_key
        WHERE id = project_record.id;
    END LOOP;
END $$;

-- 3. Make project key required
ALTER TABLE "Project"
ALTER COLUMN "key" SET NOT NULL;

-- 4. Add unique constraint per workspace
CREATE UNIQUE INDEX "Project_workspaceId_key_key"
ON "Project"("workspaceId", "key");
