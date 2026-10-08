/**
 * useRegister — creación de cuenta pública (pantalla `(auth)/register`).
 * Login automático (F10): al crear la cuenta se abre la sesión y el usuario cae en Inicio
 * sin volver a escribir sus credenciales.
 */
import { useMutation } from '@tanstack/react-query';
import { login, register } from '@/src/services/auth';
import { useAuth } from '@/src/contexts/AuthContext';
import type { User } from '@/src/types/auth';

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
                // La cuenta ya existe pero no se pudo abrir la sesión: que entre con sus credenciales
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
