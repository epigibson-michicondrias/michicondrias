/**
 * useConsultationForm — Form state and mutation for creating a new medical consultation
 * Manages form fields, prescription list, validation, and save mutation
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRecord, MedicalRecordCreate } from '@/src/services/carnet';
import { showAlert } from '@/src/components/AppAlert';

export function useConsultationForm() {
    const { pet_id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const petId = pet_id as string;

    // Form fields
    const [reason, setReason] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [treatment, setTreatment] = useState('');
    const [notes, setNotes] = useState('');
    const [weight, setWeight] = useState('');
    const [temp, setTemp] = useState('');
    const [prescriptions, setPrescriptions] = useState<MedicalRecordCreate['prescriptions']>([]);

    const mutation = useMutation({
        mutationFn: (data: MedicalRecordCreate) => createRecord(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-records', petId] });
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

        mutation.mutate({
            pet_id: petId,
            reason_for_visit: reason,
            diagnosis: diagnosis || undefined,
            treatment: treatment || undefined,
            notes: notes || undefined,
            weight_kg: weight ? parseFloat(weight) : undefined,
            temperature_c: temp ? parseFloat(temp) : undefined,
            prescriptions: prescriptions.filter(p => p.medication_name.trim())
        });
    };

    return {
        petId,
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
