/**
 * usePetHealth — carnet para las pestañas Salud e Historial de la ficha (espejo de
 * `mobile/src/hooks/carnet/usePetHealth.ts`). Las queries solo se piden con la pestaña visible.
 */
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeRole } from '@/constants/roles';
import { getRecordsByPet, getVaccinesByPet, deleteVaccine, deleteRecord } from '@/services/carnet';
import { showAlert } from '@/components/AppAlert';
import type { Pet } from '@/types/mascotas';

const CLINICAL_ROLES = ['veterinario', 'hospital', 'admin'];

export function usePetHealth(petId: string | undefined, pet: Pet | undefined, section: 'salud' | 'historial' | null) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const role = normalizeRole(user?.role_name);
    const isOwner = !!pet && pet.owner_id === user?.id;
    const isClinical = CLINICAL_ROLES.includes(role);
    const canEdit = isOwner || isClinical;

    const enabled = !!petId;
    const records = useQuery({
        queryKey: ['pet-records', petId],
        queryFn: () => getRecordsByPet(petId!),
        enabled: enabled && section === 'historial',
    });
    const vaccines = useQuery({
        queryKey: ['pet-vaccines', petId],
        queryFn: () => getVaccinesByPet(petId!),
        enabled: enabled && section !== 'historial',
    });

    const sortedRecords = useMemo(
        () => [...(records.data ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [records.data],
    );

    const weightSeries = useMemo(
        () => [...(records.data ?? [])]
            .filter((r) => r.weight_kg)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((r) => ({ date: r.date, weight: r.weight_kg! })),
        [records.data],
    );

    /** «Vacunas al día» calculado del carnet (no del booleano manual del perfil). */
    const vaccinesStatus = useMemo(() => {
        const list = vaccines.data ?? [];
        if (!list.length) return 'sin-registro' as const;
        const now = new Date();
        const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const vencida = list.some((v) => v.next_due_date && v.next_due_date.slice(0, 10) < hoy);
        return vencida ? 'vencido' as const : 'al-dia' as const;
    }, [vaccines.data]);

    const deleteVaccineMutation = useMutation({
        mutationFn: (id: string) => deleteVaccine(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-vaccines', petId] });
            showAlert({ type: 'success', title: 'Vacuna eliminada', message: 'Se quitó del carnet de tu mascota.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'No se pudo eliminar', message: 'Inténtalo de nuevo.' });
        },
    });

    const deleteRecordMutation = useMutation({
        mutationFn: (id: string) => deleteRecord(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-records', petId] });
            showAlert({ type: 'success', title: 'Consulta eliminada', message: 'Se quitó del historial de tu mascota.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'No se pudo eliminar', message: 'Inténtalo de nuevo.' });
        },
    });

    return {
        canEdit,
        isOwner,
        isClinical,
        vaccines: vaccines.data ?? [],
        records: sortedRecords,
        weightSeries,
        vaccinesStatus,
        isLoadingVaccines: vaccines.isLoading,
        isLoadingRecords: records.isLoading,
        refetchVaccines: vaccines.refetch,
        refetchRecords: records.refetch,
        deleteVaccine: deleteVaccineMutation.mutate,
        deleteRecord: deleteRecordMutation.mutate,
    };
}

export type { Pet };
