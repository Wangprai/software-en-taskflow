-- This is an empty migration.
-- Normalize existing user emails
UPDATE "User"
SET "email" = LOWER(TRIM("email"));

-- Prevent duplicate emails regardless of case or surrounding spaces
CREATE UNIQUE INDEX "User_email_lower_key"
ON "User" (LOWER(TRIM("email")));