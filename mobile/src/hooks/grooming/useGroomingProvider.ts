/**
 * useGroomingProvider — Provider-side grooming management hook
 * Fetches provider appointments, handles photo upload and status updates
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import {
    getProviderAppointments,
    updateAppointmentPhotos,
    updateAppointmentStatus,
} from '@/src/services/grooming';
import { errorMessage } from '@/src/hooks/servicios-pro/requestStatus';
import { getMascotasPresignedUrl } from '@/src/services/mascotas';
import { getS3Url , getFileExtension } from '@/src/utils/helpers';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';
import type { GroomingAppointment, GroomingAppointmentUpdatePhotos } from '@/src/services/grooming';

export type ProviderFilter = 'all' | 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export function useGroomingProvider() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<ProviderFilter>('all');

    // ── Provider appointments ────────────────────────────────────
    const {
        data: appointments = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery<GroomingAppointment[]>({
        queryKey: ['grooming-provider-appointments'],
        queryFn: () => getProviderAppointments(),
    });

    const filteredAppointments = useMemo(() => {
        if (filter === 'all') return appointments;
        return appointments.filter(a => (a.status === 'pending' ? 'scheduled' : a.status) === filter);
    }, [appointments, filter]);

    // ── Photo / status mutation ──────────────────────────────────
    const photoMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: GroomingAppointmentUpdatePhotos }) =>
            updateAppointmentPhotos(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grooming-provider-appointments'] });
            showAlert({
                type: 'success',
                title: '¡Actualizado!',
                message: 'Las fotos y reporte se guardaron correctamente.',
            });
        },
        onError: (e) => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: errorMessage(e, 'No se pudieron guardar los cambios.'),
            });
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateAppointmentStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['grooming-provider-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['grooming-client-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['grooming-slots'] });
        },
        onError: (e) => showAlert({ type: 'error', title: 'No se pudo actualizar', message: errorMessage(e, 'Inténtalo de nuevo.') }),
    });

    /** Las fotos elegidas son archivos del teléfono: se suben al almacenamiento y se guarda su URL pública. */
    const uploadIfLocal = async (uri?: string) => {
        if (!uri || /^https?:\/\//i.test(uri)) return uri;
        const ext = getFileExtension(uri);
        const { url, object_key } = await getMascotasPresignedUrl(ext);
        await uploadImageToPresignedUrl(uri, url, ext);
        return getS3Url(object_key);
    };

    const updatePhotos = async (appointmentId: string, data: GroomingAppointmentUpdatePhotos) => {
        try {
            const before = await uploadIfLocal(data.before_photo_url);
            const after = await uploadIfLocal(data.after_photo_url);
            photoMutation.mutate({ id: appointmentId, data: { ...data, before_photo_url: before, after_photo_url: after } });
        } catch (e) {
            showAlert({ type: 'error', title: 'No se pudo subir la foto', message: errorMessage(e, 'Revisa tu conexión e inténtalo de nuevo.') });
        }
    };

    const updateStatus = (appointmentId: string, status: string) => {
        statusMutation.mutate({ id: appointmentId, status });
    };

    return {
        // Data
        appointments: filteredAppointments,
        allAppointments: appointments,
        filter,

        // Loading
        isLoading,
        isRefetching,
        isUpdating: photoMutation.isPending || statusMutation.isPending,

        // Actions
        setFilter,
        refetch,
        updatePhotos,
        updateStatus,
    };
}
