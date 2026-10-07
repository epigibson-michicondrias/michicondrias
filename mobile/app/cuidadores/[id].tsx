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
import DatePicker from '@/src/components/DatePicker';
import { toLocalIsoDate } from '@/src/hooks/servicios-pro/requestStatus';

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
                <ScreenHeader title="Cuidador" rightElement={<View style={styles.placeholder} />} />
                <View style={styles.loadingContainer}>
                    <LoadingOverlay message="Cargando información..." />
                </View>
            </ScreenContainer>
        );
    }

    if (error || !sitter) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Cuidador" rightElement={<View style={styles.placeholder} />} />
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

                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.secondary + '20' }]}>
                        {sitter.photo_url ? (
                            <Image source={{ uri: sitter.photo_url }} style={styles.avatar} />
                        ) : (
                            <Text style={[styles.avatarText, { color: theme.secondary }]}>
                                {sitter.display_name.charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>
                    
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: theme.text }]}>{sitter.display_name}</Text>
                        <View style={styles.ratingRow}>
                            <Star size={16} color={theme.warning} fill={theme.warning} />
                            <Text style={[styles.ratingText, { color: theme.text }]}>
                                {sitter.rating ? sitter.rating.toFixed(1) : 'Nuevo'} ({sitter.total_sits} cuidados)
                            </Text>
                        </View>
                        
                        {sitter.is_verified && (
                            <View style={styles.verifiedBadge}>
                                <Shield size={14} color={theme.success} />
                                <Text style={styles.verifiedText}>Verificado</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity accessibilityRole="button" style={styles.shareButton} onPress={() => shareContent('Cuidador', `${sitter.display_name} es cuidador en Michicondrias 🐾`)}>
                        <Share2 size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
                    <View style={styles.statItem}>
                        <Home size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.total_sits}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cuidados</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.statItem}>
                        <Clock size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.experience_years ?? 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Años</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.statItem}>
                        <Users size={20} color={theme.primary} />
                        <Text style={[styles.statNumber, { color: theme.text }]}>{sitter.max_pets}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Mascotas</Text>
                    </View>
                </View>

                {/* Bio */}
                {sitter.bio && (
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre mí</Text>
                        <Text style={[styles.bioText, { color: theme.textMuted }]}>{sitter.bio}</Text>
                    </View>
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

                {/* Reseñas y Opiniones */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Reseñas y Opiniones</Text>

                    {/* Resumen de Calificación */}
                    <View style={[styles.ratingSummaryCard, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                        <View style={styles.summaryLeft}>
                            <Text style={[styles.bigRating, { color: theme.text }]}>
                                {sitter.rating ? sitter.rating.toFixed(1) : '—'}
                            </Text>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((s) => {
                                    const isFilled = s <= Math.round(sitter.rating || 0);
                                    return <Star key={s} size={16} color={theme.warning} fill={isFilled ? theme.warning : "transparent"} />;
                                })}
                            </View>
                            <Text style={[styles.totalReviewsText, { color: theme.textMuted }]}>
                                {reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'}
                            </Text>
                        </View>
                        <View style={[styles.summarySeparator, { backgroundColor: theme.borderLight }]} />
                        <View style={styles.summaryRight}>
                            <Text style={[styles.summaryDescription, { color: theme.textMuted }]}>
                                Calificación de la comunidad sobre la calidad del servicio, amabilidad y trato de este cuidador.
                            </Text>
                        </View>
                    </View>

                    {/* Formulario para Calificar */}
                    {unreviewedCompletedRequests.length > 0 && (
                        <View style={[styles.writeReviewCard, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                            <Text style={[styles.writeReviewTitle, { color: theme.text }]}>Calificar tu servicio reciente</Text>
                            <Text style={[styles.writeReviewSubtitle, { color: theme.textMuted }]}>
                                Selecciona estrellas y escribe tu reseña para tu cuidado con {sitter.display_name}.
                            </Text>

                            <View style={styles.interactiveStars}>
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                    <TouchableOpacity accessibilityRole="button"
                                        key={starVal}
                                        onPress={() => setFormRating(starVal)}
                                        style={styles.starTouch}
                                    >
                                        <Star
                                            size={32}
                                            color={theme.warning}
                                            fill={starVal <= formRating ? theme.warning : "transparent"}
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

                            <TouchableOpacity accessibilityRole="button"
                                style={[styles.submitReviewBtn, { backgroundColor: theme.primary }]}
                                onPress={() => {
                                    const latestRequest = unreviewedCompletedRequests[0];
                                    handleCreateReview(latestRequest.id, {
                                        rating: formRating,
                                        comment: formComment.trim() || '',
                                    });
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
                                Solo puedes dejar una reseña si has completado un cuidado con este cuidador.
                            </Text>
                        </View>
                    )}

                    {/* Listado de Opiniones */}
                    <View style={styles.reviewsList}>
                        {reviewsLoading ? (
                            <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
                        ) : reviews.length === 0 ? (
                            <Text style={[styles.emptyReviewsText, { color: theme.textMuted }]}>
                                Este cuidador aún no tiene opiniones de otros clientes.
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
                                                        color={theme.warning}
                                                        fill={s <= review.rating ? theme.warning : "transparent"}
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
            {!isOwnProfile && (
            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.borderLight }]}>
<TouchableOpacity accessibilityRole="button"
                    style={[styles.bookButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleBook(getServiceName(sitter.service_type))}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.bookButtonText}>Reservar Cuidado</Text>
                </TouchableOpacity>
            </View>
            )}

            {/* Sit Request Modal */}
            <Modal visible={sitModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Solicitar Cuidado</Text>
                        
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

                        {sitter.service_type === 'both' && (
                            <>
                                <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Tipo de servicio</Text>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    {([['hosting', 'Hospedaje'], ['visiting', 'Visitas']] as const).map(([val, label]) => (
                                        <TouchableOpacity
                                            key={val}
                                            style={[styles.petChip, { flex: 1, alignItems: 'center', backgroundColor: sitServiceType === val ? theme.primary : theme.surface, borderColor: theme.border }]}
                                            onPress={() => setSitServiceType(val)}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: sitServiceType === val }}
                                        >
                                            <Text style={[styles.petChipText, { color: sitServiceType === val ? '#fff' : theme.text }]}>{label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Fecha de inicio</Text>
                        <DatePicker
                            value={new Date(startDate + 'T12:00:00')}
                            onChange={(d) => {
                                const iso = toLocalIsoDate(d);
                                setStartDate(iso);
                                if (endDate < iso) setEndDate(iso);
                            }}
                            minimumDate={new Date()}
                        />

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Fecha de fin</Text>
                        <DatePicker
                            value={new Date(endDate + 'T12:00:00')}
                            onChange={(d) => setEndDate(toLocalIsoDate(d))}
                            minimumDate={new Date(startDate + 'T12:00:00')}
                        />

                        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Notas (opcional)</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            value={sitNotes}
                            onChangeText={setSitNotes}
                            placeholder="Instrucciones especiales..."
                            placeholderTextColor={theme.textMuted}
                            multiline
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity accessibilityRole="button" style={[styles.modalCancelBtn, { backgroundColor: theme.surface }]} onPress={() => setSitModalVisible(false)}>
                                <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button"
                                style={[styles.modalSubmitBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSubmitSitRequest}
                                disabled={isRequestingSit}
                            >
                                {isRequestingSit ? <ActivityIndicator color="#fff" size="small" /> : (
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
    placeholder: {
        width: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
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
        fontWeight: '800',
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
    servicesContainer: {
        gap: 12,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    serviceDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    petTypesContainer: {
        gap: 12,
    },
    petTypeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    petTypeName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    featuresGrid: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    featureText: {
        fontSize: 14,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    locationText: {
        fontSize: 15,
        flex: 1,
    },
    pricingCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
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
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    contactButtonText: {
        fontSize: 15,
        fontWeight: '600',
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '85%' },
    modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
    modalLabel: { fontSize: 12, fontWeight: '700', marginTop: 16, marginBottom: 8 },
    petChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1 },
    petChipText: { fontSize: 14, fontWeight: '700' },
    noPetsText: { fontSize: 14, paddingVertical: 8 },
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
        fontWeight: '800',
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
