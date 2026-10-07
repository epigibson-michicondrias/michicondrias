import React, { createContext, useCallback, useContext, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, getCurrentUser, saveCachedUser, getCachedUser, clearStoredSession } from '../lib/auth';
import { ApiError, getToken, setUnauthorizedHandler } from '../lib/api';
import { clearStoredCart } from '../lib/cartStorage';
import { showAlert } from '@/src/components/AppAlert';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    /** Carga el usuario después de que `login`/`verify2FALogin` guardaron el token. */
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** El token ya no sirve (vencido, inválido) o la cuenta no existe / está inactiva. Un error de red NO cuenta. */
function isInvalidSession(error: unknown) {
    return error instanceof ApiError && (error.sessionExpired || error.status === 400 || error.status === 404);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Copia síncrona de `user` para el aviso de sesión vencida (llega desde fuera de React, vía apiFetch).
    const userRef = useRef<User | null>(null);

    const setUser = useCallback((next: User | null) => {
        userRef.current = next;
        setUserState(next);
        if (next) saveCachedUser(next);
    }, []);

    /** Deja el dispositivo sin rastro de la sesión: token, copia del usuario y datos en caché de React Query. */
    const endSession = useCallback(async () => {
        userRef.current = null;
        setUserState(null);
        await clearStoredSession();
        queryClient.clear();
    }, [queryClient]);

    // apiFetch avisa cuando el backend rechaza el token: se cierra la sesión y _layout lleva a /login.
    useEffect(() => {
        setUnauthorizedHandler(() => {
            if (!userRef.current) return;
            endSession();
            showAlert({ type: 'info', title: 'Tu sesión expiró', message: 'Por seguridad, vuelve a iniciar sesión.' });
        });
        return () => setUnauthorizedHandler(null);
    }, [endSession]);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                try {
                    setUser(await getCurrentUser());
                } catch (error) {
                    if (isInvalidSession(error)) {
                        await endSession();
                    } else {
                        // Sin conexión o servidor caído: se entra con la copia local y la sesión sigue viva.
                        const cached = await getCachedUser();
                        if (cached) setUser(cached);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, [setUser, endSession]);

    const signIn = useCallback(async () => {
        setIsLoading(true);
        try {
            // Nada de la sesión anterior debe verse con la nueva cuenta
            queryClient.clear();
            setUser(await getCurrentUser());
        } finally {
            setIsLoading(false);
        }
    }, [queryClient, setUser]);

    const signOut = useCallback(async () => {
        setIsLoading(true);
        try {
            // Cierre voluntario: además se borran el carrito y la dirección guardados de esta cuenta
            if (userRef.current) await clearStoredCart(userRef.current.id);
            await endSession();
        } finally {
            setIsLoading(false);
        }
    }, [endSession]);

    const reloadUser = useCallback(async () => {
        try {
            setUser(await getCurrentUser());
        } catch (error) {
            // Cuenta desactivada o eliminada mientras la sesión estaba abierta → fuera.
            // Sin red se conserva el usuario actual; si el token venció, apiFetch ya avisó.
            if (isInvalidSession(error) && userRef.current) await endSession();
        }
    }, [setUser, endSession]);

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
