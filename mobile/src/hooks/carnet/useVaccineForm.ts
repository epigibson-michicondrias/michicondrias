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
import type { VaccineCreate } from '@/src/types/carnet';

/**
 * El día elegido a mediodía local, como instante ISO. Una fecha sin hora ('YYYY-MM-DD') se guarda como 00:00 UTC y en
 * México se mostraría como el día anterior; al mediodía queda en el mismo día en cualquier zona de América.
 */
function atLocalNoon(date: Date): string {
    const noon = new Date(date);
    noon.setHours(12, 0, 0, 0);
    return noon.toISOString();
}

const oneYearAfter = (date: Date) => {
    const next = new Date(date);
    next.setFullYear(next.getFullYear() + 1);
    return next;
};

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
    const [appliedOn, setAppliedOn] = useState<Date>(() => new Date());
    const [nextDue, setNextDue] = useState<Date | null>(null);
    const [notes, setNotes] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: (data: VaccineCreate) => createVaccine(data),
        onSuccess: () => {
            // Pestaña Vacunas del carnet (el estado "vacunas al día" de la ficha aún es manual: tarea F16)
            queryClient.invalidateQueries({ queryKey: ['pet-vaccines', petId] });
            showAlert({ type: 'success', title: 'Vacuna registrada', message: 'Se agregó al carnet de tu mascota.' });
            router.back();
        },
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'No se pudo registrar', message: error.message || 'Inténtalo de nuevo en un momento.' });
        }
    });

    const changeAppliedOn = (date: Date) => {
        setAppliedOn(date);
        // El refuerzo no puede quedar antes de la aplicación
        if (nextDue && nextDue < date) setNextDue(oneYearAfter(date));
    };

    /** Propone el refuerzo a un año de la aplicación (lo habitual); el usuario lo ajusta. */
    const addNextDue = () => setNextDue(oneYearAfter(appliedOn));
    const clearNextDue = () => setNextDue(null);

    const changeName = (value: string) => {
        setName(value);
        if (nameError && value.trim()) setNameError(null);
    };

    const handleSave = () => {
        if (!name.trim()) {
            setNameError('Escribe el nombre de la vacuna.');
            return;
        }

        if (!petId) {
            showAlert({ type: 'error', title: 'Falta la mascota', message: 'Vuelve al carnet e inténtalo de nuevo.' });
            return;
        }

        mutation.mutate({
            pet_id: petId,
            name: name.trim(),
            date_administered: atLocalNoon(appliedOn),
            batch_number: batch.trim() || undefined,
            next_due_date: nextDue ? atLocalNoon(nextDue) : undefined,
            notes: notes.trim() || undefined,
            // El backend asigna quién la aplicó según la sesión; solo se declara cuando es personal veterinario
            administered_by_vet_id: isVet ? user?.id || null : null,
        });
    };

    return {
        petId,
        isVet,
        // Form fields
        name, setName: changeName, nameError,
        batch, setBatch,
        appliedOn, setAppliedOn: changeAppliedOn,
        nextDue, setNextDue, addNextDue, clearNextDue,
        notes, setNotes,
        today: new Date(),
        // Mutation
        handleSave,
        isSaving: mutation.isPending,
    };
}
