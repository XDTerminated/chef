import { useAuth, useUser } from "@clerk/clerk-expo";
import React, { createContext, useContext, useEffect, useState } from "react";
import { userAPI } from "../api/users";
import { User } from "../db/schema";

interface AuthContextType {
    user: any; // Using Clerk user type for now
    dbUser: User | null; // Our database user with preferences
    isLoading: boolean;
    isSignedIn: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { isSignedIn, signOut } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [dbUser, setDbUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        if (clerkUser && isSignedIn) {
            try {
                // Try to get user from our database
                let dbUserData = await userAPI.getUserByClerkId(clerkUser.id);

                // If user doesn't exist in our DB, create them
                if (!dbUserData) {
                    dbUserData = await userAPI.createOrUpdateUser({
                        clerkId: clerkUser.id,
                        email: clerkUser.emailAddresses[0]?.emailAddress || "",
                        firstName: clerkUser.firstName || "",
                        lastName: clerkUser.lastName || "",
                        imageUrl: clerkUser.imageUrl || "",
                    });
                }

                // Parse JSON strings to arrays if needed
                if (dbUserData) {
                    const jsonFields = ['preferences', 'dietaryRestrictions', 'ingredients', 'customIngredients', 'customCuisines', 'customDietary', 'mealTypes', 'flavorProfiles'];
                    jsonFields.forEach(field => {
                        if (typeof dbUserData[field] === 'string') {
                            dbUserData[field] = JSON.parse(dbUserData[field]);
                        }
                    });
                }

                setDbUser(dbUserData);
            } catch (error) {
                console.error("Error syncing user with database:", error);
            }
        } else {
            setDbUser(null);
        }
    };

    useEffect(() => {
        if (!clerkLoaded) return;

        setIsLoading(true);

        const syncUser = async () => {
            try {
                if (clerkUser && isSignedIn) {
                    setUser(clerkUser);

                    // Try to get user from our database
                    let dbUserData = await userAPI.getUserByClerkId(clerkUser.id);

                    // If user doesn't exist in our DB, create them
                    if (!dbUserData) {
                        dbUserData = await userAPI.createOrUpdateUser({
                            clerkId: clerkUser.id,
                            email: clerkUser.emailAddresses[0]?.emailAddress || "",
                            firstName: clerkUser.firstName || "",
                            lastName: clerkUser.lastName || "",
                            imageUrl: clerkUser.imageUrl || "",
                        });
                    }

                    // Parse JSON strings to arrays if needed
                    if (dbUserData) {
                        const jsonFields = ['preferences', 'dietaryRestrictions', 'ingredients', 'customIngredients', 'customCuisines', 'customDietary', 'mealTypes', 'flavorProfiles'];
                        jsonFields.forEach(field => {
                            if (typeof dbUserData[field] === 'string') {
                                dbUserData[field] = JSON.parse(dbUserData[field]);
                            }
                        });
                    }

                    setDbUser(dbUserData);
                } else {
                    setUser(null);
                    setDbUser(null);
                }
            } catch (error) {
                console.error("Error syncing user:", error);
                setUser(null);
                setDbUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        syncUser();
    }, [clerkUser, isSignedIn, clerkLoaded]);

    const value: AuthContextType = {
        user,
        dbUser,
        isLoading,
        isSignedIn: isSignedIn || false,
        signOut,
        refreshUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
