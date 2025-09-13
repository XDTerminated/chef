import { type NewRecipe, type NewUser, type Recipe, type User } from "./schema";

// Mock data storage for React Native compatibility
// In production, these would be HTTP requests to your backend API
let mockUsers: User[] = [];
let mockRecipes: Recipe[] = [];
let userIdCounter = 1;
let recipeIdCounter = 1;

// User operations
export const userOperations = {
    // Create a new user
    async create(userData: NewUser): Promise<User> {
        const newUser: User = {
            id: userIdCounter++,
            clerkId: userData.clerkId,
            name: userData.name || null,
            email: userData.email || null,
            imageUrl: userData.imageUrl || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        return newUser;
    },

    // Get user by ID
    async getById(id: number): Promise<User | undefined> {
        return mockUsers.find((user) => user.id === id);
    },

    // Get user by email
    async getByEmail(email: string): Promise<User | undefined> {
        return mockUsers.find((user) => user.email === email);
    },

    // Get user by Clerk ID
    async getByClerkId(clerkId: string): Promise<User | undefined> {
        return mockUsers.find((user) => user.clerkId === clerkId);
    },

    // Get all users
    async getAll(): Promise<User[]> {
        return [...mockUsers];
    },

    // Update user
    async update(id: number, userData: Partial<NewUser>): Promise<User | undefined> {
        const userIndex = mockUsers.findIndex((user) => user.id === id);
        if (userIndex === -1) return undefined;

        const updatedUser = {
            ...mockUsers[userIndex],
            ...userData,
            updatedAt: new Date(),
        };
        mockUsers[userIndex] = updatedUser;
        return updatedUser;
    },

    // Delete user
    async delete(id: number): Promise<void> {
        const userIndex = mockUsers.findIndex((user) => user.id === id);
        if (userIndex !== -1) {
            mockUsers.splice(userIndex, 1);
        }
    },
};

// Recipe operations
export const recipeOperations = {
    // Create a new recipe
    async create(recipeData: NewRecipe): Promise<Recipe> {
        const newRecipe: Recipe = {
            id: recipeIdCounter++,
            title: recipeData.title,
            description: recipeData.description || null,
            ingredients: recipeData.ingredients,
            instructions: recipeData.instructions,
            cookingTime: recipeData.cookingTime || null,
            difficulty: recipeData.difficulty || null,
            userId: recipeData.userId || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockRecipes.push(newRecipe);
        return newRecipe;
    },

    // Get recipe by ID
    async getById(id: number): Promise<Recipe | undefined> {
        return mockRecipes.find((recipe) => recipe.id === id);
    },

    // Get all recipes
    async getAll(): Promise<Recipe[]> {
        return [...mockRecipes];
    },

    // Get recipes by user ID
    async getByUserId(userId: number): Promise<Recipe[]> {
        return mockRecipes.filter((recipe) => recipe.userId === userId);
    },

    // Update recipe
    async update(id: number, recipeData: Partial<NewRecipe>): Promise<Recipe | undefined> {
        const recipeIndex = mockRecipes.findIndex((recipe) => recipe.id === id);
        if (recipeIndex === -1) return undefined;

        const updatedRecipe = {
            ...mockRecipes[recipeIndex],
            ...recipeData,
            updatedAt: new Date(),
        };
        mockRecipes[recipeIndex] = updatedRecipe;
        return updatedRecipe;
    },

    // Delete recipe
    async delete(id: number): Promise<void> {
        const recipeIndex = mockRecipes.findIndex((recipe) => recipe.id === id);
        if (recipeIndex !== -1) {
            mockRecipes.splice(recipeIndex, 1);
        }
    },
};
