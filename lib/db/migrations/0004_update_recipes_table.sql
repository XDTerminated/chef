-- Update recipes table to support local recipe storage
ALTER TABLE "recipes" DROP COLUMN IF EXISTS "ingredients";
ALTER TABLE "recipes" DROP COLUMN IF EXISTS "instructions";

-- Add new columns for enhanced recipe storage
ALTER TABLE "recipes" ADD COLUMN "ingredients" json DEFAULT '[]'::json;
ALTER TABLE "recipes" ADD COLUMN "instructions" json DEFAULT '[]'::json;
ALTER TABLE "recipes" ADD COLUMN "prep_time" varchar(50);
ALTER TABLE "recipes" ADD COLUMN "cook_time" varchar(50);
ALTER TABLE "recipes" ADD COLUMN "servings" varchar(20);
ALTER TABLE "recipes" ADD COLUMN "image_url" varchar(512);
ALTER TABLE "recipes" ADD COLUMN "calories" varchar(20);
ALTER TABLE "recipes" ADD COLUMN "dietary_info" varchar(100);
ALTER TABLE "recipes" ADD COLUMN "tags" json DEFAULT '[]'::json;
ALTER TABLE "recipes" ADD COLUMN "cuisine" varchar(100);
ALTER TABLE "recipes" ADD COLUMN "meal_type" varchar(50);
ALTER TABLE "recipes" ADD COLUMN "flavor_profile" varchar(50);
ALTER TABLE "recipes" ADD COLUMN "is_personalized" boolean DEFAULT false;
ALTER TABLE "recipes" ADD COLUMN "personalized_reason" varchar(256);