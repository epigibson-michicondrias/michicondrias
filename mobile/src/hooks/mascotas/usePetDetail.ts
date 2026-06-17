/**
 * usePetDetail — Hook for pet detail screen logic
 * Extracts data fetching from app/mascotas/[id].tsx
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPetById, sharePetPassport } from '@/src/services/mascotas';
import { createSubscriptionSession } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';
import { Linking } from 'react-native';
import type { Pet } from '@/src/types/mascotas';

export function usePetDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

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

    const handleShare = async () => {
        if (!id) return;
        try {
            const result = await sharePetPassport(id);
            return result.share_url;
        } catch (error) {
            console.error('Error sharing passport:', error);
            return null;
        }
    };

    const goToCarnet = () => {
        if (id) router.push(`/carnet/${id}` as any);
    };

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

    return {
        pet,
        isLoading,
        error,
        refetch,
        handleShare,
        goToCarnet,
        goBack,
        handleSubscribeMichiTracker,
        isSubscribing: subscriptionMutation.isPending,
    };
}

export type { Pet };
