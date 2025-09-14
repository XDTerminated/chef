import { json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Users table with Clerk integration
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 256 }).unique().notNull(),
    email: varchar("email", { length: 256 }).unique().notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    preferences: json("preferences").$type<string[]>().default([]),
    dietaryRestrictions: json("dietary_restrictions").$type<string[]>().default([]),
    imageUrl: varchar("image_url", { length: 512 }),
    // Enhanced preference fields
    ingredients: json("ingredients").$type<string[]>().default([]),
    customIngredients: json("custom_ingredients").$type<string[]>().default([]),
    customCuisines: json("custom_cuisines").$type<string[]>().default([]),
    customDietary: json("custom_dietary").$type<string[]>().default([]),
    skillLevel: varchar("skill_level", { length: 50 }),
    timePreference: varchar("time_preference", { length: 50 }),
    mealTypes: json("meal_types").$type<string[]>().default([]),
    flavorProfiles: json("flavor_profiles").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Recipes table
export const recipes = pgTable("recipes", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description"),
    ingredients: json("ingredients").$type<string[]>().default([]),
    instructions: json("instructions").$type<string[]>().default([]),
    prepTime: varchar("prep_time", { length: 50 }),
    cookTime: varchar("cook_time", { length: 50 }),
    servings: varchar("servings", { length: 20 }),
    imageUrl: varchar("image_url", { length: 512 }),
    calories: varchar("calories", { length: 20 }),
    dietaryInfo: varchar("dietary_info", { length: 100 }),
    tags: json("tags").$type<string[]>().default([]),
    cuisine: varchar("cuisine", { length: 100 }),
    mealType: varchar("meal_type", { length: 50 }),
    flavorProfile: varchar("flavor_profile", { length: 50 }),
    isPersonalized: boolean("is_personalized").default(false),
    personalizedReason: varchar("personalized_reason", { length: 256 }),
    userId: serial("user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
