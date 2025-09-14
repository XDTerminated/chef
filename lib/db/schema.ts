import { json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Users table with all the fields from your database
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").unique().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    preferences: json("preferences").$type<string[]>().default([]),
    dietaryRestrictions: json("dietary_restrictions").$type<string[]>().default([]),
    clerkId: varchar("clerk_id", { length: 256 }).unique().notNull(),
    imageUrl: varchar("image_url", { length: 512 }),
    ingredients: json("ingredients").$type<string[]>().default([]),
    customIngredients: json("custom_ingredients").$type<string[]>().default([]),
    customCuisines: json("custom_cuisines").$type<string[]>().default([]),
    customDietary: json("custom_dietary").$type<string[]>().default([]),
    skillLevel: varchar("skill_level", { length: 50 }),
    timePreference: varchar("time_preference", { length: 50 }),
    mealTypes: json("meal_types").$type<string[]>().default([]),
    flavorProfiles: json("flavor_profiles").$type<string[]>().default([]),
});

// Example Recipes table (since this appears to be a chef app)
export const recipes = pgTable("recipes", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    ingredients: text("ingredients").notNull(),
    instructions: text("instructions").notNull(),
    cookingTime: varchar("cooking_time", { length: 50 }),
    difficulty: varchar("difficulty", { length: 20 }),
    userId: serial("user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
