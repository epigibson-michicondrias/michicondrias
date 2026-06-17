import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useVenueDetail } from '@/src/hooks/venues';
import { useVenueReviews } from '@/src/hooks/venues/useVenueReviews';
import { VenueReview } from '@/src/services/venues';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { useAuth } from '@/src/contexts/AuthContext';
import { Building2, MapPin, Tag, Info, Star, MessageSquare, Gift, Send, X, Edit3 } from 'lucide-react-native';

export default function VenueDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { venue, isLoading, error, handleContact } = useVenueDetail();

    // Reviews hook — only enable when venue is loaded
    const venueId = venue?.id;
    const {
        reviews,
        isLoadingReviews,
        score,
        reviewRating,
        setReviewRating,
        reviewText,
        setReviewText,
        showReviewForm,
        setShowReviewForm,
        handleSubmitReview,
        isSubmittingReview,
        handleClaimCoupon,
        isClaimingCoupon,
    } = useVenueReviews(venueId);

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Establecimiento" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando información...</Text>
                </View>
            </ScreenContainer>
        );
    }

    if (error || !venue) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Establecimiento" />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del establecimiento.
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    const renderStarRating = (rating: number, interactive: boolean = false) => (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                    key={star}
                    disabled={!interactive}
                    onPress={() => interactive && setReviewRating(star)}
                >
                    <Star
                        size={interactive ? 28 : 16}
                        color="#f59e0b"
                        fill={star <= rating ? '#f59e0b' : 'transparent'}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderReviewItem = (review: VenueReview) => (
        <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.background }]}>
            <View style={styles.reviewHeader}>
                {renderStarRating(review.rating)}
                <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                    {new Date(review.created_at).toLocaleDateString('es-MX')}
                </Text>
            </View>
            {review.review_text && (
                <Text style={[styles.reviewText, { color: theme.text }]}>{review.review_text}</Text>
            )}
        </View>
    );

    const canEdit = user && venue && (user.role_name === 'admin' || user.id === venue.owner_id);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Detalle del Establecimiento"
                rightElement={
                    canEdit ? (
                        <TouchableOpacity
                            style={[styles.editBtn, { backgroundColor: theme.primary + '20' }]}
                            onPress={() => router.push({ pathname: '/establecimientos/editar/[id]', params: { id: venue.id } } as any)}
                        >
                            <Edit3 size={18} color={theme.primary} />
                        </TouchableOpacity>
                    ) : undefined
                }
            />

            {/* Venue Header */}
            <View style={styles.venueHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Building2 size={40} color={theme.primary} />
                </View>
                <Text style={[styles.venueName, { color: theme.text }]}>{venue.name}</Text>

                {/* Score badge */}
                {score && (
                    <View style={[styles.scoreBadge, { backgroundColor: '#f59e0b15' }]}>
                        <Star size={18} color="#f59e0b" fill="#f59e0b" />
                        <Text style={styles.scoreValue}>{score.average_rating.toFixed(1)}</Text>
                        <Text style={[styles.scoreCount, { color: theme.textMuted }]}>
                            ({score.reviews_count} reseñas)
                        </Text>
                    </View>
                )}
            </View>

            {/* Location */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
                <View style={styles.locationRow}>
                    <MapPin size={20} color={theme.primary} />
                    <Text style={[styles.locationText, { color: theme.textMuted }]}>{venue.address}</Text>
                </View>
            </View>

            {/* Amenities */}
            {venue.amenities && Object.keys(venue.amenities).length > 0 && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios</Text>
                    <View style={styles.amenitiesGrid}>
                        {Object.entries(venue.amenities).map(([key, value], index) => (
                            <View key={index} style={[styles.amenityCard, { backgroundColor: theme.background }]}>
                                <Text style={[styles.amenityKey, { color: theme.primary }]}>{key}</Text>
                                <Text style={[styles.amenityValue, { color: theme.text }]}>{String(value)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Discount + Coupon Claim */}
            {venue.discount_coupon && (
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Descuento Disponible</Text>
                    <View style={[styles.discountCard, { backgroundColor: '#f59e0b15' }]}>
                        <Tag size={24} color="#f59e0b" />
                        <View style={styles.discountInfo}>
                            <Text style={[styles.discountCode, { color: '#f59e0b' }]}>{venue.discount_coupon}</Text>
                            {venue.discount_description && (
                                <Text style={[styles.discountDesc, { color: theme.textMuted }]}>{venue.discount_description}</Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.claimButton, { backgroundColor: '#f59e0b' }]}
                        onPress={handleClaimCoupon}
                        disabled={isClaimingCoupon}
                    >
                        {isClaimingCoupon ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Gift size={18} color="#fff" />
                                <Text style={styles.claimButtonText}>Reclamar Cupón</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Reviews Section */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <View style={styles.reviewsSectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Reseñas</Text>
                    <TouchableOpacity
                        style={[styles.addReviewBtn, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => setShowReviewForm(!showReviewForm)}
                    >
                        {showReviewForm ? (
                            <X size={16} color={theme.primary} />
                        ) : (
                            <MessageSquare size={16} color={theme.primary} />
                        )}
                        <Text style={[styles.addReviewText, { color: theme.primary }]}>
                            {showReviewForm ? 'Cancelar' : 'Escribir'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Review form */}
                {showReviewForm && (
                    <View style={[styles.reviewForm, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Text style={[styles.reviewFormLabel, { color: theme.text }]}>Tu calificación</Text>
                        {renderStarRating(reviewRating, true)}

                        <TextInput
                            style={[styles.reviewInput, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
                            placeholder="Escribe tu reseña (opcional)"
                            placeholderTextColor={theme.textMuted}
                            value={reviewText}
                            onChangeText={setReviewText}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity
                            style={[styles.submitReviewBtn, { backgroundColor: theme.primary }]}
                            onPress={handleSubmitReview}
                            disabled={isSubmittingReview}
                        >
                            {isSubmittingReview ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Send size={16} color="#fff" />
                                    <Text style={styles.submitReviewText}>Enviar Reseña</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Reviews list */}
                {isLoadingReviews ? (
                    <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 16 }} />
                ) : reviews.length === 0 ? (
                    <Text style={[styles.noReviews, { color: theme.textMuted }]}>
                        Aún no hay reseñas. ¡Sé el primero!
                    </Text>
                ) : (
                    <View style={styles.reviewsList}>
                        {reviews.map(renderReviewItem)}
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <View style={styles.infoRow}>
                    <Info size={16} color={theme.textMuted} />
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>ID del Establecimiento:</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{venue.id.substring(0, 12)}...</Text>
                </View>
                <View style={styles.infoRow}>
                    <Info size={16} color={theme.textMuted} />
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Propietario:</Text>
                    <Text style={[styles.infoValue, { color: theme.text }]}>{venue.owner_id.substring(0, 12)}...</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.contactButton, { backgroundColor: theme.primary }]}
                    onPress={handleContact}
                >
                    <Text style={styles.contactButtonText}>Contactar Establecimiento</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    editBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    venueHeader: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 12,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    venueName: {
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#f59e0b',
    },
    scoreCount: {
        fontSize: 13,
    },
    section: {
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    locationText: {
        fontSize: 15,
        flex: 1,
        lineHeight: 22,
    },
    amenitiesGrid: {
        gap: 12,
    },
    amenityCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    amenityKey: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    amenityValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    discountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    discountInfo: {
        flex: 1,
    },
    discountCode: {
        fontSize: 18,
        fontWeight: '800',
    },
    discountDesc: {
        fontSize: 14,
        marginTop: 4,
    },
    claimButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 12,
        gap: 8,
    },
    claimButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    // Reviews
    reviewsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addReviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    addReviewText: {
        fontSize: 13,
        fontWeight: '600',
    },
    reviewForm: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 16,
        gap: 12,
    },
    reviewFormLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 4,
    },
    reviewInput: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitReviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    submitReviewText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    reviewsList: {
        gap: 10,
    },
    reviewCard: {
        padding: 14,
        borderRadius: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewDate: {
        fontSize: 12,
    },
    reviewText: {
        fontSize: 14,
        lineHeight: 20,
    },
    noReviews: {
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },
    // Info
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    infoLabel: {
        fontSize: 14,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    actionContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        height: 20,
    },
});
