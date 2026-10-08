/**
 * useConsultationForm — Form state and mutation for creating a new medical consultation
 * Manages form fields, prescription list, validation, and save mutation
 */
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRecord, getRecord, updateRecord, MedicalRecordCreate } from '@/src/services/carnet';
import { showAlert } from '@/src/components/AppAlert';

export function useConsultationForm() {
    const { pet_id, id } = useLocalSearchParams<{ pet_id?: string; id?: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const petId = pet_id as string;
    // Con `id` el formulario edita una consulta existente (la receta se gestiona aparte)
    const editId = typeof id === 'string' && id ? id : null;

    // Form fields
    const [reason, setReason] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [weight, setWeight] = useState('');
    const [temp, setTemp] = useState('');
    const [prescriptions, setPrescriptions] = useState<MedicalRecordCreate['prescriptions']>([]);

    const { data: editing } = useQuery({
        queryKey: ['record', editId],
        queryFn: () => getRecord(editId!),
        enabled: !!editId,
    });

    useEffect(() => {
        if (!editing) return;
        setReason(editing.reason_for_visit);
        setDiagnosis(editing.diagnosis || '');
        setTreatment(editing.treatment || '');
        setNotes(editing.notes || '');
        setWeight(editing.weight_kg ? String(editing.weight_kg) : '');
        setTemp(editing.temperature_c ? String(editing.temperature_c) : '');
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
            // La receta genera recordatorios de medicamento en el backend
            queryClient.invalidateQueries({ queryKey: ['pet-reminders', petId] });
            if (editId) queryClient.invalidateQueries({ queryKey: ['record', editId] });
            showAlert({
                type: 'success',
                title: editId ? 'Consulta actualizada' : 'Consulta guardada',
                message: editId ? 'Se guardaron los cambios del expediente.' : 'El expediente se actualizó correctamente.',
            });
            router.back();
        },
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo guardar la consulta.' });
        }
    });

    const addPrescription = () => {
        setPrescriptions([...prescriptions, { medication_name: '', dosage: '', frequency_hours: 8, duration_days: 7 }]);
    };

    const updatePrescription = (index: number, field: keyof MedicalRecordCreate['prescriptions'][0], value: any) => {
        const newPres = [...prescriptions];
        (newPres[index] as any)[field] = value;
        setPrescriptions(newPres);
    };

    const removePrescription = (index: number) => {
        setPrescriptions(prescriptions.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!reason.trim()) {
            showAlert({ type: 'error', title: 'Campo Requerido', message: 'Por favor ingresa el motivo de la consulta.' });
            return;
        }

        if (!petId) {
            showAlert({ type: 'error', title: 'Error', message: 'No se encontró la mascota de esta consulta.' });
            return;
        }

        const weightVal = weight.trim() ? parseFloat(weight.replace(',', '.')) : undefined;
        if (weightVal !== undefined && (isNaN(weightVal) || weightVal <= 0)) {
            showAlert({ type: 'error', title: 'Dato inválido', message: 'El peso debe ser un número mayor a cero.' });
            return;
        }
        const tempVal = temp.trim() ? parseFloat(temp.replace(',', '.')) : undefined;
        if (tempVal !== undefined && (isNaN(tempVal) || tempVal < 30 || tempVal > 45)) {
            showAlert({ type: 'error', title: 'Dato inválido', message: 'La temperatura debe estar entre 30 y 45 °C.' });
            return;
        }

        const validPrescriptions = prescriptions.filter(p => p.medication_name.trim());
        for (const p of validPrescriptions) {
            if (!p.dosage.trim()) {
                showAlert({ type: 'error', title: 'Receta incompleta', message: `Indica la dosis de ${p.medication_name.trim()}.` });
                return;
            }
            if (!(p.frequency_hours >= 1 && p.frequency_hours <= 168) || !(p.duration_days >= 1 && p.duration_days <= 365)) {
                showAlert({ type: 'error', title: 'Receta incompleta', message: `Revisa cada cuántas horas (1 a 168) y por cuántos días (1 a 365) se da ${p.medication_name.trim()}.` });
                return;
            }
        }

        mutation.mutate({
            pet_id: petId,
            reason_for_visit: reason.trim(),
            diagnosis: diagnosis.trim() || undefined,
            treatment: treatment.trim() || undefined,
            notes: notes.trim() || undefined,
            weight_kg: weightVal,
            temperature_c: tempVal,
            prescriptions: validPrescriptions
        });
    };

    return {
        petId,
        isEditing: !!editId,
        // Form fields
        reason, setReason,
        diagnosis, setDiagnosis,
        treatment, setTreatment,
        notes, setNotes,
        weight, setWeight,
        temp, setTemp,
        // Prescriptions
        prescriptions,
        addPrescription,
        updatePrescription,
        removePrescription,
        // Mutation
        handleSave,
        isSaving: mutation.isPending,
    };
}
