/**
 * useReportDetail — ficha del reporte (`(app)/perdidas/rastreo/[id]`).
 * Espejo de `mobile/src/hooks/perdidas/useReportDetail.ts`. El seguimiento del collar
 * solo muestra la posición real del backend; no se simula GPS.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
    createSighting,
    getReportById,
    getReportMatches,
    getSightings,
    resolveReport,
} from '@/services/perdidas';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/AppAlert';
import type { LostPetReport, Sighting } from '@/services/perdidas';

export function useReportDetail() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const reportId = id ?? '';

    const {
        data: report,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['perdidas-report', id],
        queryFn: () => getReportById(reportId),
        enabled: !!id,
        // Solo el collar vivo se refresca; el resto es estático
        refetchInterval: (query) =>
            query.state.data?.has_tracker && !query.state.data?.is_resolved ? 15000 : false,
    });

    const isOwner = !!user?.id && user.id === report?.reporter_id;
    const isActive = !!report && !report.is_resolved && report.status === 'active';

    // Solo el dueño puede ver los avistamientos y las posibles coincidencias
    const { data: sightings = [] } = useQuery({
        queryKey: ['perdidas-sightings', id],
        queryFn: () => getSightings(reportId),
        enabled: !!id && isOwner,
    });

    const { data: matches = [] } = useQuery({
        queryKey: ['perdidas-matches', id],
        queryFn: () => getReportMatches(reportId),
        enabled: !!id && isOwner && isActive,
    });

    const invalidateLists = () => {
        queryClient.invalidateQueries({ queryKey: ['perdidas-report', id] });
        queryClient.invalidateQueries({ queryKey: ['lost-pet-reports'] });
        queryClient.invalidateQueries({ queryKey: ['lost-pet-resolved'] });
        queryClient.invalidateQueries({ queryKey: ['my-lost-reports'] });
    };

    const resolveMutation = useMutation({
        mutationFn: () => resolveReport(reportId),
        onSuccess: () => {
            invalidateLists();
            showAlert({
                type: 'success',
                title: '¡Felicidades!',
                message: 'Nos alegra mucho que este michi haya regresado a casa. El reporte quedó cerrado.',
            });
        },
        onError: (e: Error) => {
            showAlert({ type: 'error', title: 'No se pudo cerrar el reporte', message: e.message });
        },
    });

    const sightingMutation = useMutation({
        mutationFn: (data: { location_text?: string; note?: string }) => createSighting(reportId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perdidas-sightings', id] });
            showAlert({
                type: 'success',
                title: '¡Gracias por avisar!',
                message: 'Le enviamos una notificación al dueño con los datos del avistamiento.',
            });
        },
        onError: (e: Error) => {
            showAlert({ type: 'error', title: 'No se pudo enviar el avistamiento', message: e.message });
        },
    });

    const handleResolve = () => {
        showAlert({
            type: 'info',
            title: '¿Ya regresó a casa?',
            message: 'El reporte se cerrará y dejará de mostrarse como búsqueda activa.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Sí, ya regresó',
            onButtonPress: () => resolveMutation.mutate(),
        });
    };

    const submitSighting = (locationText: string, note: string) => {
        const location = locationText.trim();
        const trimmedNote = note.trim();
        if (!location && !trimmedNote) {
            showAlert({
                type: 'warning',
                title: 'Faltan datos',
                message: 'Indica dónde lo viste o agrega una nota para el dueño.',
            });
            return;
        }
        sightingMutation.mutate({
            location_text: location || undefined,
            note: trimmedNote || undefined,
        });
    };

    /** Abre el teléfono del reporte; si no hay teléfono, el correo; si no hay ninguno, avisa. */
    const handleCall = () => {
        const phone = report?.contact_phone?.trim();
        const email = report?.contact_email?.trim();
        const target = phone ? `tel:${phone}` : email ? `mailto:${email}` : null;
        if (!target) {
            showAlert({
                type: 'info',
                title: 'Sin datos de contacto',
                message: 'Este reporte no incluye teléfono ni correo. Usa «Avisar que lo vi» para notificar al dueño.',
            });
            return;
        }
        window.location.href = target;
    };

    const goBack = () => (window.history.length > 1 ? router.back() : router.replace('/perdidas'));

    return {
        report,
        isLoading,
        error,
        isOwner,
        isActive,
        sightings,
        matches,
        isResolving: resolveMutation.isPending,
        isSendingSighting: sightingMutation.isPending,
        hasContact: !!(report?.contact_phone?.trim() || report?.contact_email?.trim()),

        refetch,
        handleResolve,
        handleCall,
        submitSighting,
        goBack,
    };
}

export type { LostPetReport, Sighting };
