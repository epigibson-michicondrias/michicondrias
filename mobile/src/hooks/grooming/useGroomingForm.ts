/**
 * useGroomingForm — Alta de un servicio de estética (estilista): validación en línea y catálogo actualizado al guardar.
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { createGroomingService } from '@/src/services/grooming';

interface GroomingFormState {
    name: string;
    description: string;
    price: string;
    duration_minutes: string;
}

type Errors = Partial<Record<'name' | 'price' | 'duration_minutes', string>>;

export function useGroomingForm() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [errors, setErrors] = useState<Errors>({});
    const [form, setForm] = useState<GroomingFormState>({
        name: '',
        description: '',
        price: '',
        duration_minutes: '30',
    });

    const updateField = (field: keyof GroomingFormState, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
        if (errors[field as keyof Errors]) setErrors((e) => ({ ...e, [field]: undefined }));
    };

    const mutation = useMutation({
        mutationFn: () => createGroomingService({
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            price: parseFloat(form.price.replace(',', '.')),
            duration_minutes: parseInt(form.duration_minutes, 10),
        }),
        onSuccess: () => {
            // El catálogo y la gestión del estilista lo muestran de inmediato
            queryClient.invalidateQueries({ queryKey: ['grooming-services'] });
            showAlert({
                type: 'success',
                title: 'Servicio publicado',
                message: 'Ya aparece en el catálogo de estética.',
                onButtonPress: () => router.back(),
            });
        },
        onError: (e: Error) => showAlert({ type: 'error', title: 'No se pudo publicar', message: e.message || 'Inténtalo de nuevo.' }),
    });

    const handleSubmit = () => {
        const next: Errors = {};
        if (!form.name.trim()) next.name = 'Escribe el nombre del servicio.';
        const price = parseFloat(form.price.replace(',', '.'));
        if (!Number.isFinite(price) || price <= 0) next.price = 'Precio mayor a cero.';
        const minutes = parseInt(form.duration_minutes, 10);
        if (!Number.isInteger(minutes) || minutes < 10 || minutes > 480) next.duration_minutes = 'Entre 10 y 480 minutos.';
        setErrors(next);
        if (Object.keys(next).length === 0) mutation.mutate();
    };

    return {
        form,
        errors,
        loading: mutation.isPending,
        updateField,
        handleSubmit,
    };
}
