import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useVenueDetail } from '@/src/hooks/venues/useVenueDetail';
import { useVenueReviews } from '@/src/hooks/venues/useVenueReviews';
import { VenueReview } from '@/src/services/venues';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { useAuth } from '@/src/contexts/AuthContext';
import { Building2, MapPin, Tag, Star, MessageSquare, Gift, Send, X, Edit3 } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

export default function VenueDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { venue, isLoading, error, handleContact } = useVenueDetail();
    const [redeemCode, setRedeemCode] = React.useState('');

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
        handleRedeemCoupon,
        isRedeemingCoupon,
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
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Calificar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                    key={star}
                    disabled={!interactive}
                    onPress={() => interactive && setReviewRating(star)}
                >
                    <Star
                        size={interactive ? 28 : 16}
                        color={theme.warning}
                        fill={star <= rating ? theme.warning : 'transparent'}
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
            {!!review.review_text && (
                <Text style={[styles.reviewText, { color: theme.text }]}>{review.review_text}</Text>
            )}
        </View>
    );

    const isOwner = !!user && !!venue && user.id === venue.owner_id;
    const canEdit = isOwner;

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Establecimiento"
                actions={canEdit ? [{
                    icon: Edit3,
                    label: 'Editar establecimiento',
                    onPress: () => router.push({ pathname: '/establecimientos/editar/[id]', params: { id: venue.id } } as any),
                }] : undefined}
            />

            {/* Venue Header */}
            <View style={styles.venueHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Building2 size={40} color={theme.primary} />
                </View>
                <Text style={[styles.venueName, { color: theme.text }]}>{venue.name}</Text>

                {/* Score badge */}
                {score && score.reviews_count > 0 && (
                    <View style={[styles.scoreBadge, { backgroundColor: theme.warningLight }]}>
                        <Star size={18} color={theme.warning} fill={theme.warning} />
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
                    <View style={[styles.discountCard, { backgroundColor: theme.warningLight }]}>
                        <Tag size={24} color={theme.warning} />
                        <View style={styles.discountInfo}>
                            <Text style={[styles.discountCode, { color: theme.warning }]}>{venue.discount_coupon}</Text>
                            {venue.discount_description && (
                                <Text style={[styles.discountDesc, { color: theme.textMuted }]}>{venue.discount_description}</Text>
                            )}
                        </View>
                    </View>
                    {!isOwner && (
                    <TouchableOpacity
                        style={[styles.claimButton, { backgroundColor: theme.warning }]}
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
                    )}
                    {isOwner && (
                        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                            <Text style={{ color: theme.textMuted, fontSize: font.base }}>Canjear el cupón de un cliente (pídele su código):</Text>
                            <TextInput
                                style={[styles.reviewInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                                placeholder="Código del cupón"
                                placeholderTextColor={theme.textMuted}
                                autoCapitalize="characters"
                                value={redeemCode}
                                onChangeText={setRedeemCode}
                            />
                            <TouchableOpacity
                                style={[styles.claimButton, { backgroundColor: theme.warning, opacity: !redeemCode.trim() || isRedeemingCoupon ? 0.6 : 1 }]}
                                disabled={!redeemCode.trim() || isRedeemingCoupon}
                                onPress={() => { handleRedeemCoupon(redeemCode.trim()); setRedeemCode(''); }}
                            >
                                <Text style={styles.claimButtonText}>Canjear cupón</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Reviews Section */}
            <View style={[styles.section, { backgroundColor: theme.surface }]}>
                <View style={styles.reviewsSectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Reseñas</Text>
                    {!isOwner && (
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
                    )}
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
                    <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: spacing.lg }} />
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

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.contactButton, { backgroundColor: theme.primary }]}
                    onPress={handleContact}
                >
                    <Text style={styles.contactButtonText}>Cómo llegar</Text>
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
        gap: spacing.lg,
    },
    loadingText: {
        fontSize: font.xl,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
        gap: spacing.lg,
    },
    errorText: {
        fontSize: font.xl,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.md,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '600',
    },
    venueHeader: {
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.xl,
        gap: spacing.md,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    venueName: {
        fontSize: font.h2,
        fontWeight: '900',
        textAlign: 'center',
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        gap: spacing.sm,
    },
    scoreValue: {
        fontSize: font.xxl,
        fontWeight: '900',
        color: '#d97706',
    },
    scoreCount: {
        fontSize: font.base,
    },
    section: {
        marginHorizontal: layout.screenPadding,
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: font.xxl,
        fontWeight: '700',
        marginBottom: spacing.lg,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    locationText: {
        fontSize: font.lg,
        flex: 1,
        lineHeight: 22,
    },
    amenitiesGrid: {
        gap: spacing.md,
    },
    amenityCard: {
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    amenityKey: {
        fontSize: font.md,
        fontWeight: '600',
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
    },
    amenityValue: {
        fontSize: font.xl,
        fontWeight: '600',
    },
    discountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 12,
        gap: spacing.lg,
    },
    discountInfo: {
        flex: 1,
    },
    discountCode: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
    discountDesc: {
        fontSize: font.base,
        marginTop: spacing.xs,
    },
    claimButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    claimButtonText: {
        color: '#fff',
        fontSize: font.base,
        fontWeight: '700',
    },
    // Reviews
    reviewsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    addReviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        gap: spacing.sm,
    },
    addReviewText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    reviewForm: {
        padding: spacing.lg,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    reviewFormLabel: {
        fontSize: font.base,
        fontWeight: '700',
    },
    starsRow: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    reviewInput: {
        borderRadius: 12,
        borderWidth: 1,
        padding: spacing.lg,
        fontSize: font.base,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitReviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    submitReviewText: {
        color: '#fff',
        fontSize: font.base,
        fontWeight: '700',
    },
    reviewsList: {
        gap: spacing.md,
    },
    reviewCard: {
        padding: spacing.lg,
        borderRadius: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    reviewDate: {
        fontSize: font.md,
    },
    reviewText: {
        fontSize: font.base,
        lineHeight: 20,
    },
    noReviews: {
        fontSize: font.base,
        textAlign: 'center',
        paddingVertical: spacing.xl,
    },
    // Info
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.2)',
    },
    infoLabel: {
        fontSize: font.base,
        flex: 1,
    },
    infoValue: {
        fontSize: font.base,
        fontWeight: '600',
    },
    actionContainer: {
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.xxl,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
    },
    contactButtonText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '700',
    },
    footer: {
        height: 20,
    },
});
