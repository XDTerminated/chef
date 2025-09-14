// Database operations using Drizzle with Neon serverless (React Native compatible)
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { users, type User } from "./schema";

// Initialize Neon HTTP client (works in React Native)
const sql = neon("postgresql://neondb_owner:npg_6SJaPceBxUE5@ep-fragrant-dream-adwyedn3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require");
const db = drizzle(sql);

export const userOperations = {
    // Create a new user
    async createUser(userData: { clerkId: string; email: string; firstName?: string; lastName?: string; preferences?: string[]; dietaryRestrictions?: string[]; imageUrl?: string }): Promise<User> {
        try {
            console.log("Creating user in database:", userData);

            // Insert user into Neon database using Drizzle
            const [newUser] = await db
                .insert(users)
                .values({
                    clerkId: userData.clerkId,
                    email: userData.email,
                    firstName: userData.firstName || null,
                    lastName: userData.lastName || null,
                    preferences: userData.preferences || [],
                    dietaryRestrictions: userData.dietaryRestrictions || [],
                    imageUrl: userData.imageUrl || null,
                    ingredients: [],
                    customIngredients: [],
                    customCuisines: [],
                    customDietary: [],
                    skillLevel: null,
                    timePreference: null,
                    mealTypes: [],
                    flavorProfiles: [],
                })
                .returning();

            console.log("User created successfully in database:", newUser);
            return newUser;
        } catch (error) {
            console.error("Error creating user in database:", error);
            throw error;
        }
    },

    // Get user by Clerk ID
    async getUserByClerkId(clerkId: string): Promise<User | null> {
        try {
            console.log("Getting user by clerk ID from database:", clerkId);

            // Query Neon database using Drizzle
            const result = await db.select().from(users).where(eq(users.clerkId, clerkId));

            if (result.length === 0) {
                console.log("User not found in database");
                return null;
            }

            console.log("User found in database:", result[0]);
            return result[0];
        } catch (error) {
            console.error("Error getting user by clerk ID:", error);
            return null;
        }
    },

    // Get user by email
    async getUserByEmail(email: string): Promise<User | null> {
        try {
            console.log("Getting user by email from database:", email);

            // Query Neon database using Drizzle
            const result = await db.select().from(users).where(eq(users.email, email));

            if (result.length === 0) {
                console.log("User not found in database");
                return null;
            }

            console.log("User found in database:", result[0]);
            return result[0];
        } catch (error) {
            console.error("Error getting user by email:", error);
            return null;
        }
    },

    // Update user profile
    async updateUser(
        clerkId: string,
        updates: {
            firstName?: string;
            lastName?: string;
            preferences?: string[];
            dietaryRestrictions?: string[];
            imageUrl?: string;
        }
    ): Promise<User | null> {
        try {
            console.log("Updating user in database:", clerkId, updates);

            // Update user in Neon database using Drizzle
            const [updatedUser] = await db
                .update(users)
                .set({
                    ...updates,
                    updatedAt: new Date(),
                })
                .where(eq(users.clerkId, clerkId))
                .returning();

            if (!updatedUser) {
                console.log("User not found for update");
                return null;
            }

            console.log("User updated successfully in database:", updatedUser);
            return updatedUser;
        } catch (error) {
            console.error("Error updating user:", error);
            return null;
        }
    },

    // Check if user exists
    async userExists(clerkId: string): Promise<boolean> {
        const user = await this.getUserByClerkId(clerkId);
        return !!user;
    },

    // Get user by ID (for internal use)
    async getUserById(id: number): Promise<User | null> {
        try {
            console.log("Getting user by ID from database:", id);

            // Query Neon database using Drizzle
            const result = await db.select().from(users).where(eq(users.id, id));

            if (result.length === 0) {
                console.log("User not found in database");
                return null;
            }

            console.log("User found in database:", result[0]);
            return result[0];
        } catch (error) {
            console.error("Error getting user by ID:", error);
            return null;
        }
    },
};
