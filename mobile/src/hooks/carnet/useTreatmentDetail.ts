/**
 * useTreatmentDetail — detalle de un tratamiento (medicamento recetado) en `app/carnet/tratamiento/[id]`.
 * Espejo de `frontend/src/hooks/carnet/useTreatmentDetail.ts`.
 */
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTreatmentDetail, setPrescriptionReminders, setPrescriptionStartDate, checkReminder } from '@/src/services/reminders';
import { getPetById } from '@/src/services/mascotas';
import { showAlert } from '@/src/components/AppAlert';

export function useTreatmentDetail() {
    const { id: prescriptionId } = useLocalSearchParams<{ id: string }>();
    const queryClient = useQueryClient();

    const { data: treatment, isLoading, error, refetch } = useQuery({
        queryKey: ['treatment-detail', prescriptionId],
        queryFn: () => getTreatmentDetail(prescriptionId!),
        enabled: !!prescriptionId,
        select: (data) => ({
            ...data,
            doses: data.doses.map((d) => ({
                ...d,
                isDue: new Date(d.remind_at).getTime() - Date.now() <= 3_600_000,
                isOverdue: new Date(d.remind_at).getTime() < Date.now(),
            })),
        }),
    });

    const { data: pet, isLoading: loadingPet } = useQuery({
        queryKey: ['pet', treatment?.pet_id],
        queryFn: () => getPetById(treatment!.pet_id),
        enabled: !!treatment?.pet_id,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['treatment-detail', prescriptionId] });

    const checkMutation = useMutation({
        mutationFn: checkReminder,
        onSuccess: invalidate,
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo marcar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const toggleMutation = useMutation({
        mutationFn: (enabled: boolean) => setPrescriptionReminders(prescriptionId!, enabled),
        onSuccess: invalidate,
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo cambiar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const startDateMutation = useMutation({
        mutationFn: (startDate: string) => setPrescriptionStartDate(prescriptionId!, startDate),
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: 'Inicio actualizado', message: 'Las tomas se reprogramaron desde esa fecha.' });
        },
        onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo cambiar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    return {
        treatment,
        pet,
        isLoading: isLoading || loadingPet,
        error,
        refetch,
        checkReminder: (id: string) => checkMutation.mutate(id),
        isChecking: checkMutation.isPending,
        toggleReminders: (enabled: boolean) => toggleMutation.mutate(enabled),
        isToggling: toggleMutation.isPending,
        setStartDate: (startDate: string) => startDateMutation.mutate(startDate),
        isSettingStart: startDateMutation.isPending,
    };
}
