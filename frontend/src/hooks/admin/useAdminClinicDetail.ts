/**
 * useAdminClinicDetail — detalle de una clínica para el admin: datos, modo edición, aprobación, rechazo y suspensión.
 * Espejo de `mobile/src/hooks/admin/useAdminClinicDetail.ts` (+ rechazo). Suspender/reactivar usa
 * `POST /clinics/admin/{id}/suspend|unsuspend` (la clínica deja de aparecer en el directorio público);
 * rechazar usa `DELETE /clinics/admin/{id}/reject` (borra la clínica).
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinic, updateClinic, type Clinic } from '@/services/directorio';
import { approveClinic, rejectClinic, suspendClinic, unsuspendClinic } from '@/services/moderacion';
import { ApiError } from '@/lib/api';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';
import { rememberSuspendedClinic, forgetSuspendedClinic } from './suspendedClinics';

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
    const router = useRouter();
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

    /** Actualiza la caché de la ficha con la clínica devuelta por el backend (sin re-leer: `GET /clinics/{id}` oculta las suspendidas). */
    const applyClinic = (updated: Clinic) => {
        queryClient.setQueryData(['admin-clinic', id], updated);
    };

    /** Marca la clínica en las listas del admin para que siga visible con su nuevo estado (sin re-leer: el listado público la esconde). */
    const patchListCaches = (updated: Clinic) => {
        for (const key of [['admin-clinics'], ['admin-clinics', 'pending']] as const) {
            queryClient.setQueryData<Clinic[]>(key, (old) =>
                old?.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
            );
        }
    };

    const invalidateLists = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-clinics'] });
        queryClient.invalidateQueries({ queryKey: ['pending-clinics'] });
        queryClient.invalidateQueries({ queryKey: ['directorio-clinics'] });
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
        onSuccess: (updated) => {
            applyClinic(updated);
            invalidateLists();
            setIsEditing(false);
            showAlert({ type: 'success', title: 'Guardado', message: 'La clínica se actualizó correctamente.' });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: errorMessage(e, 'Intenta de nuevo en un momento.') });
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => approveClinic(id),
        onSuccess: (updated) => {
            applyClinic(updated as Clinic);
            invalidateLists();
            showAlert({ type: 'success', title: 'Clínica aprobada', message: 'Ya aparece en el directorio.' });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo aprobar', message: errorMessage(e, 'Intenta de nuevo en un momento.') });
        },
    });

    const rejectMutation = useMutation({
        mutationFn: () => rejectClinic(id),
        onSuccess: () => {
            forgetSuspendedClinic(id);
            invalidateLists();
            showAlert({
                type: 'success',
                title: 'Clínica rechazada',
                message: 'Se eliminó del directorio y de la cola de revisión.',
                onButtonPress: () => router.push('/admin/clinicas'),
            });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo rechazar', message: errorMessage(e, 'Intenta de nuevo en un momento.') });
        },
    });

    const suspendMutation = useMutation({
        mutationFn: (suspended: boolean) => (suspended ? suspendClinic(id) : unsuspendClinic(id)),
        onSuccess: (updated, suspended) => {
            // Caché propia en vez de re-leer: GET /clinics/{id} responde 404 a las suspendidas y el listado público las esconde.
            applyClinic(updated);
            patchListCaches(updated);
            rememberSuspendedClinic(updated);
            queryClient.invalidateQueries({ queryKey: ['directorio-clinics'] });
            showAlert({
                type: 'success',
                title: suspended ? 'Clínica suspendida' : 'Clínica reactivada',
                message: suspended
                    ? 'Ya no aparece en el directorio público. Puedes reactivarla cuando quieras.'
                    : 'Vuelve a aparecer en el directorio público.',
            });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo cambiar', message: errorMessage(e, 'Intenta de nuevo en un momento.') });
        },
    });

    /**
     * Recuperación desde la ficha "no encontrada": `GET /clinics/{id}` responde 404 a las suspendidas, así que
     * el admin no puede abrirlas. `POST /clinics/admin/{id}/unsuspend` sí funciona con solo el id.
     */
    const forceUnsuspendMutation = useMutation({
        mutationFn: () => unsuspendClinic(id),
        onSuccess: (updated) => {
            applyClinic(updated);
            patchListCaches(updated);
            rememberSuspendedClinic(updated);
            queryClient.invalidateQueries({ queryKey: ['directorio-clinics'] });
            showAlert({ type: 'success', title: 'Clínica reactivada', message: 'Ya puedes ver su ficha y vuelve a aparecer en el directorio.' });
        },
        onError: (e) => {
            showAlert({
                type: 'error',
                title: 'No se pudo reactivar',
                message: errorMessage(e, 'Puede que la clínica ya no exista o que el enlace esté mal.'),
            });
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

    const handleReject = () => {
        showAlert({
            type: 'warning',
            title: 'Rechazar clínica',
            message: `"${clinic?.name ?? 'Esta clínica'}" se eliminará por completo (datos, servicios y reseñas). Esta acción no se puede deshacer. ¿Continuar?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Rechazar y eliminar',
            onButtonPress: () => rejectMutation.mutate(),
        });
    };

    const handleSuspend = () => {
        const suspended = !!clinic?.is_suspended;
        if (suspended) {
            suspendMutation.mutate(false);
            return;
        }
        showAlert({
            type: 'warning',
            title: 'Suspender clínica',
            message: `"${clinic?.name ?? 'Esta clínica'}" dejará de aparecer en el directorio público. Sus datos y citas se conservan. ¿Continuar?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Suspender',
            onButtonPress: () => suspendMutation.mutate(true),
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
        isSaving: mutation.isPending || suspendMutation.isPending,
        handleSave,
        handleCancelEdit,
        startEditing: () => setIsEditing(true),
        handleApprove,
        isApproving: approveMutation.isPending,
        handleReject,
        isRejecting: rejectMutation.isPending,
        handleSuspend,
        isSuspended: !!clinic?.is_suspended,
        handleForceUnsuspend: () => forceUnsuspendMutation.mutate(),
        isReactivating: forceUnsuspendMutation.isPending,
    };
}
