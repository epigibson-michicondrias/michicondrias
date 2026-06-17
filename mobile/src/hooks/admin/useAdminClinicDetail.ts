/**
 * useAdminClinicDetail — Business logic for the admin clinic detail screen
 * Manages clinic data fetching, edit mode, form state, and update mutation
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinic, updateClinic } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

interface ClinicForm {
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    is_24_hours: boolean;
    has_emergency: boolean;
}

const EMPTY_FORM: ClinicForm = {
    name: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    is_24_hours: false,
    has_emergency: false,
};

export function useAdminClinicDetail(id: string) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<ClinicForm>(EMPTY_FORM);

    const { data: clinic, isLoading, error } = useQuery({
        queryKey: ['admin-clinic', id],
        queryFn: () => getClinic(id),
    });

    useEffect(() => {
        if (clinic) {
            setForm({
                name: clinic.name || '',
                address: clinic.address || '',
                city: clinic.city || '',
                state: clinic.state || '',
                phone: clinic.phone || '',
                email: clinic.email || '',
                website: clinic.website || '',
                description: clinic.description || '',
                is_24_hours: clinic.is_24_hours,
                has_emergency: clinic.has_emergency,
            });
        }
    }, [clinic]);

    const mutation = useMutation({
        mutationFn: () => updateClinic(id, {
            name: form.name,
            address: form.address || null,
            city: form.city || null,
            state: form.state || null,
            phone: form.phone || null,
            email: form.email || null,
            website: form.website || null,
            description: form.description || null,
            is_24_hours: form.is_24_hours,
            has_emergency: form.has_emergency,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-clinic', id] });
            queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
            setIsEditing(false);
            showAlert({ type: 'success', title: 'Guardado', message: 'La clínica se actualizó correctamente.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar la clínica.' });
        },
    });

    const handleSave = () => {
        if (!form.name.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre es obligatorio.' });
            return;
        }
        mutation.mutate();
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (clinic) {
            setForm({
                name: clinic.name || '',
                address: clinic.address || '',
                city: clinic.city || '',
                state: clinic.state || '',
                phone: clinic.phone || '',
                email: clinic.email || '',
                website: clinic.website || '',
                description: clinic.description || '',
                is_24_hours: clinic.is_24_hours,
                has_emergency: clinic.has_emergency,
            });
        }
    };

    const startEditing = () => setIsEditing(true);

    const handleSuspend = () => {
        showAlert({
            type: 'warning',
            title: 'Suspender',
            message: '¿Estás seguro de suspender esta clínica?',
            showCancel: true,
            cancelText: 'Cancelar',
        });
    };

    return {
        clinic,
        isLoading,
        error,
        isEditing,
        form,
        setForm,
        isSaving: mutation.isPending,
        handleSave,
        handleCancelEdit,
        startEditing,
        handleSuspend,
    };
}
