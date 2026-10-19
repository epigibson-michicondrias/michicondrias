/**
 * Detalle de clínica — estilo Doctoralia.
 * Hero con logo + rating + badges · acciones rápidas · servicios con precio · reseñas · CTA fijo.
 * Diferenciadores: 24h, urgencias, mapa, teléfono, web.
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Linking, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useClinicDetail } from '@/src/hooks/directorio/useClinicDetail';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import BackButton from '@/src/components/BackButton';
import { MapPin, Phone, Globe, Clock, Star, Info, Calendar, Hospital, Share2, Heart, MessageCircle, Navigation } from 'lucide-react-native';
import { ProviderSection, ProviderReviews, ProviderReviewForm, ProviderFooter, ProviderLocation } from '@/src/features/proveedor/ProviderProfile';
import { spacing, radius, type, layout, shadow } from '@/constants/design';

const { width } = Dimensions.get('window');

export default function ClinicDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { clinic, isLoading, services, rating, reviews, handleCreateReview, isCreatingReview } = useClinicDetail();
    const [isFavorite, setIsFavorite] = useState(false);

    const callClinic = () => {
        if (clinic?.phone) {
            Linking.openURL(`tel:${clinic.phone}`).catch(() => {});
        }
    };
    const openWebsite = () => {
        if (clinic?.website) {
            Linking.openURL(clinic.website).catch(() => {});
        }
    };
    const openMap = () => {
        const query = encodeURIComponent([clinic?.name, clinic?.address, clinic?.city].filter(Boolean).join(', '));
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
    };
    const openWhatsApp = () => {
        if (clinic?.phone) {
            const phone = clinic.phone.replace(/[^0-9]/g, '');
            Linking.openURL(`https://wa.me/52${phone}`).catch(() => {});
        }
    };
    const shareClinic = () => {
        const text = `${clinic?.name || 'Clínica'} — ${[clinic?.address, clinic?.city].filter(Boolean).join(', ')}`;
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({ title: clinic?.name || 'Clínica', text }).catch(() => {});
        }
    };

    if (isLoading || !clinic) {
        return (
            <ScreenContainer>
                <ScreenHeader title={isLoading ? 'Cargando...' : 'Clínica'} />
                <View style={styles.loadingBox}><ActivityIndicator size="large" color={theme.primary} /></View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: theme.primary + '08' }]}>
                <BackButton onPress={() => router.back()} style={styles.backBtn} />
                <TouchableOpacity style={styles.shareBtn} onPress={shareClinic} accessibilityRole="button" accessibilityLabel="Compartir clínica">
                    <Share2 size={20} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favBtn} onPress={() => setIsFavorite((v) => !v)} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
                    <Heart size={20} color={isFavorite ? theme.error : theme.textMuted} fill={isFavorite ? theme.error : 'transparent'} />
                </TouchableOpacity>

                <View style={[styles.heroIcon, { backgroundColor: theme.primary + '15' }]}>
                    {clinic.logo_url ? (
                        <Image source={{ uri: clinic.logo_url }} style={styles.heroLogo} />
                    ) : (
                        <Hospital size={40} color={theme.primary} />
                    )}
                </View>
                <Text style={[styles.heroName, { color: theme.text }]}>{clinic.name}</Text>
                <View style={styles.heroRating}>
                    <Star size={16} color={theme.warning} fill={theme.warning} />
                    <Text style={[styles.heroRatingText, { color: theme.text }]}>
                        {rating?.average_rating ? rating.average_rating.toFixed(1) : 'Nuevo'}
                    </Text>
                    <Text style={[styles.heroRatingCount, { color: theme.textMuted }]}>
                        ({rating?.total_reviews || 0} reseña{rating?.total_reviews === 1 ? '' : 's'})
                    </Text>
                </View>
                <View style={styles.heroLocation}>
                    <MapPin size={14} color={theme.textMuted} />
                    <Text style={[styles.heroLocationText, { color: theme.textMuted }]}>
                        {[clinic.address, clinic.city].filter(Boolean).join(', ') || 'Dirección no registrada'}
                    </Text>
                </View>

                {/* Badges */}
                <View style={styles.badgesRow}>
                    {clinic.is_24_hours && (
                        <View style={[styles.badge, { backgroundColor: theme.info + '15', borderColor: theme.info + '30' }]}>
                            <Clock size={12} color={theme.info} />
                            <Text style={[styles.badgeText, { color: theme.info }]}>24 Horas</Text>
                        </View>
                    )}
                    {clinic.has_emergency && (
                        <View style={[styles.badge, { backgroundColor: theme.error + '15', borderColor: theme.error + '30' }]}>
                            <Info size={12} color={theme.error} />
                            <Text style={[styles.badgeText, { color: theme.error }]}>Urgencias</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]} onPress={callClinic} accessibilityRole="button" accessibilityLabel="Llamar">
                    <Phone size={20} color={theme.primary} />
                    <Text style={[styles.actionLabel, { color: theme.text }]}>Llamar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]} onPress={openWhatsApp} accessibilityRole="button" accessibilityLabel="WhatsApp">
                    <MessageCircle size={20} color={theme.success} />
                    <Text style={[styles.actionLabel, { color: theme.text }]}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]} onPress={openMap} accessibilityRole="button" accessibilityLabel="Cómo llegar">
                    <Navigation size={20} color={theme.info} />
                    <Text style={[styles.actionLabel, { color: theme.text }]}>Llegar</Text>
                </TouchableOpacity>
                {clinic.website && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]} onPress={openWebsite} accessibilityRole="button" accessibilityLabel="Sitio web">
                        <Globe size={20} color={theme.accent} />
                        <Text style={[styles.actionLabel, { color: theme.text }]}>Web</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Descripción */}
                {!!clinic.description && (
                    <ProviderSection title="Sobre la clínica">
                        <Text style={[styles.description, { color: theme.textMuted }]}>{clinic.description}</Text>
                    </ProviderSection>
                )}

                {/* Servicios */}
                <ProviderSection title="Servicios Disponibles">
                    {services.length === 0 ? (
                        <Text style={{ color: theme.textMuted }}>No hay servicios listados actualmente.</Text>
                    ) : (
                        services.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={[styles.serviceItem, { backgroundColor: theme.background, borderColor: theme.borderLight }]}
                                accessibilityRole="button"
                                accessibilityLabel={`Agendar ${service.name}`}
                                onPress={() => router.push({ pathname: '/directorio/citas/agendar/[clinic_id]', params: { clinic_id: clinic.id, service_id: service.id } } as any)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
                                    <Text style={[styles.serviceDuration, { color: theme.textMuted }]}>{service.duration_minutes} min</Text>
                                </View>
                                <View style={styles.serviceRight}>
                                    <Text style={[styles.servicePrice, { color: theme.primary }]}>
                                        {service.price ? Number(service.price).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : 'Consultar'}
                                    </Text>
                                    <Calendar size={18} color={theme.primary} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ProviderSection>

                {/* Reseñas */}
                <ProviderSection title="Reseñas y Opiniones">
                    <ProviderReviews reviews={reviews.map((r: any) => ({ id: r.id, user_name: 'Usuario', rating: r.rating, comment: r.comment, created_at: r.created_at }))} />
                    <ProviderReviewForm onSubmit={(rating, comment) => { handleCreateReview(rating, comment || undefined); }} isSubmitting={isCreatingReview} />
                </ProviderSection>
            </ScrollView>

            <ProviderFooter
                label="Agendar Cita"
                onPress={() => router.push({ pathname: '/directorio/citas/agendar/[clinic_id]', params: { clinic_id: clinic.id } } as any)}
                icon={<Calendar size={20} color={theme.onPrimary} />}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    hero: { alignItems: 'center', paddingTop: spacing.xl + 40, paddingBottom: spacing.xl, paddingHorizontal: spacing.xl },
    backBtn: { position: 'absolute', top: spacing.lg, left: spacing.lg },
    shareBtn: { position: 'absolute', top: spacing.lg, right: spacing.xl + 36, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    favBtn: { position: 'absolute', top: spacing.lg, right: spacing.lg, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
    heroIcon: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
    heroLogo: { width: 80, height: 80, borderRadius: 20 },
    heroName: { fontSize: type.h1.fontSize, fontWeight: '900', textAlign: 'center', marginBottom: spacing.sm },
    heroRating: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    heroRatingText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
    heroRatingCount: { fontSize: type.caption.fontSize },
    heroLocation: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
    heroLocationText: { fontSize: type.caption.fontSize },
    badgesRow: { flexDirection: 'row', gap: spacing.sm },
    badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1 },
    badgeText: { fontSize: type.caption.fontSize, fontWeight: '700' },
    quickActions: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
    actionBtn: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', justifyContent: 'center' },
    actionLabel: { fontSize: type.caption.fontSize, fontWeight: '600' },
    scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    description: { fontSize: type.body.fontSize, lineHeight: 22 },
    serviceItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.sm },
    serviceName: { fontSize: type.subtitle.fontSize, fontWeight: '700' },
    serviceDuration: { fontSize: type.caption.fontSize, marginTop: spacing.xxs },
    serviceRight: { alignItems: 'flex-end', gap: spacing.xs },
    servicePrice: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
});
