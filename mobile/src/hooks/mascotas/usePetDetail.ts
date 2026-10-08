/**
 * usePetDetail — Hook for pet detail screen logic
 * Extracts data fetching from app/mascotas/[id].tsx
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { getPetById, sharePetPassport } from '@/src/services/mascotas';
import { createSubscriptionSession, createBillingPortalSession } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';
import { useAuth } from '@/src/contexts/AuthContext';
import { Linking } from 'react-native';
import type { Pet } from '@/src/types/mascotas';

export type PetTab = 'resumen' | 'salud' | 'historial';

export function usePetDetail() {
    const { id, tab: initialTab } = useLocalSearchParams<{ id: string; tab?: string }>();
    const router = useRouter();
    const { user } = useAuth();

    const {
        data: pet,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['pet-profile', id],
        queryFn: () => getPetById(id!),
        enabled: !!id,
    });

    // Al volver (p. ej. del pago de Michi-Tracker) se refresca el estado de la mascota
    useFocusEffect(
        useCallback(() => {
            if (id) refetch();
        }, [id, refetch])
    );

    /**
     * Compartir carnet: pide la URL pública del pasaporte y abre la tarjeta con el QR
     * (solo el dueño decide publicarla). `shareUrl !== null` mantiene abierto el modal.
     */
    const [shareUrl, setShareUrl] = useState<string | null>(null);

    const openShare = async () => {
        if (!id) return;
        try {
            const result = await sharePetPassport(id);
            if (result.share_url) setShareUrl(result.share_url);
        } catch {
            showAlert({ type: 'error', title: 'No se pudo compartir', message: 'Inténtalo de nuevo en un momento.' });
        }
    };

    const closeShare = () => setShareUrl(null);

    const goBack = () => router.back();

    const subscriptionMutation = useMutation({
        mutationFn: (petId: string) => createSubscriptionSession(petId),
        onSuccess: (data) => {
            if (data.url) {
                Linking.openURL(data.url);
            }
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo iniciar la suscripción de Michi-Tracker' });
        },
    });

    const handleSubscribeMichiTracker = () => {
        if (!id) return;
        subscriptionMutation.mutate(id);
    };

    // Con el Tracker activo la tarjeta abre la facturación: ahí se ve, cambia o cancela la suscripción
    const billingMutation = useMutation({
        mutationFn: createBillingPortalSession,
        onSuccess: (data) => {
            if (data.url) {
                Linking.openURL(data.url).catch(() => {
                    showAlert({ type: 'info', title: 'No se pudo abrir', message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.' });
                });
            }
        },
        onError: () => {
            showAlert({ type: 'error', title: 'No se pudo abrir', message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.' });
        },
    });

    const openTrackerBilling = () => billingMutation.mutate();

    // Pestaña visible: ?tab=salud|historial (enlaces desde Mi clínica, notificaciones o el carnet viejo)
    const [tab, setTab] = useState<PetTab>(
        initialTab === 'salud' || initialTab === 'historial' ? initialTab : 'resumen',
    );

    // La ficha también la abren admin (panel de mascotas) y veterinarios: solo el dueño edita o contrata servicios
    const isOwner = !!pet && !!user && pet.owner_id === user.id;

    return {
        pet,
        isOwner,
        isLoading,
        error,
        refetch,
        shareUrl,
        openShare,
        closeShare,
        tab,
        setTab,
        goBack,
        handleSubscribeMichiTracker,
        isSubscribing: subscriptionMutation.isPending,
        openTrackerBilling,
        isOpeningBilling: billingMutation.isPending,
    };
}

export type { Pet };
