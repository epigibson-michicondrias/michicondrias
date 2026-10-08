/**
 * usePetHealth — datos del carnet para las pestañas Salud e Historial de la ficha de una mascota:
 * consultas, vacunas, recordatorios de medicamento y resultados de laboratorio.
 * Las queries solo se piden cuando la pestaña que las usa está visible (`enabled`).
 */
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { normalizeRole } from '@/src/constants/roles';
import { getRecordsByPet, getVaccinesByPet } from '@/src/services/carnet';
import { getRemindersWithDetails, checkReminder } from '@/src/services/reminders';
import { getPetLabHistory } from '@/src/services/laboratorio';
import { showAlert } from '@/src/components/AppAlert';
import type { Pet } from '@/src/types/mascotas';

/** Roles clínicos que el backend de carnet deja escribir (pet_access.VET_ROLES). */
const CLINICAL_ROLES = ['veterinario', 'hospital', 'admin'];

export function usePetHealth(petId: string | undefined, pet: Pet | undefined, section: 'salud' | 'historial' | null) {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const role = normalizeRole(user?.role_name);
    const isOwner = !!pet && pet.owner_id === user?.id;
    const isClinical = CLINICAL_ROLES.includes(role);
    // El dueño también registra vacunas y consultas de su mascota (el backend lo permite)
    const canEdit = isOwner || isClinical;

    const enabled = !!petId;
    const records = useQuery({
        queryKey: ['pet-records', petId],
        queryFn: () => getRecordsByPet(petId!),
        enabled: enabled && section === 'historial',
    });
    // Las vacunas también alimentan el estado "Vacunas al día" del Resumen
    const vaccines = useQuery({
        queryKey: ['pet-vaccines', petId],
        queryFn: () => getVaccinesByPet(petId!),
        enabled: enabled && section !== 'historial',
    });
    const reminders = useQuery({
        queryKey: ['pet-reminders', petId],
        queryFn: () => getRemindersWithDetails(petId!),
        enabled: enabled && section === 'salud',
    });
    const labs = useQuery({
        queryKey: ['pet-lab-history', petId],
        queryFn: () => getPetLabHistory(petId!),
        enabled: enabled && section === 'salud',
    });

    const sortedRecords = useMemo(
        () => [...(records.data ?? [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [records.data],
    );

    // Evolución del peso registrada en consultas (para la gráfica de Historial)
    const weightSeries = useMemo(
        () => [...(records.data ?? [])]
            .filter((r) => r.weight_kg)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((r) => ({ date: r.date, weight: r.weight_kg! })),
        [records.data],
    );

    /**
     * «Vacunas al día» calculado del carnet (no del booleano manual del perfil):
     * sin vacunas registradas, con algún refuerzo (`next_due_date`) vencido, o al día.
     */
    const vaccinesStatus = useMemo(() => {
        const list = vaccines.data ?? [];
        if (!list.length) return 'sin-registro' as const;
        const now = new Date();
        const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const vencida = list.some((v) => v.next_due_date && v.next_due_date.slice(0, 10) < hoy);
        return vencida ? 'vencido' as const : 'al-dia' as const;
    }, [vaccines.data]);

    const checkMutation = useMutation({
        mutationFn: checkReminder,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pet-reminders', petId] }),
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'No se pudo marcar', message: error?.message || 'Inténtalo de nuevo.' });
        },
    });

    return {
        canEdit,
        isOwner,
        records: sortedRecords,
        loadingRecords: records.isLoading,
        weightSeries,
        vaccines: vaccines.data ?? [],
        loadingVaccines: vaccines.isLoading,
        vaccinesStatus,
        reminders: reminders.data ?? [],
        loadingReminders: reminders.isLoading,
        labResults: labs.data ?? [],
        loadingLabs: labs.isLoading,
        checkReminder: (id: string) => checkMutation.mutate(id),
        addRecord: () => router.push(`/carnet/nueva-consulta?pet_id=${petId}` as any),
        addVaccine: () => router.push(`/carnet/nueva-vacuna?pet_id=${petId}` as any),
        openSymptomCheck: () => router.push({ pathname: '/mascotas/diagnostico-ia', params: { petId } } as any),
    };
}
