/**
 * useAdminClinicDetail — detalle de una clínica para el admin: datos, modo edición y aprobación.
 * Espejo de `mobile/src/hooks/admin/useAdminClinicDetail.ts`. En la app "Suspender" solo mostraba un aviso: no hay
 * endpoint para suspender, así que aquí se quitó. Si la clínica está en revisión se puede aprobar
 * (`POST /clinics/admin/{id}/approve`).
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinic, updateClinic, type Clinic } from '@/services/directorio';
import { approveClinic } from '@/services/moderacion';
import { ApiError } from '@/lib/api';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';

export interface ClinicForm {
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

const toForm = (c: Clinic): ClinicForm => ({
    name: c.name || '',
    address: c.address || '',
    city: c.city || '',
    state: c.state || '',
    phone: c.phone || '',
    email: c.email || '',
    website: c.website || '',
    description: c.description || '',
    is_24_hours: c.is_24_hours,
    has_emergency: c.has_emergency,
});

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
    const [nameError, setNameError] = useState<string | null>(null);

    const { data: clinic, isLoading, error } = useQuery({
        queryKey: ['admin-clinic', id],
        queryFn: () => getClinic(id),
        enabled: !!id,
        retry: (count, e) => !(e instanceof ApiError && e.status === 404) && count < 2,
    });

    // El formulario se llena con cada versión de la clínica que llega (sin efecto)
    const [syncedClinic, setSyncedClinic] = useState<typeof clinic>();
    if (clinic && clinic !== syncedClinic) {
        setSyncedClinic(clinic);
        setForm(toForm(clinic));
    }

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-clinic', id] });
        queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
        queryClient.invalidateQueries({ queryKey: ['pending-clinics'] });
    };

    const mutation = useMutation({
        mutationFn: () =>
            updateClinic(id, {
                name: form.name.trim(),
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
            invalidate();
            setIsEditing(false);
            showAlert({ type: 'success', title: 'Guardado', message: 'La clínica se actualizó correctamente.' });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: errorMessage(e, 'Intenta de nuevo en un momento.') });
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => approveClinic(id),
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: 'Clínica aprobada', message: 'Ya aparece en el directorio.' });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo aprobar', message: errorMessage(e, 'Intenta de nuevo en un momento.') });
        },
    });

    const updateField = <K extends keyof ClinicForm>(key: K, value: ClinicForm[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        if (key === 'name' && nameError) setNameError(null);
    };

    const handleSave = () => {
        if (!form.name.trim()) {
            setNameError('Escribe el nombre de la clínica.');
            return;
        }
        mutation.mutate();
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNameError(null);
        if (clinic) setForm(toForm(clinic));
    };

    const handleApprove = () => {
        showAlert({
            type: 'warning',
            title: 'Aprobar clínica',
            message: `"${clinic?.name ?? 'Esta clínica'}" se publicará en el directorio para todos los usuarios.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Aprobar',
            onButtonPress: () => approveMutation.mutate(),
        });
    };

    return {
        clinic,
        isLoading,
        error,
        notFound: !isLoading && !clinic,
        isEditing,
        form,
        setForm,
        updateField,
        nameError,
        isSaving: mutation.isPending,
        handleSave,
        handleCancelEdit,
        startEditing: () => setIsEditing(true),
        handleApprove,
        isApproving: approveMutation.isPending,
    };
}
