/**
 * usePetDetail — lógica de la ficha de mascota (`(app)/mascotas/[id]`).
 * Espejo de `mobile/src/hooks/mascotas/usePetDetail.ts` con `next/navigation`.
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getPetById, sharePetPassport } from '@/services/mascotas';
import { createSubscriptionSession, createBillingPortalSession } from '@/services/ecommerce';
import { showAlert } from '@/components/AppAlert';
import { useAuth } from '@/contexts/AuthContext';
import { openStripeUrl } from '@/utils/payments';
import type { Pet } from '@/types/mascotas';

export type PetTab = 'resumen' | 'salud' | 'historial';

export function usePetDetail() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const id = params.id;
    const initialTab = searchParams.get('tab');
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

    /** Compartir carnet: pide la URL pública del pasaporte (solo el dueño decide publicarla). */
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
                openStripeUrl(data.url).catch(() => {
                    showAlert({ type: 'error', title: 'Error', message: 'No se pudo iniciar la suscripción de Michi-Tracker' });
                });
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

    const billingMutation = useMutation({
        mutationFn: createBillingPortalSession,
        onSuccess: (data) => {
            if (data.url) {
                openStripeUrl(data.url).catch(() => {
                    showAlert({ type: 'info', title: 'No se pudo abrir', message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.' });
                });
            }
        },
        onError: () => {
            showAlert({ type: 'error', title: 'No se pudo abrir', message: 'El portal de facturación no está disponible ahora. Inténtalo más tarde.' });
        },
    });

    const openTrackerBilling = () => billingMutation.mutate();

    const [tab, setTab] = useState<PetTab>(
        initialTab === 'salud' || initialTab === 'historial' ? initialTab : 'resumen',
    );

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
