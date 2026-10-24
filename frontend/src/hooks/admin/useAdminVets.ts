/**
 * useAdminVets — cuentas con rol veterinario (`GET /users/search?role=veterinario`) y perfiles del directorio
 * pendientes de aprobación (`GET /veterinarians/admin/pending` + approve/reject).
 * Espejo parcial de `mobile/src/hooks/admin/useAdminVets.ts`; la cola de aprobación es adición de la web.
 */
import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUsersService } from '@/services/adminUsers';
import { approveVeterinarian, getPendingVeterinarians, rejectVeterinarian } from '@/services/moderacion';
import type { Vet } from '@/services/directorio';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';

/** Perfil de veterinario del directorio (entidad distinta a la cuenta de usuario). */
export type PendingVetProfile = Vet;

export function useAdminVets() {
    const queryClient = useQueryClient();
    const [q, setQ] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', { role: 'veterinario', q }],
        queryFn: () => adminUsersService.searchUsers({ role: 'veterinario', q: q.trim() || undefined, limit: 200, order_by: 'name_asc' }),
        placeholderData: keepPreviousData,
    });

    const pendingQuery = useQuery({
        queryKey: ['admin-vets-pending'],
        queryFn: getPendingVeterinarians,
    });

    const run = async (action: 'approve' | 'reject', vet: PendingVetProfile, name: string) => {
        setBusyId(vet.id);
        try {
            if (action === 'approve') await approveVeterinarian(vet.id);
            else await rejectVeterinarian(vet.id);
            // Misma cola que usa /admin/moderación y la lista pública del directorio
            ['admin-vets-pending', 'pending-vets', 'vets', 'admin-users'].forEach((k) =>
                queryClient.invalidateQueries({ queryKey: [k] }),
            );
            showAlert({
                type: 'success',
                title: action === 'approve' ? 'Veterinario aprobado' : 'Solicitud rechazada',
                message:
                    action === 'approve'
                        ? `El perfil de ${name} ya aparece en el directorio.`
                        : `Se eliminó la solicitud de ${name}.`,
            });
        } catch (e) {
            showAlert({ type: 'error', title: 'No se pudo completar', message: errorMessage(e, 'Inténtalo de nuevo.') });
        } finally {
            setBusyId(null);
        }
    };

    /** Aprobar va directo; rechazar pide confirmación (borra el perfil del directorio). */
    const handlePendingAction = (action: 'approve' | 'reject', vet: PendingVetProfile) => {
        const name = [vet.first_name, vet.last_name].filter(Boolean).join(' ') || 'este veterinario';
        if (action === 'approve') return run('approve', vet, name);
        showAlert({
            type: 'warning',
            title: 'Rechazar solicitud',
            message: `¿Rechazar el perfil de ${name}? Se eliminará del directorio y no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Rechazar',
            onButtonPress: () => run('reject', vet, name),
        });
    };

    return {
        vets: data?.items ?? [],
        total: data?.total ?? 0,
        isLoading,
        q,
        setQ,
        pending: pendingQuery.data ?? [],
        pendingLoading: pendingQuery.isLoading,
        pendingBusyId: busyId,
        handlePendingAction,
    };
}
