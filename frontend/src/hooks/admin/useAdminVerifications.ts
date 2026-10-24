/**
 * useAdminVerifications — cola de identidades (KYC) por revisar.
 * Los documentos (INE frente/reverso y comprobante) solo llegan en `GET /users/pending-verifications` y en
 * `GET /users/{id}` (X6.1: los listados generales de usuarios ya no los traen).
 * Aprobar va directo; rechazar pide confirmación. `busyId` marca la tarjeta que se está procesando.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingVerifications, verifyUser } from '@/services/moderacion';
import type { AdminUserDetail } from '@/services/adminUsers';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';

/** La cola de pendientes no trae `created_at` (el helper del backend no lo copia); el resto es el detalle de usuario. */
export type PendingVerification = Omit<AdminUserDetail, 'created_at'> & { created_at?: string | null };

export function useAdminVerifications() {
    const queryClient = useQueryClient();
    const [busyId, setBusyId] = useState<string | null>(null);

    const { data: pendingUsers = [], isLoading, isFetching, isError, refetch } = useQuery({
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
        // El motivo real del servidor viene en el mensaje del ApiError; el fallback solo cubre errores de red.
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo completar', message: errorMessage(e, 'No se pudo procesar la verificación.') }),
        onSettled: () => setBusyId(null),
    });

    /** Aprobar es reversible y de bajo riesgo: se aplica sin confirmar. Rechazar sí confirma. */
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
        isError,
        refetch,
        verifyMutation,
        busyId,
        handleAction,
    };
}
