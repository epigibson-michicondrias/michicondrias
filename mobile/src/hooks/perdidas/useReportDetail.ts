/**
 * useReportDetail — Hook for lost/found pet report detail screen
 * Manages report fetching, resolve mutation, owner checks, sightings and matches
 */
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import {
    getReportById,
    resolveReport,
    getSightings,
    createSighting,
    getReportMatches,
} from '@/src/services/perdidas';
import { useAuth } from '@/src/contexts/AuthContext';
import { Linking } from 'react-native';
import { showAlert } from '@/src/components/AppAlert';

export function useReportDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const reportId = id?.toString() || '';

    const { data: report, isLoading, error, refetch } = useQuery({
        queryKey: ['perdidas-report', id],
        queryFn: () => getReportById(reportId),
        enabled: !!id,
        refetchInterval: (query) => (query.state.data?.has_tracker && !query.state.data?.is_resolved ? 15000 : false),
    });

    const isOwner = !!user?.id && user.id === report?.reporter_id;
    const isActive = !!report && !report.is_resolved && report.status === 'active';

    // Solo el dueño puede ver los avistamientos y las posibles coincidencias
    const { data: sightings = [], isLoading: sightingsLoading } = useQuery({
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
        mutationFn: (data: { location_text?: string; note?: string }) =>
            createSighting(reportId, data),
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
            message: 'Esto marcará el reporte como RESUELTO y dejará de mostrarse como búsqueda activa.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: '¡SÍ, YA REGRESÓ!',
            onButtonPress: () => resolveMutation.mutate(),
        });
    };

    /** Envía el avistamiento con el texto y, si el permiso lo permite, la ubicación actual del usuario. */
    const submitSighting = async (locationText: string, note: string, shareLocation: boolean): Promise<boolean> => {
        if (!locationText.trim() && !note.trim() && !shareLocation) {
            showAlert({ type: 'warning', title: 'Faltan datos', message: 'Indica dónde lo viste o agrega una nota para el dueño.' });
            return false;
        }
        const payload: { location_text?: string; note?: string; latitude?: number; longitude?: number } = {
            location_text: locationText.trim() || undefined,
            note: note.trim() || undefined,
        };
        if (shareLocation) {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const pos = await Location.getCurrentPositionAsync({});
                    payload.latitude = pos.coords.latitude;
                    payload.longitude = pos.coords.longitude;
                } else {
                    showAlert({ type: 'warning', title: 'Sin ubicación', message: 'No diste permiso de ubicación; enviaremos solo el texto.' });
                }
            } catch {
                // se envía sin coordenadas
            }
        }
        try {
            await sightingMutation.mutateAsync(payload);
            return true;
        } catch {
            return false;
        }
    };

    /** Llama al teléfono del reporte; si no hay teléfono, abre el correo; si no hay ninguno, avisa. */
    const handleCall = () => {
        const phone = report?.contact_phone?.trim();
        const email = report?.contact_email?.trim();
        const target = phone ? `tel:${phone}` : email ? `mailto:${email}` : null;
        if (!target) {
            showAlert({ type: 'info', title: 'Sin datos de contacto', message: 'Este reporte no incluye teléfono ni correo. Usa "Avisar que lo vi" para notificar al dueño.' });
            return;
        }
        Linking.openURL(target).catch(() =>
            showAlert({ type: 'error', title: 'No se pudo abrir', message: 'Tu dispositivo no pudo abrir el contacto.' })
        );
    };

    const goBack = () => router.back();
    const goEdit = () => router.push(`/perdidas/editar/${reportId}` as any);

    return {
        // Data
        report,
        isLoading,
        error,
        isOwner,
        isActive,
        sightings,
        sightingsLoading,
        matches,
        isResolving: resolveMutation.isPending,
        isSendingSighting: sightingMutation.isPending,
        hasContact: !!(report?.contact_phone?.trim() || report?.contact_email?.trim()),

        // Actions
        refetch,
        handleResolve,
        handleCall,
        submitSighting,
        goBack,
        goEdit,
    };
}
