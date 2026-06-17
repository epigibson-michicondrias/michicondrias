/**
 * useAdminVerifications — Business logic for the admin verifications screen
 * Wraps useQuery for pending verifications and useMutation for verify/reject actions
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingVerifications, verifyUser } from '@/src/services/moderacion';
import { showAlert } from '@/src/components/AppAlert';

export function useAdminVerifications() {
    const queryClient = useQueryClient();

    const { data: pendingUsers = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['pending-verifications'],
        queryFn: getPendingVerifications,
    });

    const verifyMutation = useMutation({
        mutationFn: ({ userId, status }: { userId: string, status: 'VERIFIED' | 'REJECTED' }) => verifyUser(userId, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
            showAlert({ type: 'success', title: 'Éxito', message: `El usuario ha sido ${variables.status === 'VERIFIED' ? 'verificado' : 'rechazado'} correctamente.` });
        },
        onError: () => showAlert({ type: 'error', title: 'Error', message: 'No se pudo procesar la verificación.' }),
    });

    const handleAction = (userId: string, name: string, status: 'VERIFIED' | 'REJECTED') => {
        showAlert({
            type: status === 'VERIFIED' ? 'info' : 'error',
            title: status === 'VERIFIED' ? 'Aprobar Identidad' : 'Rechazar Identidad',
            message: `¿Estás seguro de ${status === 'VERIFIED' ? 'APROBAR' : 'RECHAZAR'} la identidad de ${name}?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: status === 'VERIFIED' ? 'Aprobar' : 'Rechazar',
            onButtonPress: () => verifyMutation.mutate({ userId, status }),
        });
    };

    return {
        pendingUsers,
        isLoading,
        isFetching,
        refetch,
        verifyMutation,
        handleAction,
    };
}
