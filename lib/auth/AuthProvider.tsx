import { useAuth, useUser } from "@clerk/clerk-expo";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: any; // Using Clerk user type for now
    isLoading: boolean;
    isSignedIn: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { isSignedIn, signOut } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!clerkLoaded) return;

        setIsLoading(true);

        try {
            if (clerkUser && isSignedIn) {
                // For now, just use the Clerk user directly
                setUser(clerkUser);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error syncing user:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
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
