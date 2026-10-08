/**
 * usePasswordReset — recuperación de contraseña en dos pasos: pedir el correo (`(auth)/forgot-password`)
 * y restablecerla con el token del enlace (`(auth)/reset-password`). El código de 6 dígitos va en F12.
 */
import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset, resetPassword } from '@/src/services/auth';

interface ResetVars {
    token: string;
    newPassword: string;
}

export function usePasswordReset() {
    const requestMutation = useMutation<void, Error, string>({
        mutationFn: (email) => requestPasswordReset(email),
    });

    const resetMutation = useMutation<void, Error, ResetVars>({
        mutationFn: ({ token, newPassword }) => resetPassword(token, newPassword),
    });

    return {
        requestReset: requestMutation.mutate,
        isRequesting: requestMutation.isPending,
        resetPassword: resetMutation.mutate,
        isResetting: resetMutation.isPending,
    };
}
