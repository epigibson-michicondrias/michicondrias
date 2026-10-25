/**
 * useTreatmentDetail — detalle de un tratamiento (medicamento recetado) en `(app)/carnet/tratamiento/[id]`.
 * Espejo de la lógica de la app; la página es composición propia de escritorio.
 */
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTreatmentDetail, setPrescriptionReminders, setPrescriptionStartDate, checkReminder } from '@/services/reminders';
import { getPetById } from '@/services/mascotas';
import { showAlert } from '@/components/AppAlert';

export function useTreatmentDetail() {
    const params = useParams<{ id: string }>();
    const prescriptionId = params.id;
    const queryClient = useQueryClient();

    const { data: treatment, isLoading, error, refetch } = useQuery({
        queryKey: ['treatment-detail', prescriptionId],
        queryFn: () => getTreatmentDetail(prescriptionId),
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
        onError: (e: Error) => showAlert({ type: 'error', title: 'No se pudo marcar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const toggleMutation = useMutation({
        mutationFn: (enabled: boolean) => setPrescriptionReminders(prescriptionId, enabled),
        onSuccess: invalidate,
        onError: (e: Error) => showAlert({ type: 'error', title: 'No se pudo cambiar', message: e?.message || 'Inténtalo de nuevo.' }),
    });

    const startDateMutation = useMutation({
        mutationFn: (startDate: string) => setPrescriptionStartDate(prescriptionId, startDate),
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: 'Inicio actualizado', message: 'Las tomas se reprogramaron desde esa fecha.' });
        },
        onError: (e: Error) => showAlert({ type: 'error', title: 'No se pudo cambiar', message: e?.message || 'Inténtalo de nuevo.' }),
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
