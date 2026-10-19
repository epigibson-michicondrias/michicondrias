/**
 * useClinicDetail — Data fetching for the clinic detail screen
 * Fetches clinic info, services, and rating by clinic ID
 */
import { Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { shareContent } from '@/src/utils/share';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClinic, getClinicServices, getClinicRating, getClinicReviews, createClinicReview } from '@/src/services/directorio';
import type { ClinicReview } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useClinicDetail() {
    const { id } = useLocalSearchParams();
    const clinicId = id as string;
    const queryClient = useQueryClient();
    const router = useRouter();
    const { user } = useAuth();

    const { data: clinic, isLoading } = useQuery({
        queryKey: ['clinic', clinicId],
        queryFn: () => getClinic(clinicId),
    });

    const { data: services = [] } = useQuery({
        queryKey: ['clinic-services', clinicId],
        queryFn: () => getClinicServices(clinicId),
    });

    const { data: rating } = useQuery({
        queryKey: ['clinic-rating', clinicId],
        queryFn: () => getClinicRating(clinicId),
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<ClinicReview[]>({
        queryKey: ['clinic-reviews', clinicId],
        queryFn: () => getClinicReviews(clinicId),
    });

    const createReviewMutation = useMutation({
        mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
            createClinicReview(clinicId, rating, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-reviews', clinicId] });
            queryClient.invalidateQueries({ queryKey: ['clinic-rating', clinicId] });
            queryClient.invalidateQueries({ queryKey: ['directorio-clinics'] });
            showAlert({ type: 'success', title: 'Reseña enviada', message: 'Tu reseña ha sido publicada.' });
        },
        onError: (e: any) => {
            showAlert({ type: 'error', title: 'No se pudo enviar', message: e?.message || 'No se pudo enviar la reseña.' });
        },
    });

    const handleCreateReview = (rating: number, comment?: string) => {
        createReviewMutation.mutate({ rating, comment });
    };

    const open = (url: string) => Linking.openURL(url).catch(() =>
        showAlert({ type: 'info', title: 'No se pudo abrir', message: 'Tu teléfono no tiene una app para esta acción.' }));
    const phoneDigits = clinic?.phone?.replace(/\D/g, '') ?? '';
    const place = [clinic?.address, clinic?.city].filter(Boolean).join(', ');

    return {
        clinicId,
        /** Quien administra la clínica no se reseña a sí mismo (el backend responde 403). */
        canReview: !!user && !!clinic && clinic.owner_user_id !== user.id,
        call: phoneDigits ? () => open(`tel:${phoneDigits}`) : undefined,
        whatsapp: phoneDigits ? () => open(`https://wa.me/${phoneDigits.length === 10 ? `52${phoneDigits}` : phoneDigits}`) : undefined,
        directions: () => open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([clinic?.name, place].filter(Boolean).join(', '))}`),
        website: clinic?.website ? () => open(clinic.website!.startsWith('http') ? clinic.website! : `https://${clinic.website}`) : undefined,
        share: () => clinic && shareContent(clinic.name, `${clinic.name}${place ? ` — ${place}` : ''}. La encontré en Michicondrias 🐾`),
        book: (serviceId?: string) => router.push({ pathname: '/directorio/citas/agendar/[clinic_id]', params: { clinic_id: clinicId, ...(serviceId ? { service_id: serviceId } : {}) } }),
        goBack: () => (router.canGoBack() ? router.back() : router.replace('/directorio')),
        clinic,
        isLoading,
        services,
        rating,
        // Reviews
        reviews,
        reviewsLoading,
        handleCreateReview,
        isCreatingReview: createReviewMutation.isPending,
    };
}
