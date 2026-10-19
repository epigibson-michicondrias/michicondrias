import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { usePlaceDetail } from '@/src/hooks/petfriendly/usePlaceDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import BackButton from '@/src/components/BackButton';
import { showAlert } from '@/src/components/AppAlert';
import { MapPin, Phone, Globe, Star, Check, Bone, Info, Share2 } from 'lucide-react-native';
import { shareContent } from '@/src/utils/share';
import { font, spacing } from '@/constants/design';

const { width } = Dimensions.get('window');

export default function PetfriendlyDetalleScreen() {
    const { theme } = useTheme();
    const { 
        place, 
        isLoading, 
        openMap, 
        callPlace, 
        openWebsite, 
        goBack,
        reviews,
        reviewsLoading,
        isCreatingReview,
        handleCreateReview,
        isOwner,
        handleDelete,
        isDeleting,
    } = usePlaceDetail();

    const [formRating, setFormRating] = React.useState(5);
    const [formComment, setFormComment] = React.useState('');

    if (!isLoading && !place) {
        return (
            <ScreenContainer>
                <View style={styles.center}>
                    <Text style={{ color: theme.text, fontWeight: '700', marginBottom: spacing.sm }}>No pudimos cargar el lugar</Text>
                    <Text style={{ color: theme.textMuted, marginBottom: spacing.lg, textAlign: 'center' }}>Puede que ya no exista o que no tengas conexión.</Text>
                    <TouchableOpacity onPress={goBack} accessibilityRole="button" style={{ backgroundColor: theme.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    if (isLoading || !place) {
        return (
            <ScreenContainer>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer noPadding>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={styles.imageContainer}>
                    {place.image_url ? (
                        <Image source={{ uri: place.image_url }} style={styles.image} accessibilityLabel={`Foto de ${place.name}`} />
                    ) : (
                        <View style={[styles.image, { backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }]}>
                            <Bone size={64} color={theme.textMuted} />
                        </View>
                    )}
                    <View style={styles.topOverlay}>
                        <BackButton onPress={goBack} color="#fff" style={styles.circleBtn} />
                        <Text style={styles.headerTitle}>Detalles del Lugar</Text>
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Compartir" style={styles.circleBtn} onPress={() => shareContent('Lugar pet friendly', `${place.name} es pet friendly. Míralo en Michicondrias 🐾`)}>
                            <Share2 size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.placeHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.placeName, { color: theme.text }]}>{place.name}</Text>
                            <Text style={[styles.category, { color: theme.primary }]}>{place.category}</Text>
                        </View>
                        <View style={[styles.ratingCard, { backgroundColor: theme.surface }]}>
                            <Star size={20} color={theme.warning} fill={theme.warning} />
                            <Text style={[styles.ratingValue, { color: theme.text }]}>{place.rating ? place.rating.toFixed(1) : 'Nuevo'}</Text>
                        </View>
                    </View>

                    <View style={styles.actionGrid}>
                        <ActionBtn icon={<Phone size={20} color={theme.primary} />} label="Llamar" onPress={callPlace} theme={theme} disabled={!place.phone} />
                        <ActionBtn icon={<MapPin size={20} color={theme.primary} />} label="Mapa" onPress={openMap} theme={theme} />
                        <ActionBtn icon={<Globe size={20} color={theme.primary} />} label="Web" onPress={openWebsite} theme={theme} disabled={!place.website} />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Info size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Información</Text>
                        </View>
                        <Text style={[styles.description, { color: theme.textMuted }]}>
                            {place.description?.trim() || 'Este lugar aún no tiene descripción.'}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Bone size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios para Michis</Text>
                        </View>
                        <View style={styles.servicesGrid}>
                            <ServiceItem label="Agua disponible" active={isYes(place.has_water_bowls)} theme={theme} />
                            <ServiceItem label="Menú para mascotas" active={isYes(place.has_pet_menu)} theme={theme} />
                            <ServiceItem label={`Tamaño: ${place.pet_sizes_allowed || 'Todos'}`} active theme={theme} />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={[styles.addressCard, { backgroundColor: theme.surface }]}>
                            <MapPin size={20} color={theme.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.addressTitle, { color: theme.text }]}>Ubicación</Text>
                                <Text style={[styles.addressText, { color: theme.textMuted }]}>{[place.address, place.city].filter(Boolean).join(', ') || 'Sin dirección'}</Text>
                            </View>
                        </View>
                    </View>

                    {isOwner && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Eliminar este lugar"
                            disabled={isDeleting}
                            onPress={handleDelete}
                            style={{ alignSelf: 'flex-start', paddingVertical: spacing.sm, marginBottom: spacing.md }}
                        >
                            <Text style={{ color: theme.error, fontWeight: '800' }}>Eliminar este lugar</Text>
                        </TouchableOpacity>
                    )}

                    {/* Puntos Michi (Reseñas) */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Star size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Puntos Michi (Reseñas)</Text>
                        </View>

                        {/* Rating Summary Card */}
                        <View style={[styles.ratingSummaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.summaryLeft}>
                                <Text style={[styles.bigRating, { color: theme.text }]}>
                                    {place.rating ? place.rating.toFixed(1) : '—'}
                                </Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            color={theme.warning}
                                            fill={star <= Math.round(place.rating || 0) ? theme.warning : 'transparent'}
                                        />
                                    ))}
                                </View>
                                <Text style={[styles.totalReviewsText, { color: theme.textMuted }]}>
                                    {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                                </Text>
                            </View>
                            <View style={[styles.summarySeparator, { backgroundColor: theme.border }]} />
                            <View style={styles.summaryRight}>
                                <Text style={[styles.summaryDescription, { color: theme.text }]}>
                                    Opiniones y valoraciones de la comunidad sobre la hospitalidad pet-friendly en este establecimiento.
                                </Text>
                            </View>
                        </View>

                        {/* Write a Review Card */}
                        <View style={[styles.writeReviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Text style={[styles.writeReviewTitle, { color: theme.text }]}>Escribe tu Opinión</Text>
                            <Text style={[styles.writeReviewSubtitle, { color: theme.textMuted }]}>¿Qué te pareció el lugar y su trato con las mascotas?</Text>
                            
                            <View style={styles.interactiveStars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Calificar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
                                        key={star}
                                        onPress={() => setFormRating(star)}
                                        style={styles.starTouch}
                                    >
                                        <Star
                                            size={28}
                                            color={theme.warning}
                                            fill={star <= formRating ? theme.warning : 'transparent'}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={[styles.commentInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                value={formComment}
                                onChangeText={setFormComment}
                                placeholder="Escribe tu reseña aquí (mínimo 5 caracteres)..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                numberOfLines={3}
                            />

                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Publicar reseña"
                                style={[styles.submitReviewBtn, { backgroundColor: theme.primary }]}
                                onPress={async () => {
                                    if (formComment.trim().length < 5) {
                                        showAlert({ type: 'error', title: 'Comentario corto', message: 'Por favor escribe un comentario de al menos 5 caracteres.' });
                                        return;
                                    }
                                    await handleCreateReview(formRating, formComment);
                                    setFormComment('');
                                    setFormRating(5);
                                }}
                                disabled={isCreatingReview}
                            >
                                {isCreatingReview ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitReviewBtnText}>Publicar Reseña</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Reviews List */}
                        <View style={styles.reviewsList}>
                            {reviewsLoading ? (
                                <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: spacing.xl }} />
                            ) : reviews.length === 0 ? (
                                <Text style={[styles.emptyReviewsText, { color: theme.textMuted }]}>
                                    Aún no hay opiniones. ¡Sé el primero en dejar una reseña!
                                </Text>
                            ) : (
                                reviews.map((rev) => (
                                    <View key={rev.id} style={[styles.reviewItemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                        <View style={styles.reviewItemHeader}>
                                            <View style={[styles.reviewAvatar, { backgroundColor: theme.primary + '20' }]}>
                                                <Text style={[styles.reviewAvatarText, { color: theme.primary }]}>
                                                    V
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.reviewUserName, { color: theme.text }]}>
                                                    Visitante
                                                </Text>
                                                <View style={styles.reviewStarsRow}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={12}
                                                            color={theme.warning}
                                                            fill={star <= rev.rating ? theme.warning : 'transparent'}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                            <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                                                {new Date(rev.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </Text>
                                        </View>
                                        {rev.comment ? (
                                            <Text style={[styles.reviewCommentText, { color: theme.text, marginTop: spacing.xs }]}>
                                                {rev.comment}
                                            </Text>
                                        ) : null}
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const isYes = (v?: string | null) => ['si', 'sí', 'yes', 'true'].includes((v || '').trim().toLowerCase());

function HourRow({ day, hours, theme, isLast }: any) {
    return (
        <View style={[styles.hourRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <Text style={[styles.hourDay, { color: theme.text }]}>{day}</Text>
            <Text style={[styles.hourVal, { color: theme.textMuted }]}>{hours}</Text>
        </View>
    );
}

function ActionBtn({ icon, label, onPress, theme, disabled }: { icon: any, label: string, onPress: any, theme: any, disabled?: boolean }) {
    return (
        <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.surface, opacity: disabled ? 0.4 : 1 }]}
            onPress={onPress}
            disabled={disabled}
        >
            {icon}
            <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );
}

function ServiceItem({ label, active, theme }: { label: string, active: boolean, theme: any }) {
    return (
        <View style={[styles.serviceItem, { backgroundColor: active ? theme.primary + '15' : theme.surface }]}>
            <Check size={16} color={active ? theme.primary : theme.textMuted} />
            <Text style={[styles.serviceText, { color: active ? theme.text : theme.textMuted }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        paddingBottom: spacing.huge,
    },
    imageContainer: {
        height: 320,
        width: width,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    topOverlay: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: font.xxl,
        fontWeight: '900',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    circleBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        marginTop: -30,
        backgroundColor: 'transparent',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: spacing.xxl,
        gap: spacing.xxxl,
    },
    placeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.lg,
    },
    placeName: {
        fontSize: font.h1,
        fontWeight: '900',
        marginBottom: spacing.xs,
    },
    category: {
        fontSize: font.base,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    ratingCard: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 20,
        alignItems: 'center',
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    ratingValue: {
        fontSize: font.xl,
        fontWeight: '900',
    },
    actionGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: spacing.lg,
        borderRadius: 20,
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    actionLabel: {
        fontSize: font.md,
        fontWeight: '700',
    },
    section: {
        gap: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sectionTitle: {
        fontSize: font.xxl,
        fontWeight: '900',
    },
    description: {
        fontSize: font.lg,
        lineHeight: 24,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 16,
    },
    serviceText: {
        fontSize: font.base,
        fontWeight: '700',
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    addressTitle: {
        fontSize: font.base,
        fontWeight: '800',
        marginBottom: spacing.xxs,
    },
    addressText: {
        fontSize: font.base,
        lineHeight: 18,
    },
    hoursCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.2)',
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.lg,
    },
    hourDay: {
        fontSize: font.base,
        fontWeight: '700',
    },
    hourVal: {
        fontSize: font.base,
    },
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
        fontWeight: '900',
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
