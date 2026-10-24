/**
 * useAdminVerifications — cola de identidades (KYC) por revisar.
 * Aprobar va directo; rechazar pide confirmación. `busyId` marca la tarjeta que se está procesando.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingVerifications, verifyUser } from '@/services/moderacion';
import type { AdminUserDetail } from '@/services/adminUsers';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';

export type PendingVerification = AdminUserDetail;

export function useAdminVerifications() {
    const queryClient = useQueryClient();
    const [busyId, setBusyId] = useState<string | null>(null);

    const { data: pendingUsers = [], isLoading, isFetching, refetch } = useQuery({
        queryKey: ['pending-verifications'],
        queryFn: async (): Promise<PendingVerification[]> => getPendingVerifications(),
    });

    const verifyMutation = useMutation({
        mutationFn: ({ userId, status }: { userId: string, status: 'VERIFIED' | 'REJECTED' }) => verifyUser(userId, status),
        onMutate: ({ userId }) => setBusyId(userId),
        onSuccess: (_, variables) => {
            ['pending-verifications', 'admin-user', 'admin-users', 'admin-stats'].forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
            showAlert({
                type: 'success',
                title: variables.status === 'VERIFIED' ? 'Identidad aprobada' : 'Identidad rechazada',
                message: variables.status === 'VERIFIED' ? 'La cuenta ya aparece como verificada.' : 'La persona podrá volver a subir sus documentos.',
            });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo completar', message: errorMessage(e, 'No se pudo procesar la verificación.') }),
        onSettled: () => setBusyId(null),
    });

    const handleAction = (userId: string, name: string, status: 'VERIFIED' | 'REJECTED') => {
        if (status === 'VERIFIED') {
            verifyMutation.mutate({ userId, status });
            return;
        }
        showAlert({
            type: 'warning',
            title: 'Rechazar identidad',
            message: `¿Rechazar los documentos de ${name}? Tendrá que subirlos de nuevo para verificarse.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Rechazar',
            onButtonPress: () => verifyMutation.mutate({ userId, status }),
        });
    };

    return {
        pendingUsers,
        isLoading,
        isFetching,
        refetch,
        verifyMutation,
        busyId,
        handleAction,
    };
}
