/**
 * usePasswordReset — recuperación de contraseña en dos pasos: pedir el correo (`(auth)/forgot-password`)
 * y restablecerla con el código de 6 dígitos (`(auth)/reset-password`). El enlace con token (deep link)
 * sigue funcionando hasta que el código sea el único camino.
 */
import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset, resetPassword, resetPasswordWithCode } from '@/src/services/auth';

interface ResetVars {
    token: string;
    newPassword: string;
}

interface ResetCodeVars {
    email: string;
    code: string;
    newPassword: string;
}

export function usePasswordReset() {
    const requestMutation = useMutation<void, Error, string>({
        mutationFn: (email) => requestPasswordReset(email),
    });

    const resetMutation = useMutation<void, Error, ResetVars>({
        mutationFn: ({ token, newPassword }) => resetPassword(token, newPassword),
    });

    const resetCodeMutation = useMutation<void, Error, ResetCodeVars>({
        mutationFn: ({ email, code, newPassword }) => resetPasswordWithCode(email, code, newPassword),
    });

    return {
        requestReset: requestMutation.mutate,
        isRequesting: requestMutation.isPending,
        resetPassword: resetMutation.mutate,
        isResetting: resetMutation.isPending,
        resetWithCode: resetCodeMutation.mutate,
        isResettingWithCode: resetCodeMutation.isPending,
    };
}
