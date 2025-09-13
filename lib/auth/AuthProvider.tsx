import { useAuth, useUser } from "@clerk/clerk-expo";
import React, { createContext, useContext, useEffect, useState } from "react";
import { userOperations } from "../db/operations";
import type { User } from "../db/schema";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { isSignedIn, signOut } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function syncUser() {
            if (!clerkLoaded) return;

            setIsLoading(true);

            try {
                if (clerkUser && isSignedIn) {
                    // Check if user exists in our database
                    let dbUser = await userOperations.getByClerkId(clerkUser.id);

                    if (!dbUser) {
                        // Create user in our database
                        dbUser = await userOperations.create({
                            clerkId: clerkUser.id,
                            name: clerkUser.fullName || clerkUser.firstName || "",
                            email: clerkUser.primaryEmailAddress?.emailAddress || "",
                            imageUrl: clerkUser.imageUrl || "",
                        });
                    } else {
                        // Update user info if it has changed
                        const shouldUpdate = dbUser.name !== (clerkUser.fullName || clerkUser.firstName || "") || dbUser.email !== (clerkUser.primaryEmailAddress?.emailAddress || "") || dbUser.imageUrl !== (clerkUser.imageUrl || "");

                        if (shouldUpdate) {
                            dbUser = await userOperations.update(dbUser.id, {
                                name: clerkUser.fullName || clerkUser.firstName || "",
                                email: clerkUser.primaryEmailAddress?.emailAddress || "",
                                imageUrl: clerkUser.imageUrl || "",
                            });
                        }
                    }

                    setUser(dbUser ?? null);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Error syncing user:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }

        syncUser();
    }, [clerkUser, isSignedIn, clerkLoaded]);

    const value: AuthContextType = {
        user,
        isLoading,
        isSignedIn: isSignedIn || false,
        signOut,
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
