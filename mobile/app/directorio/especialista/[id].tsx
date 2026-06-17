import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Linking, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useVetDetail } from '@/src/hooks/directorio/useVetDetail';
import { useVetReviews } from '@/src/hooks/directorio/useVetReviews';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import BackButton from '@/src/components/BackButton';
import { Phone, Mail, Award, ShieldCheck, Calendar, Briefcase, Info, MapPin, Star } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

const { width } = Dimensions.get('window');

export default function SpecialistDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { specialist, isLoading, clinic, services } = useVetDetail();

    if (isLoading) {
        return (
            <ScreenContainer style={styles.center}>
                <Text style={{ color: theme.textMuted }}>Cargando especialista...</Text>
            </ScreenContainer>
        );
    }

    if (!specialist) {
        return (
            <ScreenContainer style={styles.center}>
                <Text style={{ color: theme.text }}>Especialista no encontrado</Text>
            </ScreenContainer>
        );
    }

    const { rating, reviews, handleCreateReview, isCreatingReview } = useVetReviews(specialist.id);
    const [formRating, setFormRating] = React.useState(5);
    const [formComment, setFormComment] = React.useState('');

    const handleBookConsultation = (serviceId?: string) => {
        if (specialist.clinic_id) {
            router.push({
                pathname: `/directorio/citas/agendar/${specialist.clinic_id}`,
                params: { 
                    clinic_id: specialist.clinic_id,
                    vet_id: specialist.id,
                    service_id: serviceId || undefined,
                }
            } as any);
        } else {
            showAlert({ 
                type: 'error', 
                title: 'Clínica no asignada', 
                message: 'Este especialista no tiene una clínica asignada actualmente.' 
            });
        }
    };

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.header, { backgroundColor: theme.secondary + '15' }]}>
                    <BackButton onPress={() => router.back()} color={theme.text} style={styles.backBtn} />

                    <View style={styles.profileSection}>
                        <View style={[styles.avatarContainer, { borderColor: theme.secondary }]}>
                            {specialist.photo_url ? (
                                <Image source={{ uri: specialist.photo_url }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={[styles.avatarInitial, { color: theme.secondary }]}>
                                        {specialist.first_name.charAt(0)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.name, { color: theme.text }]}>
                            {specialist.first_name} {specialist.last_name}
                        </Text>
                        <Text style={[styles.specialty, { color: theme.secondary }]}>
                            {specialist.specialty || 'Médico Veterinario'}
                        </Text>

                        <View style={styles.headerRatingRow}>
                            <Star size={16} color="#facc15" fill="#facc15" />
                            <Text style={[styles.headerRatingText, { color: theme.text }]}>
                                {rating?.average_rating?.toFixed(1) || '5.0'}
                            </Text>
                            <Text style={[styles.headerReviewsText, { color: theme.textMuted }]}>
                                ({rating?.total_reviews || 0})
                            </Text>
                        </View>

                        <View style={styles.verifiedBadge}>
                            <ShieldCheck size={14} color="#10b981" />
                            <Text style={styles.verifiedText}>
                                Cédula: {specialist.license_number || 'Verificada'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <Award size={20} color={theme.primary} />
                            <Text style={[styles.statValue, { color: theme.text }]}>Exp.</Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Verificada</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                            onPress={() => {
                                if (specialist.clinic_id) {
                                    router.push(`/directorio/clinica/${specialist.clinic_id}` as any);
                                }
                            }}
                            disabled={!specialist.clinic_id}
                        >
                            <Briefcase size={20} color={theme.primary} />
                            <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
                                {clinic?.name || 'Clínica'}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                                {specialist.clinic_id ? 'Ver Perfil' : 'No Asignada'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Biografía Profesional</Text>
                        <Text style={[styles.bio, { color: theme.textMuted }]}>
                            {specialist.bio || 'El Dr. es un especialista dedicado a la salud animal con años de experiencia en medicina veterinaria y cirugía.'}
                        </Text>
                    </View>

                    {clinic && (
                        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>Clínica de Práctica</Text>
                            <TouchableOpacity 
                                style={styles.clinicLocationRow}
                                onPress={() => router.push(`/directorio/clinica/${clinic.id}` as any)}
                            >
                                <View style={[styles.clinicLocationIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <MapPin size={20} color={theme.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.clinicPracticeName, { color: theme.text }]}>{clinic.name}</Text>
                                    <Text style={[styles.clinicPracticeAddress, { color: theme.textMuted }]}>
                                        {clinic.address ? `${clinic.address}, ` : ''}{clinic.city || ''}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {specialist.clinic_id && (
                        <View style={styles.servicesSection}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Servicios Disponibles</Text>
                            {services.length === 0 ? (
                                <Text style={{ color: theme.textMuted, marginLeft: 8 }}>
                                    No hay servicios listados actualmente en su clínica.
                                </Text>
                            ) : (
                                services.map((service) => (
                                    <TouchableOpacity
                                        key={service.id}
                                        style={[styles.serviceItem, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                                        onPress={() => handleBookConsultation(service.id)}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                                            <Text style={[styles.serviceDuration, { color: theme.textMuted }]}>
                                                {service.duration_minutes} min
                                            </Text>
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
                        </View>
                    )}

                    <View style={styles.contactSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contacto</Text>
                        <View style={styles.contactList}>
                            {specialist.phone && (
                                <TouchableOpacity 
                                    style={[styles.contactItem, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                                    onPress={() => {
                                        Linking.openURL(`tel:${specialist.phone}`).catch(() => {
                                            showAlert({
                                                type: 'error',
                                                title: 'Error',
                                                message: 'No se pudo abrir la aplicación de teléfono.'
                                            });
                                        });
                                    }}
                                >
                                    <View style={[styles.contactIcon, { backgroundColor: theme.primary + '15' }]}>
                                        <Phone size={20} color={theme.primary} />
                                    </View>
                                    <View>
                                        <Text style={[styles.contactLabel, { color: theme.textMuted }]}>Teléfono</Text>
                                        <Text style={[styles.contactValue, { color: theme.text }]}>{specialist.phone}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity 
                                style={[styles.contactItem, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                                onPress={() => {
                                    if (specialist.email) {
                                        Linking.openURL(`mailto:${specialist.email}`).catch(() => {
                                            showAlert({
                                                type: 'error',
                                                title: 'Error',
                                                message: 'No se pudo abrir la aplicación de correo.'
                                            });
                                        });
                                    } else {
                                        showAlert({
                                            type: 'info',
                                            title: 'Correo no disponible',
                                            message: 'Este especialista no tiene un correo registrado.'
                                        });
                                    }
                                }}
                            >
                                <View style={[styles.contactIcon, { backgroundColor: theme.secondary + '15' }]}>
                                    <Mail size={20} color={theme.secondary} />
                                </View>
                                <View>
                                    <Text style={[styles.contactLabel, { color: theme.textMuted }]}>Correo</Text>
                                    <Text style={[styles.contactValue, { color: theme.text }]}>{specialist.email || 'No disponible'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <Info size={20} color={theme.primary} />
                        <Text style={[styles.infoText, { color: theme.textMuted }]}>
                            Este profesional atiende previa cita. Los costos y disponibilidad pueden variar.
                        </Text>
                    </View>

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
                                    Calificación de la comunidad sobre la calidad del servicio y trato de este especialista.
                                </Text>
                            </View>
                        </View>

                        {/* Formulario de Calificación */}
                        <View style={[styles.writeReviewCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <Text style={[styles.writeReviewTitle, { color: theme.text }]}>Calificar a este especialista</Text>
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
                                    No hay opiniones para este especialista aún. ¡Sé el primero en dejar una!
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

            <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
                <TouchableOpacity 
                    style={[styles.bookBtn, { backgroundColor: theme.primary }]}
                    onPress={() => handleBookConsultation()}
                >
                    <Calendar size={20} color="#fff" />
                    <Text style={styles.bookBtnText}>Agendar Consulta</Text>
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        padding: 4,
        marginBottom: 16,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 56,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 56,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 48,
        fontWeight: '900',
    },
    name: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    verifiedText: {
        color: '#10b981',
        fontSize: 12,
        fontWeight: '700',
    },
    content: {
        padding: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        marginTop: -50,
    },
    statItem: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 2,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        borderWidth: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    bio: {
        fontSize: 15,
        lineHeight: 22,
    },
    clinicLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    clinicLocationIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clinicPracticeName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    clinicPracticeAddress: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
    },
    servicesSection: {
        marginBottom: 24,
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    serviceDuration: {
        fontSize: 12,
        fontWeight: '600',
    },
    serviceRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '900',
    },
    contactSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
        marginLeft: 4,
    },
    contactList: {
        gap: 12,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        gap: 16,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    bookBtn: {
        height: 64,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
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
    headerRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        marginBottom: 10,
    },
    headerRatingText: {
        fontSize: 14,
        fontWeight: '800',
    },
    headerReviewsText: {
        fontSize: 12,
        fontWeight: '600',
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
