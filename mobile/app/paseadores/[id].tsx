import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useWalkerDetail } from '@/src/hooks/paseadores';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { 
    MapPin, Star, Clock, Users, MessageCircle, Calendar, 
    Shield, Heart, Share2, Dog, Cat, CheckCircle 
} from 'lucide-react-native';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { showAlert } from '@/src/components/AppAlert';

export default function WalkerDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        walker,
        isLoading,
        error,
        isFavorite,
        toggleFavorite,
        handleContact,
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
    const { contact } = useLocalSearchParams<{ contact?: string }>();
    const [contactModalVisible, setContactModalVisible] = React.useState(contact === 'true');
    const [contactMessage, setContactMessage] = React.useState('');

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

    return (
        <ScreenContainer style={{ backgroundColor: theme.background }}>
            <ScreenHeader
                title="Perfil del Paseador"
                rightElement={
                    <TouchableOpacity onPress={toggleFavorite}>
                        <Heart size={24} color={isFavorite ? '#ef4444' : theme.textMuted} fill={isFavorite ? '#ef4444' : 'none'} />
                    </TouchableOpacity>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '20' }]}>
                        {walker.photo_url ? (
                            <Image source={{ uri: walker.photo_url }} style={styles.avatar} />
                        ) : (
                            <Text style={[styles.avatarText, { color: theme.primary }]}>
                                {walker.display_name.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                    
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: theme.text }]}>{walker.display_name}</Text>
                        <View style={styles.ratingRow}>
                            <Star size={16} color="#fbbf24" fill="#fbbf24" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>
                                {walker.rating ? walker.rating.toFixed(1) : '5.0'} ({walker.total_walks} paseos)
                            </Text>
                        </View>
                        
                        {walker.is_verified && (
                            <View style={styles.verifiedBadge}>
                                <Shield size={14} color="#10b981" />
                                <Text style={styles.verifiedText}>Verificado</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.shareButton}>
                        <Share2 size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
                    <View style={styles.statItem}>
                        <Users size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{walker.total_walks}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Paseos</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Clock size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{walker.experience_years || 1}+</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Años</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Dog size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{walker.max_pets_per_walk}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Mascotas</Text>
                    </View>
                </View>

                {/* Bio */}
                {walker.bio && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre mí</Text>
                        <Text style={[styles.bioText, { color: theme.textMuted }]}>{walker.bio}</Text>
                    </View>
                )}

                {/* Services */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios</Text>
                    <View style={styles.servicesGrid}>
                        <View style={[styles.serviceCard, { backgroundColor: walker.accepts_dogs ? theme.primary + '10' : theme.surface }]}>
                            <Dog size={24} color={walker.accepts_dogs ? theme.primary : theme.textMuted} />
                            <Text style={[styles.serviceName, { color: walker.accepts_dogs ? theme.primary : theme.textMuted }]}>
                                Paseo de Perros
                            </Text>
                            <CheckCircle size={16} color={walker.accepts_dogs ? '#10b981' : theme.textMuted} />
                        </View>
                        <View style={[styles.serviceCard, { backgroundColor: walker.accepts_cats ? theme.primary + '10' : theme.surface }]}>
                            <Cat size={24} color={walker.accepts_cats ? theme.primary : theme.textMuted} />
                            <Text style={[styles.serviceName, { color: walker.accepts_cats ? theme.primary : theme.textMuted }]}>
                                Paseo de Gatos
                            </Text>
                            <CheckCircle size={16} color={walker.accepts_cats ? '#10b981' : theme.textMuted} />
                        </View>
                    </View>
                </View>

                {/* Location */}
                {walker.location && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ubicación</Text>
                        <View style={styles.locationRow}>
                            <MapPin size={20} color={theme.primary} />
                            <Text style={[styles.locationText, { color: theme.textMuted }]}>
                                {walker.location}
                            </Text>
                        </View>
                        {walker.service_radius_km && (
                            <Text style={[styles.radiusText, { color: theme.textMuted }]}>
                                Radio de servicio: {walker.service_radius_km} km
                            </Text>
                        )}
                    </View>
                )}

                {/* Pricing */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Tarifas</Text>
                    <View style={styles.pricingCard}>
                        <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Paseo por hora</Text>
                        <Text style={[styles.priceAmount, { color: theme.primary }]}>
                            ${walker.price_per_hour || 20}
                        </Text>
                    </View>
                    {walker.price_per_walk && (
                        <View style={styles.pricingCard}>
                            <Text style={[styles.priceLabel, { color: theme.textMuted }]}>Paseo individual</Text>
                            <Text style={[styles.priceAmount, { color: theme.primary }]}>
                                ${walker.price_per_walk}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Reseñas y Opiniones */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Reseñas y Opiniones</Text>

                    {/* Resumen de Calificación */}
                    <View style={[styles.ratingSummaryCard, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                        <View style={styles.summaryLeft}>
                            <Text style={[styles.bigRating, { color: theme.text }]}>
                                {walker.rating ? walker.rating.toFixed(1) : '5.0'}
                            </Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((s) => {
                                    const isFilled = s <= Math.round(walker.rating || 5);
                                    return <Star key={s} size={16} color="#fbbf24" fill={isFilled ? "#fbbf24" : "transparent"} />;
                                })}
                            </View>
                            <Text style={[styles.totalReviewsText, { color: theme.textMuted }]}>
                                {reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'}
                            </Text>
                        </View>
                        <View style={[styles.summarySeparator, { backgroundColor: theme.borderLight }]} />
                        <View style={styles.summaryRight}>
                            <Text style={[styles.summaryDescription, { color: theme.textMuted }]}>
                                Calificación de la comunidad sobre la calidad del servicio, puntualidad y trato de este paseador.
                            </Text>
                        </View>
                    </View>

                    {/* Formulario para Calificar */}
                    {unreviewedCompletedRequests.length > 0 && (
                        <View style={[styles.writeReviewCard, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                            <Text style={[styles.writeReviewTitle, { color: theme.text }]}>Calificar tu paseo reciente</Text>
                            <Text style={[styles.writeReviewSubtitle, { color: theme.textMuted }]}>
                                Selecciona estrellas y escribe tu reseña para tu paseo con {walker.display_name}.
                            </Text>

                            <View style={styles.interactiveStars}>
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                    <TouchableOpacity
                                        key={starVal}
                                        onPress={() => setFormRating(starVal)}
                                        style={styles.starTouch}
                                    >
                                        <Star
                                            size={32}
                                            color="#fbbf24"
                                            fill={starVal <= formRating ? "#fbbf24" : "transparent"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={[
                                    styles.commentInput,
                                    {
                                        backgroundColor: theme.surface,
                                        borderColor: theme.border,
                                        color: theme.text,
                                    },
                                ]}
                                placeholder="Escribe tu opinión aquí (opcional)..."
                                placeholderTextColor={theme.textMuted}
                                value={formComment}
                                onChangeText={setFormComment}
                                multiline
                                numberOfLines={3}
                            />

                            <TouchableOpacity
                                style={[styles.submitReviewBtn, { backgroundColor: theme.primary }]}
                                onPress={() => {
                                    const latestRequest = unreviewedCompletedRequests[0];
                                    handleCreateReview(latestRequest.id, {
                                        rating: formRating,
                                        comment: formComment.trim() || '',
                                    });
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
                    )}

                    {/* Nota cuando no se puede calificar */}
                    {unreviewedCompletedRequests.length === 0 && (
                        <View style={[styles.infoReviewCard, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                            <Text style={[styles.infoReviewText, { color: theme.textMuted }]}>
                                Solo puedes dejar una reseña si has completado un paseo con este paseador.
                            </Text>
                        </View>
                    )}

                    {/* Listado de Opiniones */}
                    <View style={styles.reviewsList}>
                        {reviewsLoading ? (
                            <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
                        ) : reviews.length === 0 ? (
                            <Text style={[styles.emptyReviewsText, { color: theme.textMuted }]}>
                                Este paseador aún no tiene opiniones de otros clientes.
                            </Text>
                        ) : (
                            reviews.map((review) => (
                                <View
                                    key={review.id}
                                    style={[styles.reviewItemCard, { backgroundColor: theme.background, borderColor: theme.borderLight }]}
                                >
                                    <View style={styles.reviewItemHeader}>
                                        <View style={[styles.reviewAvatar, { backgroundColor: theme.primary + '15' }]}>
                                            <Text style={[styles.reviewAvatarText, { color: theme.primary }]}>
                                                C
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.reviewUserName, { color: theme.text }]}>Cliente</Text>
                                            <View style={styles.reviewStarsRow}>
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        size={12}
                                                        color="#fbbf24"
                                                        fill={s <= review.rating ? "#fbbf24" : "transparent"}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                        <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                                            {review.created_at
                                                ? new Date(review.created_at).toLocaleDateString('es-MX', {
                                                      day: 'numeric',
                                                      month: 'short',
                                                  })
                                                : ''}
                                        </Text>
                                    </View>
                                    {review.comment && (
                                        <Text style={[styles.reviewCommentText, { color: theme.textMuted }]}>
                                            {review.comment}
                                        </Text>
                                    )}
                                </View>
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons (Sticky Footer) */}
            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.borderLight }]}>
                <TouchableOpacity
                    style={[styles.contactBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => setContactModalVisible(true)}
                >
                    <MessageCircle size={20} color={theme.primary} />
                    <Text style={[styles.contactBtnText, { color: theme.primary }]}>Enviar Mensaje</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    onPress={handleBook}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.bookButtonText}>Reservar Paseo</Text>
                </TouchableOpacity>
            </View>

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
                                    <TouchableOpacity
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

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Duración (minutos)</Text>
                        <View style={styles.durationRow}>
                            {[30, 45, 60, 90].map(d => (
                                <TouchableOpacity
                                    key={d}
                                    style={[
                                        styles.durationChip,
                                        { backgroundColor: walkDuration === d ? theme.primary : theme.surface, borderColor: theme.border }
                                    ]}
                                    onPress={() => setWalkDuration(d)}
                                >
                                    <Text style={{ color: walkDuration === d ? '#fff' : theme.text, fontWeight: '700', fontSize: 14 }}>{d}</Text>
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
                            <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: theme.surface }]} onPress={() => setWalkModalVisible(false)}>
                                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
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

            {/* Contact Modal */}
            <Modal visible={contactModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Enviar Mensaje</Text>
                        
                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Escribe tu mensaje para {walker.display_name}</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={contactMessage}
                            onChangeText={setContactMessage}
                            placeholder="Hola, me gustaría saber si tienes disponibilidad para..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalCancelBtn, { backgroundColor: theme.surface }]} 
                                onPress={() => {
                                    setContactModalVisible(false);
                                    setContactMessage('');
                                }}
                            >
                                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                                onPress={() => {
                                    if (!contactMessage.trim()) {
                                        showAlert({ type: 'error', title: 'Mensaje Vacío', message: 'Por favor escribe un mensaje antes de enviar.' });
                                        return;
                                    }
                                    setContactModalVisible(false);
                                    setContactMessage('');
                                    showAlert({ 
                                        type: 'success', 
                                        title: '¡Mensaje Enviado!', 
                                        message: `Tu mensaje ha sido enviado a ${walker.display_name}. Se pondrá en contacto contigo pronto.` 
                                    });
                                }}
                            >
                                <Text style={styles.modalSubmitText}>Enviar Mensaje</Text>
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
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 16,
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
        fontSize: 32,
        fontWeight: '800',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
    },
    verifiedText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10b981',
    },
    shareButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 4,
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
        marginBottom: 12,
    },
    bioText: {
        fontSize: 15,
        lineHeight: 22,
    },
    servicesGrid: {
        gap: 12,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        gap: 12,
    },
    serviceName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    locationText: {
        fontSize: 15,
        flex: 1,
    },
    radiusText: {
        fontSize: 13,
        fontStyle: 'italic',
    },
    pricingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    priceLabel: {
        fontSize: 15,
    },
    priceAmount: {
        fontSize: 20,
        fontWeight: '800',
    },
    actionContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 24,
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
        gap: 8,
        borderWidth: 1.5,
    },
    contactBtnText: {
        fontSize: 15,
        fontWeight: '700',
    },
    bookButton: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 18,
        gap: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        gap: 12,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '80%' },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
    modalLabel: { fontSize: 12, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    petChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1 },
    petChipText: { fontSize: 14, fontWeight: '700' },
    noPetsText: { fontSize: 14, paddingVertical: 8 },
    durationRow: { flexDirection: 'row', gap: 12 },
    durationChip: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
    modalInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, height: 80, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    modalCancelBtn: { flex: 1, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalCancelText: { fontSize: 15, fontWeight: '700' },
    modalSubmitBtn: { flex: 2, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalSubmitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
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
    infoReviewCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 20,
    },
    infoReviewText: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
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
