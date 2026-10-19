import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useWalkerDetail } from '@/src/hooks/paseadores/useWalkerDetail';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { 
    MapPin, Star, Clock, Users, Calendar, 
    Shield, Share2, Dog, Cat, CheckCircle 
} from 'lucide-react-native';
import ScreenHeader from '@/src/components/layout/ScreenHeader';

import { shareContent } from '@/src/utils/share';
import { ProviderHero, ProviderStats, ProviderSection, ProviderBio, ProviderServices, ProviderLocation, ProviderPrice, ProviderRatingSummary, ProviderReviews, ProviderReviewForm, ProviderFooter } from '@/src/features/proveedor/ProviderProfile';
import DatePicker from '@/src/components/DatePicker';
import { toLocalIsoDate } from '@/src/hooks/servicios-pro/requestStatus';
import { font, spacing, layout } from '@/constants/design';

export default function WalkerDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        walker,
        isOwnProfile,
        walkDate,
        setWalkDate,
        isLoading,
        error,
        handleBook,
        // Walk request
        walkModalVisible,
        setWalkModalVisible,
        selectedPetId,
        setSelectedPetId,
        walkNotes,
        setWalkNotes,
        walkDuration,
        setWalkDuration,
        myPets,
        handleSubmitWalkRequest,
        isRequestingWalk,
        // Reviews
        reviews,
        reviewsLoading,
        handleCreateReview,
        isCreatingReview,
        unreviewedCompletedRequests,
    } = useWalkerDetail();

    const [formRating, setFormRating] = React.useState(5);
    const [formComment, setFormComment] = React.useState('');

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Paseador" />
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message="Cargando información..." />
                </View>
            </ScreenContainer>
        );
    }

    if (error || !walker) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Paseador" />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        No pudimos cargar la información del paseador.
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
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader
                title="Perfil del Paseador"
            />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
                <ProviderHero
                    photoUrl={walker.photo_url}
                    name={walker.display_name}
                    subtitle={walker.is_verified ? 'Paseador verificado' : undefined}
                    rating={walker.rating}
                    reviewCount={walker.total_walks}
                />

                <ProviderStats items={[
                    { value: String(walker.total_walks), label: 'Paseos' },
                    { value: String(walker.experience_years ?? 0), label: 'Años' },
                    { value: String(walker.max_pets_per_walk), label: 'Mascotas' },
                ]} />

                {walker.bio && (
                    <ProviderSection title="Sobre mí">
                        <ProviderBio text={walker.bio} />
                    </ProviderSection>
                )}

                <ProviderSection title="Servicios">
                    <ProviderServices services={[
                        { name: 'Paseo de Perros', active: walker.accepts_dogs, icon: <Dog size={24} color={walker.accepts_dogs ? theme.primary : theme.textMuted} /> },
                        { name: 'Paseo de Gatos', active: walker.accepts_cats, icon: <Cat size={24} color={walker.accepts_cats ? theme.primary : theme.textMuted} /> },
                    ]} />
                </ProviderSection>

                {walker.location && (
                    <ProviderSection title="Ubicación">
                        <ProviderLocation text={walker.location} extra={walker.service_radius_km ? `Radio de servicio: ${walker.service_radius_km} km` : undefined} />
                    </ProviderSection>
                )}

                {/* Pricing */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas</Text>
                    <View style={[styles.pricingCard, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Por hora</Text>
                        <Text style={[styles.priceAmount, { color: theme.primary }]}>
                            {walker.price_per_hour ? `$${walker.price_per_hour}` : 'Por acordar'}
                        </Text>
                    </View>
                    {walker.price_per_walk && (
                        <View style={[styles.pricingCard, { borderBottomColor: theme.border }]}>
                            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Paseo individual</Text>
                            <Text style={[styles.priceAmount, { color: theme.primary }]}>
                                ${walker.price_per_walk}
                            </Text>
                        </View>
                    )}
                </View>

                <ProviderSection title="Reseñas y Opiniones">
                    <ProviderRatingSummary rating={walker.rating || 0} count={reviews.length} />
                    {unreviewedCompletedRequests.length > 0 && (
                        <ProviderReviewForm onSubmit={(rating, comment) => { const req = unreviewedCompletedRequests[0]; if (req) handleCreateReview(req.id, { rating, comment }); }} isSubmitting={isCreatingReview} />
                    )}
                    <ProviderReviews reviews={reviews.map((r: any) => ({ id: r.id, user_name: r.user_name, rating: r.rating, comment: r.comment, created_at: r.created_at }))} />
                </ProviderSection>
            </ScrollView>

            {/* Action Buttons (Sticky Footer) */}
            {!isOwnProfile && (
            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.borderLight }]}>
<TouchableOpacity accessibilityRole="button"
                    style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    onPress={handleBook}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.bookButtonText}>Reservar Paseo</Text>
                </TouchableOpacity>
            </View>
            )}

            {/* Walk Request Modal */}
            <Modal visible={walkModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Solicitar Paseo</Text>
                        
                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Selecciona tu mascota</Text>
                        {myPets.length === 0 ? (
                            <Text style={[styles.noPetsText, { color: theme.textMuted }]}>No tienes mascotas registradas</Text>
                        ) : (
                            <FlatList
                                data={myPets}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={p => p.id}
                                renderItem={({ item: pet }) => (
                                    <TouchableOpacity accessibilityRole="button"
                                        style={[
                                            styles.petChip,
                                            { backgroundColor: theme.surface, borderColor: selectedPetId === pet.id ? theme.primary : theme.border },
                                            selectedPetId === pet.id && { borderWidth: 2 }
                                        ]}
                                        onPress={() => setSelectedPetId(pet.id)}
                                    >
                                        <Text style={[styles.petChipText, { color: selectedPetId === pet.id ? theme.primary : theme.text }]}>
                                            {pet.name}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Fecha del paseo</Text>
                        <DatePicker
                            value={new Date(walkDate + 'T12:00:00')}
                            onChange={(d) => setWalkDate(toLocalIsoDate(d))}
                            minimumDate={new Date()}
                        />

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Duración (minutos)</Text>
                        <View style={styles.durationRow}>
                            {[30, 45, 60, 90].map(d => (
                                <TouchableOpacity accessibilityRole="button"
                                    key={d}
                                    style={[
                                        styles.durationChip,
                                        { backgroundColor: walkDuration === d ? theme.primary : theme.surface, borderColor: theme.border }
                                    ]}
                                    onPress={() => setWalkDuration(d)}
                                >
                                    <Text style={{ color: walkDuration === d ? '#fff' : theme.text, fontWeight: '700', fontSize: font.base }}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Notas (opcional)</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={walkNotes}
                            onChangeText={setWalkNotes}
                            placeholder="Instrucciones especiales..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity accessibilityRole="button" style={[styles.modalCancelBtn, { backgroundColor: theme.surface }]} onPress={() => setWalkModalVisible(false)}>
                                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button"
                                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSubmitWalkRequest}
                                disabled={isRequestingWalk}
                            >
                                {isRequestingWalk ? <ActivityIndicator color="#fff" size="small" /> : (
                                    <Text style={styles.modalSubmitText}>Enviar Solicitud</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </ScreenContainer>
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
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
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
        marginHorizontal: layout.screenPadding,
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
        marginHorizontal: layout.screenPadding,
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
    servicesGrid: {
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
    serviceName: {
        flex: 1,
        fontSize: font.lg,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    locationText: {
        fontSize: font.lg,
        flex: 1,
    },
    radiusText: {
        fontSize: font.base,
        fontStyle: 'italic',
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
        paddingHorizontal: layout.screenPadding,
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    scrollContainer: {
        flex: 1,
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: spacing.xxl, paddingBottom: spacing.huge, maxHeight: '80%' },
    modalTitle: { fontSize: font.h2, fontWeight: '800', marginBottom: spacing.xl },
    modalLabel: { fontSize: font.md, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm },
    petChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: 12, marginRight: spacing.md, borderWidth: 1 },
    petChipText: { fontSize: font.base, fontWeight: '700' },
    noPetsText: { fontSize: font.base, paddingVertical: spacing.sm },
    durationRow: { flexDirection: 'row', gap: spacing.md },
    durationChip: { flex: 1, paddingVertical: spacing.md, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
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
