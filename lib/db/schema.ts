import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Users table with Clerk integration
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 256 }).unique().notNull(),
    name: varchar("name", { length: 256 }),
    email: varchar("email", { length: 256 }).unique(),
    imageUrl: varchar("image_url", { length: 512 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
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
