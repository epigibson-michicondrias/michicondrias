import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { useClinicDetail } from '@/src/hooks/directorio/useClinicDetail';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import BackButton from '@/src/components/BackButton';
import { MapPin, Phone, Globe, Clock, Star, Info, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ClinicDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { clinic, isLoading, services, rating, reviews, handleCreateReview, isCreatingReview } = useClinicDetail();
    const [formRating, setFormRating] = React.useState(5);
    const [formComment, setFormComment] = React.useState('');

    if (isLoading) return <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: theme.textMuted }}>Cargando clínica...</Text></ScreenContainer>;
    if (!clinic) return <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: theme.text }}>Clínica no encontrada</Text></ScreenContainer>;

    const callClinic = () => {
        if (clinic.phone) {
            Linking.openURL(`tel:${clinic.phone}`).catch(() => {
                showAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'No se pudo abrir la aplicación de teléfono.'
                });
            });
        } else {
            showAlert({
                type: 'info',
                title: 'Teléfono no disponible',
                message: 'Esta clínica no tiene un número registrado.'
            });
        }
    };

    const openWebsite = () => {
        if (clinic.website) {
            let url = clinic.website;
            if (!/^https?:\/\//i.test(url)) {
                url = `https://${url}`;
            }
            Linking.openURL(url).catch(() => {
                showAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'No se pudo abrir el sitio web.'
                });
            });
        } else {
            showAlert({
                type: 'info',
                title: 'Sitio web no disponible',
                message: 'Esta clínica no tiene un sitio web registrado.'
            });
        }
    };

    const openMap = () => {
        const addressPart = [clinic.address, clinic.city, clinic.state].filter(Boolean).join(', ');
        if (addressPart) {
            const query = encodeURIComponent(addressPart);
            const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
            Linking.openURL(url).catch(() => {
                showAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'No se pudo abrir la aplicación de mapas.'
                });
            });
        } else {
            showAlert({
                type: 'info',
                title: 'Dirección no disponible',
                message: 'Esta clínica no tiene una dirección registrada.'
            });
        }
    };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image
                        source={{ uri: clinic.logo_url || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000' }}
                        style={styles.coverImage}
                    />
                    <BackButton onPress={() => router.back()} color="#fff" style={styles.backBtn} />
                </View>

                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.mainInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.text }]}>{clinic.name}</Text>
                            <View style={styles.locationContainer}>
                                <MapPin size={14} color={theme.textMuted} />
                                <Text style={[styles.location, { color: theme.textMuted }]}>{clinic.address}, {clinic.city}</Text>
                            </View>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Star size={16} color="#facc15" fill="#facc15" />
                            <Text style={styles.ratingText}>{rating?.average_rating?.toFixed(1) || '5.0'}</Text>
                        </View>
                    </View>

                    <View style={styles.quickActions}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                            onPress={callClinic}
                        >
                            <Phone size={20} color={theme.primary} />
                            <Text style={[styles.actionLabel, { color: theme.text }]}>Llamar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                            onPress={openWebsite}
                        >
                            <Globe size={20} color={theme.primary} />
                            <Text style={[styles.actionLabel, { color: theme.text }]}>Sitio Web</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: theme.surface }]}
                            onPress={openMap}
                        >
                            <MapPin size={20} color={theme.primary} />
                            <Text style={[styles.actionLabel, { color: theme.text }]}>Cómo llegar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Información</Text>
                        <Text style={[styles.description, { color: theme.textMuted }]}>{clinic.description || 'Sin descripción disponible.'}</Text>

                        <View style={styles.features}>
                            {clinic.is_24_hours && (
                                <View style={styles.featureItem}>
                                    <Clock size={16} color="#60a5fa" />
                                    <Text style={[styles.featureText, { color: '#60a5fa' }]}>Abierto 24 Horas</Text>
                                </View>
                            )}
                            {clinic.has_emergency && (
                                <View style={styles.featureItem}>
                                    <Info size={16} color="#f87171" />
                                    <Text style={[styles.featureText, { color: '#f87171' }]}>Servicio de Emergencias</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Disponibles</Text>
                    </View>

                    {services.length === 0 ? (
                        <Text style={{ color: theme.textMuted, marginLeft: 8 }}>No hay servicios listados actualmente.</Text>
                    ) : (
                        services.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={[styles.serviceItem, { backgroundColor: theme.surface }]}
                                onPress={() => showAlert({ type: 'info', title: 'Agendar', message: `¿Deseas agendar ${service.name}?` })}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                                    <Text style={[styles.serviceDuration, { color: theme.textMuted }]}>{service.duration_minutes} min</Text>
                                </View>
                                <View style={styles.serviceRight}>
                                    <Text style={[styles.servicePrice, { color: theme.primary }]}>
                                        {service.price ? `$${service.price}` : 'Consultar'}
                                    </Text>
                                    <Calendar size={18} color={theme.primary} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    {/* Sección de Reseñas y Calificaciones */}
                    <View style={styles.reviewsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 12 }]}>Reseñas y Opiniones</Text>
                        
                        {/* Resumen de Calificación */}
                        <View style={[styles.ratingSummaryCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <View style={styles.summaryLeft}>
                                <Text style={[styles.bigRating, { color: theme.text }]}>
                                    {rating?.average_rating?.toFixed(1) || '5.0'}
                                </Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((s) => {
                                        const isFilled = s <= Math.round(rating?.average_rating || 5);
                                        return <Star key={s} size={16} color="#facc15" fill={isFilled ? "#facc15" : "transparent"} />;
                                    })}
                                </View>
                                <Text style={[styles.totalReviewsText, { color: theme.textMuted }]}>
                                    {rating?.total_reviews || 0} {rating?.total_reviews === 1 ? 'opinión' : 'opiniones'}
                                </Text>
                            </View>
                            <View style={[styles.summarySeparator, { backgroundColor: theme.borderLight }]} />
                            <View style={styles.summaryRight}>
                                <Text style={[styles.summaryDescription, { color: theme.textMuted }]}>
                                    Calificación de la comunidad sobre la calidad de atención y servicios de esta clínica.
                                </Text>
                            </View>
                        </View>

                        {/* Formulario de Calificación */}
                        <View style={[styles.writeReviewCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <Text style={[styles.writeReviewTitle, { color: theme.text }]}>Calificar esta clínica</Text>
                            <Text style={[styles.writeReviewSubtitle, { color: theme.textMuted }]}>Toca las estrellas para seleccionar tu calificación</Text>
                            
                            <View style={styles.interactiveStars}>
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                    <TouchableOpacity 
                                        key={starVal} 
                                        onPress={() => setFormRating(starVal)}
                                        style={styles.starTouch}
                                    >
                                        <Star 
                                            size={32} 
                                            color="#facc15" 
                                            fill={starVal <= formRating ? "#facc15" : "transparent"} 
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={[styles.commentInput, { 
                                    backgroundColor: theme.background, 
                                    borderColor: theme.borderLight, 
                                    color: theme.text 
                                }]}
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
                                    handleCreateReview(formRating, formComment.trim() || undefined);
                                    setFormComment('');
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

                        {/* Listado de Opiniones */}
                        <View style={styles.reviewsList}>
                            {reviews.length === 0 ? (
                                <Text style={[styles.emptyReviewsText, { color: theme.textMuted }]}>
                                    No hay opiniones para esta clínica aún. ¡Sé el primero en dejar una!
                                </Text>
                            ) : (
                                reviews.map((review) => (
                                    <View 
                                        key={review.id} 
                                        style={[styles.reviewItemCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                                    >
                                        <View style={styles.reviewItemHeader}>
                                            <View style={[styles.reviewAvatar, { backgroundColor: theme.primary + '15' }]}>
                                                <Text style={[styles.reviewAvatarText, { color: theme.primary }]}>U</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.reviewUserName, { color: theme.text }]}>Usuario</Text>
                                                <View style={styles.reviewStarsRow}>
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star 
                                                            key={s} 
                                                            size={12} 
                                                            color="#facc15" 
                                                            fill={s <= review.rating ? "#facc15" : "transparent"} 
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                            <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                                                {review.created_at ? new Date(review.created_at).toLocaleDateString('es-MX', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                }) : ''}
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
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.bookBtn, { backgroundColor: theme.primary }]}>
                    <Text style={styles.bookBtnText}>Agendar Cita General</Text>
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 300,
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
        marginTop: -30,
        backgroundColor: 'transparent',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    mainInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    location: {
        fontSize: 14,
        fontWeight: '600',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#facc1520',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
    },
    ratingText: {
        color: '#facc15',
        fontWeight: '800',
        fontSize: 16,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
        padding: 16,
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
    infoCard: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    features: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ffffff05',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '700',
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
    },
    serviceDuration: {
        fontSize: 12,
        marginTop: 2,
    },
    serviceRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '800',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    bookBtn: {
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    bookBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    reviewsSection: {
        marginTop: 24,
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
