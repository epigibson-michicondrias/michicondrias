/**
 * useRegister — creación de cuenta pública (página `(auth)/register`).
 * Espejo de `mobile/src/hooks/auth/useRegister.ts`. Login automático (F10): al crear la cuenta se abre la
 * sesión y el usuario cae en Inicio sin volver a escribir sus credenciales.
 */
import { useMutation } from '@tanstack/react-query';
import { login, register } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/auth';

interface RegisterVars {
    email: string;
    password: string;
    fullName: string;
}

export function useRegister() {
    const { signIn } = useAuth();

    const registerMutation = useMutation<User, Error, RegisterVars>({
        mutationFn: async ({ email, password, fullName }) => {
            const user = await register(email, password, fullName);
            try {
                // Misma pareja email/contraseña que se acaba de crear: el backend no exige distinguir mayúsculas (F11)
                const data = await login(email, password);
                if (data.access_token) await signIn(data.access_token);
            } catch {
                throw new Error('Tu cuenta se creó, pero no se pudo iniciar sesión automáticamente. Entra con tu correo y contraseña.');
            }
            return user;
        },
    });

    return {
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
    };
}
