/**
 * Detalle de especialista (vet) — estilo Doctoralia.
 * Hero con foto + especialidad + rating + cédula · acciones · servicios · reseñas · CTA fijo.
 * Diferenciadores: videoconsulta sin clínica, cédula profesional, clínica de práctica.
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useVetDetail } from '@/src/hooks/directorio/useVetDetail';
import { useVetReviews } from '@/src/hooks/directorio/useVetReviews';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import BackButton from '@/src/components/BackButton';
import { Phone, Mail, Award, ShieldCheck, Calendar, Briefcase, MapPin, Star, Share2, Heart, MessageCircle, Video, Navigation } from 'lucide-react-native';
import { ProviderSection, ProviderBio, ProviderReviews, ProviderReviewForm, ProviderFooter, ProviderStats } from '@/src/features/proveedor/ProviderProfile';
import { spacing, radius, type, layout, shadow } from '@/constants/design';

export default function SpecialistDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { vetId, specialist, isLoading, isError, refetch, clinic, services } = useVetDetail();
    const { rating, reviews, handleCreateReview, isCreatingReview } = useVetReviews(vetId);
    const [isFavorite, setIsFavorite] = useState(false);

    const handleBookConsultation = (serviceId?: string) => {
        if (specialist?.clinic_id) {
            router.push({
                pathname: '/directorio/citas/agendar/[clinic_id]',
                params: { clinic_id: specialist.clinic_id, vet_id: specialist.id, service_id: serviceId || undefined },
            } as any);
        } else {
            router.push({
                pathname: '/directorio/citas/agendar/independiente',
                params: { vet_id: specialist?.id, service_id: serviceId || undefined, virtual: '1' },
            } as any);
        }
    };

    const callVet = () => {
        if (specialist?.phone) Linking.openURL(`tel:${specialist.phone}`).catch(() => {});
    };
    const openWhatsApp = () => {
        if (specialist?.phone) {
            const phone = specialist.phone.replace(/[^0-9]/g, '');
            Linking.openURL(`https://wa.me/52${phone}`).catch(() => {});
        }
    };
    const shareVet = () => {
        const text = `${specialist?.first_name} ${specialist?.last_name} — ${specialist?.specialty || 'Médico Veterinario'}`;
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({ title: 'Especialista', text }).catch(() => {});
        }
    };

    if (isLoading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Cargando..." />
                <View style={styles.loadingBox}><ActivityIndicator size="large" color={theme.primary} /></View>
            </ScreenContainer>
        );
    }

    if (!specialist) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Especialista" />
                <View style={styles.loadingBox}>
                    <Text style={{ color: theme.textMuted }}>{isError ? 'No se pudo cargar el especialista' : 'Especialista no encontrado'}</Text>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            {/* Hero */}
            <View style={[styles.hero, { backgroundColor: theme.secondary + '08' }]}>
                <BackButton onPress={() => router.back()} style={styles.backBtn} />
                <TouchableOpacity style={styles.shareBtn} onPress={shareVet} accessibilityRole="button" accessibilityLabel="Compartir">
                    <Share2 size={20} color={theme.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.favBtn} onPress={() => setIsFavorite((v) => !v)} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
                    <Heart size={20} color={isFavorite ? theme.error : theme.textMuted} fill={isFavorite ? theme.error : 'transparent'} />
                </TouchableOpacity>

                <View style={[styles.avatarContainer, { borderColor: theme.secondary }]}>
                    {specialist.photo_url ? (
                        <Image source={{ uri: specialist.photo_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.secondary + '15' }]}>
                            <Text style={[styles.avatarInitial, { color: theme.secondary }]}>{specialist.first_name.charAt(0)}</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.heroName, { color: theme.text }]}>{specialist.first_name} {specialist.last_name}</Text>
                <Text style={[styles.heroSpecialty, { color: theme.secondary }]}>{specialist.specialty || 'Médico Veterinario'}</Text>

                <View style={styles.heroRating}>
                    <Star size={16} color={theme.warning} fill={theme.warning} />
                    <Text style={[styles.heroRatingText, { color: theme.text }]}>
                        {rating?.total_reviews ? Number(rating.average_rating || 0).toFixed(1) : 'Nuevo'}
                    </Text>
                    <Text style={[styles.heroRatingCount, { color: theme.textMuted }]}>
                        ({rating?.total_reviews || 0} reseña{rating?.total_reviews === 1 ? '' : 's'})
                    </Text>
                </View>

                {!!specialist.license_number && (
                    <View style={[styles.badge, { backgroundColor: theme.success + '15', borderColor: theme.success + '30' }]}>
                        <ShieldCheck size={12} color={theme.success} />
                        <Text style={[styles.badgeText, { color: theme.success }]}>Cédula: {specialist.license_number}</Text>
                    </View>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                {specialist.phone && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]} onPress={callVet} accessibilityRole="button" accessibilityLabel="Llamar">
                        <Phone size={20} color={theme.primary} />
                        <Text style={[styles.actionLabel, { color: theme.text }]}>Llamar</Text>
                    </TouchableOpacity>
                )}
                {specialist.phone && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]} onPress={openWhatsApp} accessibilityRole="button" accessibilityLabel="WhatsApp">
                        <MessageCircle size={20} color={theme.success} />
                        <Text style={[styles.actionLabel, { color: theme.text }]}>WhatsApp</Text>
                    </TouchableOpacity>
                )}
                {clinic && (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                        onPress={() => router.push(`/directorio/clinica/${clinic.id}` as any)}
                        accessibilityRole="button"
                        accessibilityLabel="Ver clínica"
                    >
                        <Briefcase size={20} color={theme.info} />
                        <Text style={[styles.actionLabel, { color: theme.text }]}>Clínica</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                    onPress={() => handleBookConsultation()}
                    accessibilityRole="button"
                    accessibilityLabel={specialist.clinic_id ? 'Agendar cita' : 'Agendar videoconsulta'}
                >
                    {specialist.clinic_id ? <Calendar size={20} color={theme.primary} /> : <Video size={20} color={theme.primary} />}
                    <Text style={[styles.actionLabel, { color: theme.text }]}>{specialist.clinic_id ? 'Agendar' : 'Video'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stats */}
                <ProviderStats items={[
                    { value: String(rating?.total_reviews || 0), label: 'Reseñas' },
                    { value: clinic?.name || 'Video', label: specialist.clinic_id ? 'Clínica' : 'Modalidad' },
                    { value: services.length ? String(services.length) : '—', label: 'Servicios' },
                ]} />

                {/* Bio */}
                {!!specialist.bio && (
                    <ProviderSection title="Biografía Profesional">
                        <ProviderBio text={specialist.bio} />
                    </ProviderSection>
                )}

                {/* Clínica de práctica */}
                {clinic && (
                    <ProviderSection title="Clínica de Práctica">
                        <TouchableOpacity
                            style={styles.clinicRow}
                            onPress={() => router.push(`/directorio/clinica/${clinic.id}` as any)}
                            accessibilityRole="button"
                            accessibilityLabel={`Ver ${clinic.name}`}
                        >
                            <View style={[styles.clinicIcon, { backgroundColor: theme.primary + '15' }]}>
                                <MapPin size={20} color={theme.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.clinicName, { color: theme.text }]}>{clinic.name}</Text>
                                <Text style={[styles.clinicAddress, { color: theme.textMuted }]}>
                                    {clinic.address ? `${clinic.address}, ` : ''}{clinic.city || ''}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </ProviderSection>
                )}

                {/* Servicios */}
                <ProviderSection title={specialist.clinic_id ? 'Servicios Disponibles' : 'Consultorio Virtual'}>
                    {services.length === 0 ? (
                        <Text style={{ color: theme.textMuted }}>
                            {specialist.clinic_id
                                ? 'No hay servicios listados actualmente.'
                                : 'Videoconsulta disponible. Agenda directamente con el especialista.'}
                        </Text>
                    ) : (
                        services.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={[styles.serviceItem, { backgroundColor: theme.background, borderColor: theme.borderLight }]}
                                onPress={() => handleBookConsultation(service.id)}
                                accessibilityRole="button"
                                accessibilityLabel={`Agendar ${service.name}`}
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
                label={specialist.clinic_id ? 'Agendar Consulta' : 'Agendar Videoconsulta'}
                onPress={() => handleBookConsultation()}
                icon={specialist.clinic_id ? <Calendar size={20} color={theme.onPrimary} /> : <Video size={20} color={theme.onPrimary} />}
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
    avatarContainer: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, overflow: 'hidden' },
    avatar: { width: 96, height: 96, borderRadius: 48 },
    avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: 36, fontWeight: '900' },
    heroName: { fontSize: type.h1.fontSize, fontWeight: '900', textAlign: 'center', marginBottom: spacing.xs },
    heroSpecialty: { fontSize: type.subtitle.fontSize, fontWeight: '700', marginBottom: spacing.sm },
    heroRating: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
    heroRatingText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
    heroRatingCount: { fontSize: type.caption.fontSize },
    badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1 },
    badgeText: { fontSize: type.caption.fontSize, fontWeight: '700' },
    quickActions: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
    actionBtn: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
    actionLabel: { fontSize: type.caption.fontSize, fontWeight: '600' },
    scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    clinicRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    clinicIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    clinicName: { fontSize: type.subtitle.fontSize, fontWeight: '700' },
    clinicAddress: { fontSize: type.caption.fontSize, marginTop: 2 },
    serviceItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.sm },
    serviceName: { fontSize: type.subtitle.fontSize, fontWeight: '700' },
    serviceDuration: { fontSize: type.caption.fontSize, marginTop: 2 },
    serviceRight: { alignItems: 'flex-end', gap: spacing.xs },
    servicePrice: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
});
