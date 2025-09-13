import { eq } from "drizzle-orm";
import { db } from "./index";
import { recipes, users, type NewRecipe, type NewUser } from "./schema";

// User operations
export const userOperations = {
    // Create a new user
    async create(userData: NewUser) {
        const result = await db.insert(users).values(userData).returning();
        return result[0];
    },

    // Get user by ID
    async getById(id: number) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
    },

    // Get user by email
    async getByEmail(email: string) {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0];
    },

    // Get all users
    async getAll() {
        return await db.select().from(users);
    },

    // Update user
    async update(id: number, userData: Partial<NewUser>) {
        const result = await db
            .update(users)
            .set({ ...userData, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return result[0];
    },

    // Delete user
    async delete(id: number) {
        await db.delete(users).where(eq(users.id, id));
    },
};

// Recipe operations
export const recipeOperations = {
    // Create a new recipe
    async create(recipeData: NewRecipe) {
        const result = await db.insert(recipes).values(recipeData).returning();
        return result[0];
    },

    // Get recipe by ID
    async getById(id: number) {
        const result = await db.select().from(recipes).where(eq(recipes.id, id));
        return result[0];
    },

    // Get all recipes
    async getAll() {
        return await db.select().from(recipes);
    },

    // Get recipes by user ID
    async getByUserId(userId: number) {
        return await db.select().from(recipes).where(eq(recipes.userId, userId));
    },

    // Update recipe
    async update(id: number, recipeData: Partial<NewRecipe>) {
        const result = await db
            .update(recipes)
            .set({ ...recipeData, updatedAt: new Date() })
            .where(eq(recipes.id, id))
            .returning();
        return result[0];
    },

    // Delete recipe
    async delete(id: number) {
        await db.delete(recipes).where(eq(recipes.id, id));
    },
};
