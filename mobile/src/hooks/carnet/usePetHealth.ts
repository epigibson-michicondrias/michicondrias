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
import { getRecordsByPet, getVaccinesByPet, deleteVaccine, deleteRecord } from '@/src/services/carnet';
import { getTreatments, setPrescriptionReminders, setPrescriptionStartDate, checkReminder, type Treatment } from '@/src/services/reminders';
import { getPetLabHistory } from '@/src/services/laboratorio';
import { showAlert } from '@/src/components/AppAlert';
import type { Pet } from '@/src/types/mascotas';

/** Roles clínicos que el backend de carnet deja escribir (pet_access.VET_ROLES). */
const CLINICAL_ROLES = ['veterinario', 'hospital', 'admin'];

export function usePetHealth(petId: string | undefined, pet: Pet | undefined, section: 'salud' | 'tratamientos' | 'historial' | null) {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const role = normalizeRole(user?.role_name);
    const isOwner = !!pet && pet.owner_id === user?.id;
    const isClinical = CLINICAL_ROLES.includes(role);
    // El carnet (vacunas, consultas, recetas) solo lo escribe el equipo clínico; el dueño lo consulta
    const canEdit = isClinical;
    // Marcar una dosis como tomada es del dueño (`POST /reminders/{id}/check` solo lo acepta a él)
    const canCheckReminders = isOwner;

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
        // Siempre: el estado de vacunas se muestra fuera de la pestaña Salud (Resumen en la app, hero en la web)
        enabled,
    });
    const treatments = useQuery({
        queryKey: ['pet-treatments', petId],
        queryFn: () => getTreatments(petId!),
        select: (data) => data.map((t) => ({
            ...t,
            doses: t.doses.map((d) => ({
                ...d,
                /** La dosis ya toca si es pasada o cae dentro de la próxima hora. */
                isDue: new Date(d.remind_at).getTime() - Date.now() <= 3_600_000,
            })),
        })),
        enabled: enabled && (section === 'tratamientos' || section === 'salud'),
    });
    const labs = useQuery({
        queryKey: ['pet-lab-history', petId],
        queryFn: () => getPetLabHistory(petId!),
        // Salud y la línea de tiempo de Historial
        enabled: enabled && section !== null,
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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pet-treatments', petId] }),
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'No se pudo marcar', message: error?.message || 'Inténtalo de nuevo.' });
        },
    });

    /** El dueño activa o desactiva los avisos de un medicamento recetado. */
    const toggleRemindersMutation = useMutation({
        mutationFn: ({ prescriptionId, enabled }: { prescriptionId: string; enabled: boolean }) =>
            setPrescriptionReminders(prescriptionId, enabled),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pet-treatments', petId] }),
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'No se pudo cambiar', message: error?.message || 'Inténtalo de nuevo.' });
        },
    });

    /** El dueño fija cuándo empieza el tratamiento (p. ej. cuando compró el medicamento). */
    const setStartDateMutation = useMutation({
        mutationFn: ({ prescriptionId, startDate }: { prescriptionId: string; startDate: string }) =>
            setPrescriptionStartDate(prescriptionId, startDate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-treatments', petId] });
            showAlert({ type: 'success', title: 'Inicio actualizado', message: 'Las tomas se reprogramaron desde esa fecha.' });
        },
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'No se pudo cambiar', message: error?.message || 'Inténtalo de nuevo.' });
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
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'No se pudo eliminar', message: error?.message || 'Inténtalo de nuevo.' });
        },
    });

    const deleteRecordMutation = useMutation({
        mutationFn: (recordId: string) => deleteRecord(recordId),
        onSuccess: () => {
            invalidateCarnet('pet-records');
            showAlert({ type: 'success', title: 'Consulta eliminada', message: 'Se quitó del carnet de tu mascota.' });
        },
        onError: (error: any) => {
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
        canCheckReminders,
        isOwner,
        records: sortedRecords,
        loadingRecords: records.isLoading,
        weightSeries,
        vaccines: vaccines.data ?? [],
        loadingVaccines: vaccines.isLoading,
        vaccinesStatus,
        treatments: treatments.data ?? [],
        loadingTreatments: treatments.isLoading,
        labResults: labs.data ?? [],
        loadingLabs: labs.isLoading,
        checkReminder: (id: string) => checkMutation.mutate(id),
        isChecking: checkMutation.isPending,
        toggleReminders: (prescriptionId: string, enabled: boolean) =>
            toggleRemindersMutation.mutate({ prescriptionId, enabled }),
        isToggling: toggleRemindersMutation.isPending,
        setStartDate: (prescriptionId: string, startDate: string) =>
            setStartDateMutation.mutate({ prescriptionId, startDate }),
        isSettingStart: setStartDateMutation.isPending,
        addRecord: () => router.push(`/carnet/nueva-consulta?pet_id=${petId}` as any),
        addVaccine: () => router.push(`/carnet/nueva-vacuna?pet_id=${petId}` as any),
        editRecord: (id: string) => router.push(`/carnet/nueva-consulta?pet_id=${petId}&id=${id}` as any),
        editVaccine: (id: string) => router.push(`/carnet/nueva-vacuna?pet_id=${petId}&id=${id}` as any),
        confirmDeleteVaccine,
        /** Sin consultas, el dueño busca quién la atienda (el carnet lo llena el veterinario). */
        findVet: () => router.push('/directorio' as any),
        confirmDeleteRecord,
        openSymptomCheck: () => router.push({ pathname: '/mascotas/diagnostico-ia', params: { petId } } as any),
    };
}
