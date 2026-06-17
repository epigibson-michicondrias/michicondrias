/**
 * useVaccineForm — Form state and mutation for registering a new vaccine
 * Manages form fields, validation, and save mutation
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVaccine } from '@/src/services/carnet';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export function useVaccineForm() {
    const { pet_id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const petId = pet_id as string;

    // Form fields
    const [name, setName] = useState('');
    const [batch, setBatch] = useState('');
    const [nextDue, setNextDue] = useState<Date | null>(null);
    const [notes, setNotes] = useState('');

    const mutation = useMutation({
        mutationFn: (data: any) => createVaccine(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-vaccines', petId] });
            router.back();
        },
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo registrar la vacuna.' });
        }
    });

    const handleSave = () => {
        if (!name.trim()) {
            showAlert({ type: 'error', title: 'Campo Requerido', message: 'Por favor ingresa el nombre de la vacuna.' });
            return;
        }

        mutation.mutate({
            pet_id: petId,
            name: name,
            batch_number: batch || undefined,
            next_due_date: nextDue ? nextDue.toISOString().split('T')[0] : undefined,
            notes: notes || undefined,
            administered_by_vet_id: user?.id || null,
        });
    };

    return {
        petId,
        // Form fields
        name, setName,
        batch, setBatch,
        nextDue, setNextDue,
        notes, setNotes,
        // Mutation
        handleSave,
        isSaving: mutation.isPending,
    };
}
