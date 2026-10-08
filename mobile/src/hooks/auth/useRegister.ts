/**
 * useRegister — creación de cuenta pública (pantalla `(auth)/register`).
 * Hoy solo crea la cuenta; el login automático va en F10.
 */
import { useMutation } from '@tanstack/react-query';
import { register } from '@/src/services/auth';
import type { User } from '@/src/types/auth';

interface RegisterVars {
    email: string;
    password: string;
    fullName: string;
}

export function useRegister() {
    const registerMutation = useMutation<User, Error, RegisterVars>({
        mutationFn: ({ email, password, fullName }) => register(email, password, fullName),
    });

    return {
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
    };
}
