import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useSitterDetail } from '@/src/hooks/cuidadores/useSitterDetail';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';

import { MapPin, Star, Clock, Home, Users, Calendar, Shield, Share2, Dog, Cat, CheckCircle, Sun, Moon } from 'lucide-react-native';
import { shareContent } from '@/src/utils/share';
import { ProviderHero, ProviderStats, ProviderSection, ProviderBio, ProviderServices, ProviderLocation, ProviderPrice, ProviderRatingSummary, ProviderReviews, ProviderReviewForm, ProviderFooter } from '@/src/features/proveedor/ProviderProfile';
import DatePicker from '@/src/components/DatePicker';
import { toLocalIsoDate } from '@/src/hooks/servicios-pro/requestStatus';
import { font, spacing } from '@/constants/design';

export default function SitterDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        sitter,
        isOwnProfile,
        sitServiceType,
        setSitServiceType,
        isLoading,
        error,
        handleBook,
        getServiceName,
        // Sit request
        sitModalVisible,
        setSitModalVisible,
        selectedPetId,
        setSelectedPetId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sitNotes,
        setSitNotes,
        myPets,
        handleSubmitSitRequest,
        isRequestingSit,
        // Reviews
        reviews,
        reviewsLoading,
        handleCreateReview,
        isCreatingReview,
        unreviewedCompletedRequests,
    } = useSitterDetail();

    const [formRating, setFormRating] = React.useState(5);
    const [formComment, setFormComment] = React.useState('');

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'visiting': return <Sun size={20} color={theme.primary} />;
            case 'hosting': return <Moon size={20} color={theme.primary} />;
            default: return <Home size={20} color={theme.primary} />;
        }
    };

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Cuidador" />
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message="Cargando información..." />
                </View>
            </ScreenContainer>
        );
    }

    if (error || !sitter) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Cuidador" />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del cuidador.
                    </Text>
                    <TouchableOpacity accessibilityRole="button"
                        style={[styles.retryButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.retryButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScrollView style={{ flex: 1 }}>
                <ScreenHeader
                    title="Perfil del Cuidador"
                />

                <ProviderHero
                    photoUrl={sitter.photo_url}
                    name={sitter.display_name}
                    subtitle={sitter.is_verified ? 'Cuidador verificado' : undefined}
                    rating={sitter.rating}
                    reviewCount={sitter.total_sits}
                    accent={theme.secondary}
                />

                <ProviderStats items={[
                    { value: String(sitter.total_sits), label: 'Cuidados' },
                    { value: String(sitter.experience_years ?? 0), label: 'Años' },
                    { value: String(sitter.max_pets ?? 0), label: 'Mascotas' },
                ]} />

                {/* Bio */}
                {sitter.bio && (
                    <ProviderSection title="Sobre mí">
                        <ProviderBio text={sitter.bio} />
                    </ProviderSection>
                )}

                {/* Services */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Ofrecidos</Text>
                    <View style={styles.servicesContainer}>
                        <View style={[styles.serviceCard, { borderColor: theme.border }, { backgroundColor: theme.primary + '10' }]}>
                            {getServiceIcon(sitter.service_type)}
                            <View style={styles.serviceInfo}>
                                <Text style={[styles.serviceName, { color: theme.primary }]}>
                                    {getServiceName(sitter.service_type)}
                                </Text>
                                <Text style={[styles.serviceDesc, { color: theme.textMuted }]}>
                                    {sitter.service_type === 'visiting' ? 'Visita a tu mascota en tu domicilio' : sitter.service_type === 'hosting' ? 'Tu mascota se hospeda en casa del cuidador' : 'Hospedaje en casa del cuidador o visitas a domicilio'}
                                </Text>
                            </View>
                            <CheckCircle size={20} color={theme.success} />
                        </View>
                    </View>
                </View>

                {/* Pet Types */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Tipos de Mascotas</Text>
                    <View style={styles.petTypesContainer}>
                        <View style={[styles.petTypeCard, { borderColor: theme.border }, { backgroundColor: sitter.accepts_dogs ? theme.primary + '10' : theme.surface }]}>
                            <Dog size={24} color={sitter.accepts_dogs ? theme.primary : theme.textMuted} />
                            <Text style={[styles.petTypeName, { color: sitter.accepts_dogs ? theme.primary : theme.textMuted }]}>
                                Perros
                            </Text>
                            <CheckCircle size={16} color={sitter.accepts_dogs ? theme.success : theme.textMuted} />
                        </View>
                        <View style={[styles.petTypeCard, { borderColor: theme.border }, { backgroundColor: sitter.accepts_cats ? theme.primary + '10' : theme.surface }]}>
                            <Cat size={24} color={sitter.accepts_cats ? theme.primary : theme.textMuted} />
                            <Text style={[styles.petTypeName, { color: sitter.accepts_cats ? theme.primary : theme.textMuted }]}>
                                Gatos
                            </Text>
                            <CheckCircle size={16} color={sitter.accepts_cats ? theme.success : theme.textMuted} />
                        </View>
                    </View>
                </View>

                {/* Home Features */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Características del Hogar</Text>
                    <View style={styles.featuresGrid}>
                        {sitter.home_type ? (
                            <View style={styles.featureItem}>
                                <Home size={20} color={theme.primary} />
                                <Text style={[styles.featureText, { color: theme.textMuted }]}>{sitter.home_type}</Text>
                            </View>
                        ) : null}
                        {sitter.has_yard && (
                            <View style={styles.featureItem}>
                                <Sun size={20} color={theme.secondary} />
                                <Text style={[styles.featureText, { color: theme.textMuted }]}>Patio privado</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Location */}
                {sitter.location && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
                        <View style={styles.locationRow}>
                            <MapPin size={20} color={theme.primary} />
                            <Text style={[styles.locationText, { color: theme.textMuted }]}>
                                {sitter.location}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Pricing */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas</Text>
                    <View style={[styles.pricingCard, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Cuidado por día</Text>
                        <Text style={[styles.priceAmount, { color: theme.primary }]}>
                            {sitter.price_per_day ? `$${sitter.price_per_day}` : 'Por acordar'}
                        </Text>
                    </View>
                    {sitter.price_per_visit && (
                        <View style={[styles.pricingCard, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Visita individual</Text>
                            <Text style={[styles.priceAmount, { color: theme.primary }]}>
                                ${sitter.price_per_visit}
                            </Text>
                        </View>
                    )}
                </View>

                <ProviderSection title="Reseñas y Opiniones">
                    <ProviderRatingSummary rating={sitter.rating || 0} count={reviews.length} />
                    {unreviewedCompletedRequests.length > 0 && (
                        <ProviderReviewForm onSubmit={(rating, comment) => { const req = unreviewedCompletedRequests[0]; if (req) handleCreateReview(req.id, { rating, comment }); }} isSubmitting={isCreatingReview} />
                    )}
                    <ProviderReviews reviews={reviews.map((r: any) => ({ id: r.id, user_name: r.user_name, rating: r.rating, comment: r.comment, created_at: r.created_at }))} />
                </ProviderSection>
            </ScrollView>

            {!isOwnProfile && (
                <ProviderFooter label="Reservar Cuidado" onPress={() => handleBook('boarding')} icon={<Calendar size={20} color={theme.onPrimary} />} />
            )}

        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        gap: spacing.lg,
    },
    errorText: {
        fontSize: font.xl,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '600',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.xl,
        gap: spacing.lg,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: font.display,
        fontWeight: '800',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: font.h2,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    ratingText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        alignSelf: 'flex-start',
    },
    verifiedText: {
        fontSize: font.md,
        fontWeight: '600',
        color: '#10b981',
    },
    shareButton: {
        padding: spacing.sm,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.xxl,
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        marginHorizontal: spacing.lg,
    },
    statNumber: {
        fontSize: font.h3,
        fontWeight: '800',
        marginTop: spacing.sm,
    },
    statLabel: {
        fontSize: font.md,
        marginTop: spacing.xs,
    },
    section: {
        marginHorizontal: spacing.xxl,
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: font.xxl,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    bioText: {
        fontSize: font.lg,
        lineHeight: 22,
    },
    servicesContainer: {
        gap: spacing.md,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        gap: spacing.md,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: font.xl,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    serviceDesc: {
        fontSize: font.base,
        lineHeight: 18,
    },
    petTypesContainer: {
        gap: spacing.md,
    },
    petTypeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: 12,
        borderWidth: 1,
        gap: spacing.md,
    },
    petTypeName: {
        flex: 1,
        fontSize: font.lg,
        fontWeight: '600',
    },
    featuresGrid: {
        gap: spacing.md,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
    },
    featureText: {
        fontSize: font.base,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    locationText: {
        fontSize: font.lg,
        flex: 1,
    },
    pricingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    priceLabel: {
        fontSize: font.lg,
    },
    priceAmount: {
        fontSize: font.h3,
        fontWeight: '800',
    },
    actionContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xxl,
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 12,
        gap: spacing.sm,
        borderWidth: 1,
    },
    contactButtonText: {
        fontSize: font.lg,
        fontWeight: '600',
    },
    bookButton: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 18,
        gap: spacing.sm,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: font.lg,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.xl,
        paddingBottom: spacing.huge,
        borderTopWidth: 1,
        gap: spacing.md,
    },
    contactBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 18,
        gap: spacing.sm,
        borderWidth: 1.5,
    },
    contactBtnText: {
        fontSize: font.lg,
        fontWeight: '700',
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: spacing.xxl, paddingBottom: spacing.huge, maxHeight: '85%' },
    modalTitle: { fontSize: font.h2, fontWeight: '800', marginBottom: spacing.xl },
    modalLabel: { fontSize: font.md, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
    petChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 12, marginRight: spacing.md, borderWidth: 1 },
    petChipText: { fontSize: font.base, fontWeight: '700' },
    noPetsText: { fontSize: font.base, paddingVertical: spacing.sm },
    modalInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: font.lg, height: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl },
    modalCancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalCancelText: { fontSize: font.lg, fontWeight: '700' },
    modalSubmitBtn: { flex: 2, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalSubmitText: { color: '#fff', fontSize: font.lg, fontWeight: '800' },
    ratingSummaryCard: {
        flexDirection: 'row',
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    summaryLeft: {
        alignItems: 'center',
        paddingRight: spacing.xl,
    },
    bigRating: {
        fontSize: font.display,
        fontWeight: '800',
    },
    starsRow: {
        flexDirection: 'row',
        gap: spacing.xxs,
        marginVertical: spacing.sm,
    },
    totalReviewsText: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    summarySeparator: {
        width: 1,
        height: '80%',
    },
    summaryRight: {
        flex: 1,
        paddingLeft: spacing.xl,
    },
    summaryDescription: {
        fontSize: font.md,
        lineHeight: 18,
        fontWeight: '600',
    },
    writeReviewCard: {
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: spacing.xxl,
    },
    writeReviewTitle: {
        fontSize: font.xl,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    writeReviewSubtitle: {
        fontSize: font.md,
        fontWeight: '600',
        marginBottom: spacing.lg,
    },
    interactiveStars: {
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    starTouch: {
        padding: spacing.xs,
    },
    commentInput: {
        borderRadius: 16,
        borderWidth: 1,
        padding: spacing.md,
        fontSize: font.base,
        height: 80,
        textAlignVertical: 'top',
        marginBottom: spacing.lg,
        fontWeight: '600',
    },
    submitReviewBtn: {
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitReviewBtnText: {
        color: '#fff',
        fontSize: font.base,
        fontWeight: '800',
    },
    infoReviewCard: {
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: spacing.xl,
    },
    infoReviewText: {
        fontSize: font.base,
        fontWeight: '600',
        textAlign: 'center',
    },
    reviewsList: {
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    emptyReviewsText: {
        fontSize: font.base,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: spacing.xl,
        fontStyle: 'italic',
    },
    reviewItemCard: {
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
    },
    reviewItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewAvatarText: {
        fontSize: font.base,
        fontWeight: '800',
    },
    reviewUserName: {
        fontSize: font.base,
        fontWeight: '800',
    },
    reviewStarsRow: {
        flexDirection: 'row',
        gap: spacing.xxs,
        marginTop: spacing.xxs,
    },
    reviewDate: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    reviewCommentText: {
        fontSize: font.base,
        lineHeight: 19,
        fontWeight: '600',
    },
});
