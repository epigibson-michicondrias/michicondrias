/**
 * useVaccineForm — alta/edición de vacuna (`(app)/carnet/nueva-vacuna`). Espejo de
 * `mobile/src/hooks/carnet/useVaccineForm.ts`. Fechas a mediodía local (ver `atLocalNoon`).
 */
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVaccine, getVaccine, updateVaccine } from '@/services/carnet';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/AppAlert';
import type { VaccineCreate } from '@/types/carnet';

/**
 * El día elegido a mediodía local, como instante ISO. Una fecha sin hora ('YYYY-MM-DD') se guarda como
 * 00:00 UTC y en México se mostraría como el día anterior.
 */
function atLocalNoon(date: Date): string {
    const noon = new Date(date);
    noon.setHours(12, 0, 0, 0);
    return noon.toISOString();
}

function oneYearAfter(date: Date): Date {
    const next = new Date(date);
    next.setFullYear(next.getFullYear() + 1);
    return next;
}

function toDateInput(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function useVaccineForm() {
    const params = useSearchParams();
    const petId = params.get('pet_id') || '';
    const editId = params.get('id');
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isVet = user?.role_name === 'veterinario' || user?.role_name === 'admin';

    const [name, setName] = useState('');
    const [batch, setBatch] = useState('');
    const [appliedOn, setAppliedOn] = useState<string>(() => toDateInput(new Date()));
    const [nextDue, setNextDue] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);

    const { data: editing } = useQuery({
        queryKey: ['vaccine', editId],
        queryFn: () => getVaccine(editId!),
        enabled: !!editId,
    });

    useEffect(() => {
        let cancelled = false;
        (async () => {
        // Primer await: los setState quedan fuera del cuerpo síncrono del efecto
        await Promise.resolve();
        if (cancelled || !editing) return;
        setName(editing.name);
        setBatch(editing.batch_number || '');
        if (editing.date_administered) setAppliedOn(toDateInput(new Date(editing.date_administered)));
        setNextDue(editing.next_due_date ? toDateInput(new Date(editing.next_due_date)) : '');
        setNotes(editing.notes || '');
        })();
        return () => { cancelled = true; };
    }, [editing]);

    const mutation = useMutation({
        mutationFn: (data: VaccineCreate) => (editId
            ? updateVaccine(editId, {
                name: data.name,
                batch_number: data.batch_number,
                next_due_date: data.next_due_date,
                notes: data.notes,
            })
            : createVaccine(data)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pet-vaccines', petId] });
            queryClient.invalidateQueries({ queryKey: ['pet-profile'] });
            if (editId) queryClient.invalidateQueries({ queryKey: ['vaccine', editId] });
            showAlert({
                type: 'success',
                title: editId ? 'Vacuna actualizada' : 'Vacuna registrada',
                message: editId ? 'Se guardaron los cambios del carnet.' : 'Se agregó al carnet de tu mascota.',
            });
            router.back();
        },
        onError: (error: Error) => {
            showAlert({
                type: 'error',
                title: editId ? 'No se pudo actualizar' : 'No se pudo registrar',
                message: error.message || 'Inténtalo de nuevo en un momento.',
            });
        },
    });

    const changeAppliedOn = (value: string) => {
        setAppliedOn(value);
        const applied = new Date(`${value}T12:00:00`);
        if (nextDue && new Date(`${nextDue}T12:00:00`) < applied) setNextDue(toDateInput(oneYearAfter(applied)));
    };

    const addNextDue = () => {
        const applied = new Date(`${appliedOn}T12:00:00`);
        setNextDue(toDateInput(oneYearAfter(applied)));
    };

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
            date_administered: atLocalNoon(new Date(`${appliedOn}T12:00:00`)),
            batch_number: batch.trim() || undefined,
            next_due_date: nextDue ? atLocalNoon(new Date(`${nextDue}T12:00:00`)) : undefined,
            notes: notes.trim() || undefined,
            administered_by_vet_id: null,
        });
    };

    return {
        petId,
        isVet,
        isEditing: !!editId,
        name, setName: changeName, nameError,
        batch, setBatch,
        appliedOn, setAppliedOn: changeAppliedOn,
        nextDue, setNextDue, addNextDue,
        notes, setNotes,
        handleSave,
        isSaving: mutation.isPending,
    };
}
