/**
 * useConsultationForm — alta/edición de consulta médica (`(app)/carnet/nueva-consulta`).
 * Espejo de `mobile/src/hooks/carnet/useConsultationForm.ts`.
 */
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRecord, getRecord, updateRecord, type MedicalRecordCreate } from '@/services/carnet';
import { showAlert } from '@/components/AppAlert';

type PrescriptionLine = MedicalRecordCreate['prescriptions'][number];

export function useConsultationForm() {
    const params = useSearchParams();
    const petId = params.get('pet_id') || '';
    const editId = params.get('id');
    const router = useRouter();
    const queryClient = useQueryClient();

    const [reason, setReason] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [weight, setWeight] = useState('');
    const [temp, setTemp] = useState('');
    const [errors, setErrors] = useState<Partial<Record<'reason' | 'weight' | 'temp', string>>>({});
    const [prescriptions, setPrescriptions] = useState<PrescriptionLine[]>([]);

    const { data: editing } = useQuery({
        queryKey: ['record', editId],
        queryFn: () => getRecord(editId!),
        enabled: !!editId,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
        // Primer await: los setState quedan fuera del cuerpo síncrono del efecto
        await Promise.resolve();
        if (cancelled || !editing) return;
        setReason(editing.reason_for_visit);
        setDiagnosis(editing.diagnosis || '');
        setTreatment(editing.treatment || '');
        setNotes(editing.notes || '');
        setWeight(editing.weight_kg ? String(editing.weight_kg) : '');
        setTemp(editing.temperature_c ? String(editing.temperature_c) : '');
        })();
        return () => { cancelled = true; };
    }, [editing]);

    const mutation = useMutation({
        mutationFn: (data: MedicalRecordCreate) => {
            if (!editId) return createRecord(data);
            return updateRecord(editId, {
                reason_for_visit: data.reason_for_visit,
                diagnosis: data.diagnosis,
                treatment: data.treatment,
                weight_kg: data.weight_kg,
                temperature_c: data.temperature_c,
                notes: data.notes,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-records', petId] });
            queryClient.invalidateQueries({ queryKey: ['pet-reminders', petId] });
            if (editId) queryClient.invalidateQueries({ queryKey: ['record', editId] });
            showAlert({
                type: 'success',
                title: editId ? 'Consulta actualizada' : 'Consulta guardada',
                message: editId ? 'Se guardaron los cambios del expediente.' : 'El expediente se actualizó correctamente.',
            });
            router.back();
        },
        onError: (error: Error) => {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: error.message || 'Inténtalo de nuevo.' });
        },
    });

    const addPrescription = () => {
        setPrescriptions([...prescriptions, { medication_name: '', dosage: '', frequency_hours: 8, duration_days: 7 }]);
    };

    const updatePrescription = (index: number, field: keyof PrescriptionLine, value: string | number) => {
        const next = [...prescriptions];
        next[index] = { ...next[index], [field]: value } as PrescriptionLine;
        setPrescriptions(next);
    };

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const next: typeof errors = {};
        if (!reason.trim()) next.reason = 'Escribe el motivo de la visita.';
        const w = weight.trim() ? parseFloat(weight.replace(',', '.')) : undefined;
        if (w !== undefined && (isNaN(w) || w <= 0)) next.weight = 'Mayor a cero.';
        const t = temp.trim() ? parseFloat(temp.replace(',', '.')) : undefined;
        if (t !== undefined && (isNaN(t) || t < 30 || t > 45)) next.temp = 'Entre 30 y 45 °C.';
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        if (!petId) {
            showAlert({ type: 'error', title: 'Falta la mascota', message: 'Abre la consulta desde la ficha de la mascota.' });
            return;
        }

        const validPrescriptions = prescriptions.filter((p) => p.medication_name.trim());
        for (const p of validPrescriptions) {
            if (!p.dosage.trim()) {
                showAlert({ type: 'error', title: 'Receta incompleta', message: `Indica la dosis de ${p.medication_name.trim()}.` });
                return;
            }
            if (!(p.frequency_hours >= 1 && p.frequency_hours <= 168) || !(p.duration_days >= 1 && p.duration_days <= 365)) {
                showAlert({
                    type: 'error',
                    title: 'Receta incompleta',
                    message: `Revisa cada cuántas horas (1 a 168) y por cuántos días (1 a 365) se da ${p.medication_name.trim()}.`,
                });
                return;
            }
        }

        mutation.mutate({
            pet_id: petId,
            reason_for_visit: reason.trim(),
            diagnosis: diagnosis.trim() || undefined,
            treatment: treatment.trim() || undefined,
            notes: notes.trim() || undefined,
            weight_kg: w,
            temperature_c: t,
            prescriptions: validPrescriptions,
        });
    };

    return {
        errors,
        petId,
        isEditing: !!editId,
        reason, setReason,
        diagnosis, setDiagnosis,
        treatment, setTreatment,
        notes, setNotes,
        weight, setWeight,
        temp, setTemp,
        prescriptions, addPrescription, updatePrescription, removePrescription,
        handleSave,
        isSaving: mutation.isPending,
    };
}
