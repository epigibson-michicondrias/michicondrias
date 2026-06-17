/**
 * useVenueReviews — Hook for venue reviews, score, and coupons
 * Manages reviews fetching, review submission, and coupon operations
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createReview,
    getVenueReviews,
    getVenueScore,
    claimCoupon,
    redeemCoupon,
    VenueReview,
    VenueReviewCreate,
    ClaimedCoupon,
} from '@/src/services/venues';
import { showAlert } from '@/src/components/AppAlert';

export function useVenueReviews(venueId: string | undefined) {
    const queryClient = useQueryClient();

    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Fetch reviews
    const {
        data: reviews = [],
        isLoading: isLoadingReviews,
    } = useQuery<VenueReview[]>({
        queryKey: ['venue-reviews', venueId],
        queryFn: () => getVenueReviews(venueId!),
        enabled: !!venueId,
    });

    // Fetch venue score
    const {
        data: score,
        isLoading: isLoadingScore,
    } = useQuery<{ venue_id: string; average_rating: number; reviews_count: number }>({
        queryKey: ['venue-score', venueId],
        queryFn: () => getVenueScore(venueId!),
        enabled: !!venueId,
    });

    // Submit review
    const reviewMutation = useMutation<VenueReview, Error, { venueId: string; data: VenueReviewCreate }>({
        mutationFn: ({ venueId: vId, data }) => createReview(vId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venue-reviews', venueId] });
            queryClient.invalidateQueries({ queryKey: ['venue-score', venueId] });
            setReviewText('');
            setReviewRating(5);
            setShowReviewForm(false);
            showAlert({
                type: 'success',
                title: '¡Reseña enviada!',
                message: 'Tu reseña ha sido publicada exitosamente.',
            });
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo enviar la reseña. Intenta de nuevo.',
            });
        },
    });

    // Claim coupon
    const claimCouponMutation = useMutation<ClaimedCoupon, Error, string>({
        mutationFn: (vId) => claimCoupon(vId),
        onSuccess: (data) => {
            showAlert({
                type: 'success',
                title: '¡Cupón reclamado!',
                message: `Tu código de cupón es: ${data.coupon_code}`,
            });
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo reclamar el cupón.',
            });
        },
    });

    // Redeem coupon
    const redeemCouponMutation = useMutation<ClaimedCoupon, Error, string>({
        mutationFn: (code) => redeemCoupon(code),
        onSuccess: () => {
            showAlert({
                type: 'success',
                title: '¡Cupón canjeado!',
                message: 'Tu cupón ha sido canjeado exitosamente.',
            });
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo canjear el cupón.',
            });
        },
    });

    const handleSubmitReview = () => {
        if (!venueId) return;
        if (reviewRating < 1 || reviewRating > 5) {
            showAlert({ type: 'error', title: 'Error', message: 'La calificación debe ser entre 1 y 5.' });
            return;
        }

        reviewMutation.mutate({
            venueId,
            data: {
                rating: reviewRating,
                review_text: reviewText.trim() || undefined,
            },
        });
    };

    const handleClaimCoupon = () => {
        if (!venueId) return;
        claimCouponMutation.mutate(venueId);
    };

    const handleRedeemCoupon = (code: string) => {
        redeemCouponMutation.mutate(code);
    };

    return {
        // Reviews
        reviews,
        isLoadingReviews,

        // Score
        score,
        isLoadingScore,

        // Review form
        reviewRating,
        setReviewRating,
        reviewText,
        setReviewText,
        showReviewForm,
        setShowReviewForm,
        handleSubmitReview,
        isSubmittingReview: reviewMutation.isPending,

        // Coupons
        handleClaimCoupon,
        isClaimingCoupon: claimCouponMutation.isPending,
        handleRedeemCoupon,
        isRedeemingCoupon: redeemCouponMutation.isPending,
    };
}
