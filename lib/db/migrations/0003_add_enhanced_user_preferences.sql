-- Add enhanced user preference fields
ALTER TABLE "users" ADD COLUMN "ingredients" json DEFAULT '[]'::json;
ALTER TABLE "users" ADD COLUMN "custom_ingredients" json DEFAULT '[]'::json;
ALTER TABLE "users" ADD COLUMN "custom_cuisines" json DEFAULT '[]'::json;
ALTER TABLE "users" ADD COLUMN "custom_dietary" json DEFAULT '[]'::json;
ALTER TABLE "users" ADD COLUMN "skill_level" varchar(50);
ALTER TABLE "users" ADD COLUMN "time_preference" varchar(50);
ALTER TABLE "users" ADD COLUMN "meal_types" json DEFAULT '[]'::json;
ALTER TABLE "users" ADD COLUMN "flavor_profiles" json DEFAULT '[]'::json;