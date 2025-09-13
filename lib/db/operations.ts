// Mock database operations for React Native compatibility
// In production, these would be HTTP requests to your backend API

import { type User } from './schema';

// Mock data storage
let mockUsers: User[] = [];
let userIdCounter = 1;

export const userOperations = {
    // Create a new user
    async createUser(userData: {
        clerkId: string;
        email: string;
        firstName?: string;
        lastName?: string;
        preferences?: string[];
        dietaryRestrictions?: string[];
        imageUrl?: string;
    }): Promise<User> {
        const newUser: User = {
            id: userIdCounter++,
            clerkId: userData.clerkId,
            email: userData.email,
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            preferences: userData.preferences || [],
            dietaryRestrictions: userData.dietaryRestrictions || [],
            imageUrl: userData.imageUrl || null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        console.log('User created:', newUser);
        return newUser;
    },

    // Get user by Clerk ID
    async getUserByClerkId(clerkId: string): Promise<User | null> {
        const user = mockUsers.find((user) => user.clerkId === clerkId);
        return user || null;
    },

    // Get user by email
    async getUserByEmail(email: string): Promise<User | null> {
        const user = mockUsers.find((user) => user.email === email);
        return user || null;
    },

    // Update user profile
    async updateUser(clerkId: string, updates: {
        firstName?: string;
        lastName?: string;
        preferences?: string[];
        dietaryRestrictions?: string[];
        imageUrl?: string;
    }): Promise<User | null> {
        const userIndex = mockUsers.findIndex((user) => user.clerkId === clerkId);
        if (userIndex === -1) return null;

        const updatedUser = {
            ...mockUsers[userIndex],
            ...updates,
            updatedAt: new Date(),
        };
        mockUsers[userIndex] = updatedUser;
        console.log('User updated:', updatedUser);
        return updatedUser;
    },

    // Check if user exists
    async userExists(clerkId: string): Promise<boolean> {
        const user = await this.getUserByClerkId(clerkId);
        return !!user;
    },

    // Get user by ID (for internal use)
    async getUserById(id: number): Promise<User | null> {
        const user = mockUsers.find((user) => user.id === id);
        return user || null;
    },
};