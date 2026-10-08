/**
 * useLogin — inicio de sesión y su continuación con 2FA (pantallas `(auth)/login`).
 * El servicio no guarda el token: aquí, al autenticarse, se deja la sesión lista con `signIn`.
 */
import { useMutation } from '@tanstack/react-query';
import { login, verify2FALogin } from '@/src/services/auth';
import { useAuth } from '@/src/contexts/AuthContext';
import type { LoginResponse, TokenResponse } from '@/src/types/auth';

interface LoginVars {
    email: string;
    password: string;
}

interface Verify2FAVars {
    /** Token temporal que devuelve el login cuando la cuenta tiene 2FA activo. */
    tempToken: string;
    code: string;
}

export function useLogin() {
    const { signIn } = useAuth();

    /** Si la cuenta tiene 2FA responde con `temp_token` y el token final llega en `verify2FA`. */
    const loginMutation = useMutation<LoginResponse, Error, LoginVars>({
        mutationFn: ({ email, password }) => login(email, password),
        onSuccess: async (data) => {
            if (data.access_token) await signIn(data.access_token);
        },
    });

    const verify2FAMutation = useMutation<TokenResponse, Error, Verify2FAVars>({
        mutationFn: ({ tempToken, code }) => verify2FALogin(tempToken, code),
        onSuccess: async (data) => {
            await signIn(data.access_token);
        },
    });

    return {
        login: loginMutation.mutate,
        verify2FA: verify2FAMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isVerifying2FA: verify2FAMutation.isPending,
    };
}
