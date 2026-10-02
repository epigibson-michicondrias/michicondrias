/**
 * useCompatibilityForm — Hook for the adoption compatibility form
 * Uses submitAdoptionForm from adopciones service
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitAdoptionForm } from '@/src/services/adopciones';
import { showAlert } from '@/src/components/AppAlert';
import type { AdoptionFormCreate } from '@/src/types/adopciones';

export interface CompatibilityFormState {
    has_other_pets: boolean;
    has_yard: boolean;
    hours_left_alone: string;
    experience_level: string;
}

const INITIAL_FORM: CompatibilityFormState = {
    has_other_pets: false,
    has_yard: false,
    hours_left_alone: '4',
    experience_level: 'intermedio',
};

export const EXPERIENCE_OPTIONS = [
    { label: 'Ninguna', value: 'ninguna' },
    { label: 'Poca', value: 'poca' },
    { label: 'Intermedia', value: 'intermedio' },
    { label: 'Mucha', value: 'mucha' },
];

export const HOURS_OPTIONS = [
    { label: '0-2 hrs', value: '2' },
    { label: '2-4 hrs', value: '4' },
    { label: '4-6 hrs', value: '6' },
    { label: '6-8 hrs', value: '8' },
    { label: '8+ hrs', value: '10' },
];

export function useCompatibilityForm() {
    const { petId } = useLocalSearchParams<{ petId: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(0);
    const [form, setForm] = useState<CompatibilityFormState>(INITIAL_FORM);

    const totalSteps = 4;

    const submitMutation = useMutation({
        mutationFn: (data: AdoptionFormCreate) => submitAdoptionForm(data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['refuge-applications'] });
            showAlert({
                type: 'success',
                title: 'Formulario enviado',
                message: `Tu compatibilidad es del ${result.compatibility_score}%. El refugio revisará tu formulario y te avisará.`,
            });
            router.back();
        },
        onError: (e: any) => {
            showAlert({
                type: 'error',
                title: 'No se pudo enviar',
                message: e?.message || 'No se pudo enviar el formulario. Intenta de nuevo.',
            });
        },
    });

    const updateField = <K extends keyof CompatibilityFormState>(field: K, value: CompatibilityFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (step < totalSteps - 1) {
            setStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep((prev) => prev - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = () => {
        if (!petId) {
            showAlert({ type: 'error', title: 'Error', message: 'No se encontró la mascota.' });
            return;
        }
        submitMutation.mutate({
            pet_id: petId,
            has_other_pets: form.has_other_pets,
            has_yard: form.has_yard,
            hours_left_alone: parseInt(form.hours_left_alone, 10),
            experience_level: form.experience_level,
        });
    };

    return {
        // Data
        form,
        step,
        totalSteps,
        petId,

        // Actions
        updateField,
        nextStep,
        prevStep,
        handleSubmit,
        isSubmitting: submitMutation.isPending,
    };
}
