import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken, User, getCurrentUser } from '../lib/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load user on mount
        restoreSession();
    }, []);

    async function restoreSession() {
        try {
            const token = await getToken();
            if (token) {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            }
        } catch (error) {
            console.error("Failed to restore session", error);
            await removeToken();
        } finally {
            setIsLoading(false);
        }
    }

    async function signIn(token: string) {
        setIsLoading(true);
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function signOut() {
        setIsLoading(true);
        try {
            await removeToken();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }

    async function reloadUser() {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error("Failed to reload user", error);
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut, reloadUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
