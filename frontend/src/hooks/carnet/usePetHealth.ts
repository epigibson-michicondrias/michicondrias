/**
 * usePetHealth — datos del carnet para las pestañas Salud e Historial de la ficha de una mascota:
 * consultas, vacunas, recordatorios de medicamento y resultados de laboratorio.
 * Las queries solo se piden cuando la pestaña que las usa está visible (`enabled`).
 * Espejo de `mobile/src/hooks/carnet/usePetHealth.ts` (solo cambia `expo-router` → `next/navigation`).
 */
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeRole } from '@/constants/roles';
import { getRecordsByPet, getVaccinesByPet, deleteVaccine, deleteRecord } from '@/services/carnet';
import { getRemindersWithDetails, checkReminder } from '@/services/reminders';
import { getPetLabHistory } from '@/services/laboratorio';
import { showAlert } from '@/components/AppAlert';
import type { Pet } from '@/types/mascotas';

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
        onError: (error: Error) => {
            showAlert({ type: 'error', title: 'No se pudo marcar', message: error?.message || 'Inténtalo de nuevo.' });
        },
    });

    // ── Edición y borrado del carnet (F15): el backend recalcula is_vaccinated al tocar vacunas ──
    const invalidateCarnet = (kind: 'pet-vaccines' | 'pet-records') => {
        queryClient.invalidateQueries({ queryKey: [kind, petId] });
        queryClient.invalidateQueries({ queryKey: ['pet-profile'] });
    };

    const deleteVaccineMutation = useMutation({
        mutationFn: (vaccineId: string) => deleteVaccine(vaccineId),
        onSuccess: () => {
            invalidateCarnet('pet-vaccines');
            showAlert({ type: 'success', title: 'Vacuna eliminada', message: 'Se quitó del carnet de tu mascota.' });
        },
        onError: (error: Error) => {
            showAlert({ type: 'error', title: 'No se pudo eliminar', message: error?.message || 'Inténtalo de nuevo.' });
        },
    });

    const deleteRecordMutation = useMutation({
        mutationFn: (recordId: string) => deleteRecord(recordId),
        onSuccess: () => {
            invalidateCarnet('pet-records');
            showAlert({ type: 'success', title: 'Consulta eliminada', message: 'Se quitó del carnet de tu mascota.' });
        },
        onError: (error: Error) => {
            showAlert({ type: 'error', title: 'No se pudo eliminar', message: error?.message || 'Inténtalo de nuevo.' });
        },
    });

    /** Borrado destructivo: siempre con confirmación. */
    const confirmDeleteVaccine = (vaccineId: string, name: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar vacuna',
            message: `¿Quitar «${name}» del carnet? Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteVaccineMutation.mutate(vaccineId),
        });
    };

    const confirmDeleteRecord = (recordId: string, reason: string) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar consulta',
            message: `¿Quitar la consulta «${reason}» del carnet? Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteRecordMutation.mutate(recordId),
        });
    };

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
        addRecord: () => router.push(`/carnet/nueva-consulta?pet_id=${petId}`),
        addVaccine: () => router.push(`/carnet/nueva-vacuna?pet_id=${petId}`),
        editRecord: (id: string) => router.push(`/carnet/nueva-consulta?pet_id=${petId}&id=${id}`),
        editVaccine: (id: string) => router.push(`/carnet/nueva-vacuna?pet_id=${petId}&id=${id}`),
        confirmDeleteVaccine,
        confirmDeleteRecord,
        openSymptomCheck: () => router.push(`/mascotas/diagnostico-ia?petId=${petId}`),
    };
}
