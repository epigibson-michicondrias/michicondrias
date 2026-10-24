/**
 * useAdminUserDetail — detalle de una cuenta (`GET /users/{id}`) con documentos KYC firmados y decisión de KYC.
 * Las acciones de editar, activar y borrar reutilizan `useAdminUsers`.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '@/services/adminUsers';
import { verifyUser } from '@/services/moderacion';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';

export function useAdminUserDetail(id: string) {
    const queryClient = useQueryClient();
    const { data: user, isLoading, error } = useQuery({
        queryKey: ['admin-user', id],
        queryFn: () => adminUsersService.getUser(id),
        enabled: !!id,
    });

    const verifyMutation = useMutation({
        mutationFn: (status: 'VERIFIED' | 'REJECTED') => verifyUser(id, status),
        onSuccess: (_r, status) => {
            ['admin-user', 'admin-users', 'pending-verifications'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
            showAlert({ type: 'success', title: status === 'VERIFIED' ? 'Identidad aprobada' : 'Identidad rechazada', message: 'Le avisamos al usuario con una notificación.' });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo guardar la decisión', message: errorMessage(e, 'Inténtalo de nuevo.') }),
    });

    const decideKyc = (status: 'VERIFIED' | 'REJECTED') => {
        if (status === 'VERIFIED') return verifyMutation.mutate(status);
        showAlert({
            type: 'warning',
            title: 'Rechazar identidad',
            message: 'El usuario tendrá que volver a subir sus documentos.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Rechazar',
            onButtonPress: () => verifyMutation.mutate(status),
        });
    };

    return { user, isLoading, notFound: !isLoading && (!!error || !user), decideKyc, isDeciding: verifyMutation.isPending };
}
