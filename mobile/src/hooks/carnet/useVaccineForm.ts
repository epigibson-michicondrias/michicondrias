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
    const isVet = user?.role_name === 'veterinario' || user?.role_name === 'admin';

    // Form fields
    const [name, setName] = useState('');
    const [batch, setBatch] = useState('');
    const [nextDue, setNextDue] = useState<Date | null>(null);
    const [notes, setNotes] = useState('');

    const mutation = useMutation({
        mutationFn: (data: any) => createVaccine(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-vaccines', petId] });
            showAlert({ type: 'success', title: 'Vacuna registrada', message: 'Se agregó al carnet de tu mascota.' });
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

        if (!petId) {
            showAlert({ type: 'error', title: 'Error', message: 'No se encontró la mascota de esta vacuna.' });
            return;
        }

        mutation.mutate({
            pet_id: petId,
            name: name.trim(),
            batch_number: batch.trim() || undefined,
            next_due_date: nextDue ? nextDue.toISOString().split('T')[0] : undefined,
            notes: notes.trim() || undefined,
            // El backend asigna quién la aplicó según la sesión; solo se declara cuando es personal veterinario
            administered_by_vet_id: isVet ? user?.id || null : null,
        });
    };

    return {
        petId,
        isVet,
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
