/**
 * useGroomingForm — Manages form state and submission for creating a grooming service
 * Extracted from app/estilistas/nuevo.tsx
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { createGroomingService } from '@/src/services/grooming';

interface GroomingFormState {
    name: string;
    description: string;
    price: string;
    duration_minutes: string;
}

export function useGroomingForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<GroomingFormState>({
        name: '',
        description: '',
        price: '',
        duration_minutes: '30',
    });

    const updateField = (field: keyof GroomingFormState, value: string) => {
        setForm(f => ({ ...f, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price) {
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios' });
            return;
        }

        setLoading(true);
        try {
            await createGroomingService({
                name: form.name,
                description: form.description || undefined,
                price: parseFloat(form.price),
                duration_minutes: parseInt(form.duration_minutes) || 30,
            });
            showAlert({
                type: 'success',
                title: '¡Éxito!',
                message: 'Tu servicio de grooming ha sido registrado.',
                onButtonPress: () => router.back(),
            });
        } catch (error) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo registrar el servicio.' });
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        loading,
        updateField,
        handleSubmit,
    };
}
