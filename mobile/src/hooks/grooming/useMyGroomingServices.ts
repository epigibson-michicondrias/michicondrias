/**
 * useMyGroomingServices — Servicios del estilista: ver, pausar/reactivar y editar (precio, duración, descripción).
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { getMyGroomingServices, updateGroomingService, type GroomingService } from '@/src/services/grooming';

export interface ServiceDraft {
    name: string;
    description: string;
    price: string;
    duration_minutes: string;
}

type Errors = Partial<Record<keyof ServiceDraft, string>>;

export function useMyGroomingServices() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState<GroomingService | null>(null);
    const [draft, setDraft] = useState<ServiceDraft>({ name: '', description: '', price: '', duration_minutes: '' });
    const [errors, setErrors] = useState<Errors>({});

    const { data: services = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['grooming-my-services'],
        queryFn: getMyGroomingServices,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['grooming-my-services'] });
        queryClient.invalidateQueries({ queryKey: ['grooming-services'] });
    };

    const toggleMutation = useMutation({
        mutationFn: (s: GroomingService) => updateGroomingService(s.id, { is_active: !s.is_active }),
        onSuccess: invalidate,
        onError: (e: Error) => showAlert({ type: 'error', title: 'No se pudo actualizar', message: e.message || 'Inténtalo de nuevo.' }),
    });

    const saveMutation = useMutation({
        mutationFn: () => updateGroomingService(editing!.id, {
            name: draft.name.trim(),
            description: draft.description.trim() || undefined,
            price: parseFloat(draft.price.replace(',', '.')),
            duration_minutes: parseInt(draft.duration_minutes, 10),
        }),
        onSuccess: () => {
            invalidate();
            setEditing(null);
        },
        onError: (e: Error) => showAlert({ type: 'error', title: 'No se pudo guardar', message: e.message || 'Inténtalo de nuevo.' }),
    });

    const openEdit = (s: GroomingService) => {
        setErrors({});
        setDraft({
            name: s.name,
            description: s.description ?? '',
            price: String(s.price ?? ''),
            duration_minutes: String(s.duration_minutes ?? ''),
        });
        setEditing(s);
    };

    const updateDraft = (field: keyof ServiceDraft, value: string) => {
        setDraft((d) => ({ ...d, [field]: value }));
        if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };

    const save = () => {
        const next: Errors = {};
        if (draft.name.trim().length < 2) next.name = 'Escribe el nombre.';
        const price = parseFloat(draft.price.replace(',', '.'));
        if (!Number.isFinite(price) || price <= 0) next.price = 'Mayor a cero.';
        const minutes = parseInt(draft.duration_minutes, 10);
        if (!Number.isInteger(minutes) || minutes < 5 || minutes > 720) next.duration_minutes = 'Entre 5 y 720 min.';
        setErrors(next);
        if (Object.keys(next).length === 0) saveMutation.mutate();
    };

    return {
        services,
        isLoading,
        refetch,
        isRefetching,
        toggle: (s: GroomingService) => toggleMutation.mutate(s),
        togglingId: toggleMutation.isPending ? toggleMutation.variables?.id : undefined,
        editing,
        draft,
        errors,
        openEdit,
        closeEdit: () => setEditing(null),
        updateDraft,
        save,
        saving: saveMutation.isPending,
        goToNew: () => router.push('/estilistas/nuevo'),
    };
}
