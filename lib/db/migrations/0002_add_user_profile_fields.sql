-- Add new user profile fields
ALTER TABLE "users" ADD COLUMN "first_name" varchar(100);
ALTER TABLE "users" ADD COLUMN "last_name" varchar(100);
ALTER TABLE "users" ADD COLUMN "preferences" json DEFAULT '[]'::json;
ALTER TABLE "users" ADD COLUMN "dietary_restrictions" json DEFAULT '[]'::json;

-- Make email required
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;

-- Drop the old name column if it exists
ALTER TABLE "users" DROP COLUMN IF EXISTS "name";