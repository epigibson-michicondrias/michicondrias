import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator, Dimensions, Linking, TextInput } from 'react-native';
import { usePlaceDetail } from '@/src/hooks/petfriendly/usePlaceDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import BackButton from '@/src/components/BackButton';
import { showAlert } from '@/src/components/AppAlert';
import { MapPin, Phone, Globe, Star, Check, Bone, Info, Share2, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PetfriendlyDetalleScreen() {
    const { theme, isDark } = useTheme();
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
        handleCreateReview
    } = usePlaceDetail();

    const [formRating, setFormRating] = React.useState(5);
    const [formComment, setFormComment] = React.useState('');

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
                    <Image
                        source={{ uri: place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800' }}
                        style={styles.image}
                    />
                    <View style={styles.topOverlay}>
                        <BackButton onPress={goBack} color="#fff" style={styles.circleBtn} />
                        <Text style={styles.headerTitle}>Detalles del Lugar</Text>
                        <TouchableOpacity style={styles.circleBtn}>
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
                            <Star size={20} color="#facc15" fill="#facc15" />
                            <Text style={[styles.ratingValue, { color: theme.text }]}>{place.rating?.toFixed(1) || '4.8'}</Text>
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
                            {place.description || "Un lugar increíble para disfrutar con tu mejor amigo. Cuentan con áreas designadas y un ambiente totalmente acogedor para mascotas."}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Bone size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios para Michis</Text>
                        </View>
                        <View style={styles.servicesGrid}>
                            <ServiceItem label="Agua disponible" active={place.has_water_bowls === 'yes'} theme={theme} />
                            <ServiceItem label="Menú para mascotas" active={place.has_pet_menu === 'yes'} theme={theme} />
                            <ServiceItem label={`Tamaño: ${place.pet_sizes_allowed || 'Todos'}`} active theme={theme} />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Clock size={18} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horarios de Atención</Text>
                        </View>
                        <View style={[styles.hoursCard, { backgroundColor: theme.surface }]}>
                            <HourRow day="Lunes - Viernes" hours="09:00 - 22:00" theme={theme} />
                            <HourRow day="Sábado" hours="10:00 - 23:00" theme={theme} />
                            <HourRow day="Domingo" hours="10:00 - 20:00" theme={theme} isLast />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={[styles.addressCard, { backgroundColor: theme.surface }]}>
                            <MapPin size={20} color={theme.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.addressTitle, { color: theme.text }]}>Ubicación</Text>
                                <Text style={[styles.addressText, { color: theme.textMuted }]}>{place.address}, {place.city}</Text>
                            </View>
                        </View>
                    </View>

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
                                    {place.rating ? place.rating.toFixed(1) : '0.0'}
                                </Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={14}
                                            color="#facc15"
                                            fill={star <= Math.round(place.rating || 0) ? '#facc15' : 'transparent'}
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
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => setFormRating(star)}
                                        style={styles.starTouch}
                                    >
                                        <Star
                                            size={28}
                                            color="#facc15"
                                            fill={star <= formRating ? '#facc15' : 'transparent'}
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
                                <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
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
                                                    {rev.user_id.substring(0, 2).toUpperCase()}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.reviewUserName, { color: theme.text }]}>
                                                    Usuario ({rev.user_id.substring(0, 6)})
                                                </Text>
                                                <View style={styles.reviewStarsRow}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={12}
                                                            color="#facc15"
                                                            fill={star <= rev.rating ? '#facc15' : 'transparent'}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                            <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                                                {new Date(rev.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {rev.comment ? (
                                            <Text style={[styles.reviewCommentText, { color: theme.text, marginTop: 4 }]}>
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
        paddingBottom: 40,
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
        fontSize: 18,
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
        padding: 24,
        gap: 32,
    },
    placeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    placeName: {
        fontSize: 26,
        fontWeight: '900',
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    ratingCard: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 20,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    ratingValue: {
        fontSize: 16,
        fontWeight: '900',
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    section: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
    },
    serviceText: {
        fontSize: 13,
        fontWeight: '700',
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    addressTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 2,
    },
    addressText: {
        fontSize: 13,
        lineHeight: 18,
    },
    hoursCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    hourRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 14,
    },
    hourDay: {
        fontSize: 13,
        fontWeight: '700',
    },
    hourVal: {
        fontSize: 13,
    },
    ratingSummaryCard: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 20,
        alignItems: 'center',
    },
    summaryLeft: {
        alignItems: 'center',
        paddingRight: 20,
    },
    bigRating: {
        fontSize: 32,
        fontWeight: '900',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
        marginVertical: 6,
    },
    totalReviewsText: {
        fontSize: 11,
        fontWeight: '700',
    },
    summarySeparator: {
        width: 1,
        height: '80%',
    },
    summaryRight: {
        flex: 1,
        paddingLeft: 20,
    },
    summaryDescription: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '600',
    },
    writeReviewCard: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 24,
    },
    writeReviewTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    writeReviewSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 16,
    },
    interactiveStars: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
        marginBottom: 20,
    },
    starTouch: {
        padding: 4,
    },
    commentInput: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 12,
        fontSize: 14,
        height: 80,
        textAlignVertical: 'top',
        marginBottom: 16,
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
        fontSize: 14,
        fontWeight: '800',
    },
    reviewsList: {
        gap: 12,
        marginBottom: 12,
    },
    emptyReviewsText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 20,
        fontStyle: 'italic',
    },
    reviewItemCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    reviewItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewAvatarText: {
        fontSize: 14,
        fontWeight: '800',
    },
    reviewUserName: {
        fontSize: 14,
        fontWeight: '800',
    },
    reviewStarsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 2,
    },
    reviewDate: {
        fontSize: 11,
        fontWeight: '700',
    },
    reviewCommentText: {
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '600',
    },
});
