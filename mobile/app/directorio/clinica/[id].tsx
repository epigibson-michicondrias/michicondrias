/**
 * Detalle de clínica: datos, contacto rápido, servicios (cada uno agenda directo) y reseñas.
 */
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Phone, Globe, Clock, Star, AlertTriangle, Calendar, Hospital, Share2, MessageCircle, Navigation, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useClinicDetail } from '@/src/hooks/directorio/useClinicDetail';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { DetailTopBar, DetailFooter } from '@/src/components/layout/DetailLayout';
import IconButton, { type IconComponent } from '@/src/components/IconButton';
import Button from '@/src/components/Button';
import Badge from '@/src/components/Badge';
import { Skeleton } from '@/src/components/Skeleton';
import EmptyState from '@/src/components/EmptyState';
import ReviewsSection from '@/src/components/reviews/ReviewsSection';
import { ProviderSection } from '@/src/features/proveedor/ProviderProfile';
import { formatCurrency } from '@/src/utils/formatters';
import { layout, radius, spacing, tint, type } from '@/constants/design';

function QuickAction({ icon: Icon, label, color, onPress }: { icon: IconComponent; label: string; color: string; onPress: () => void }) {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.quick, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <Icon size={layout.icon.md} color={color} />
            <Text style={[type.caption, styles.quickLabel, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function ClinicDetailScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const c = useClinicDetail();
    const { clinic, rating, services, reviews } = c;

    const topBar = (
        <DetailTopBar
            onBack={c.goBack}
            actions={clinic ? <IconButton icon={Share2} accessibilityLabel="Compartir clínica" onPress={c.share} variant="surface" size="sm" /> : undefined}
        />
    );

    if (!c.isLoading && !clinic) {
        return (
            <ScreenContainer style={styles.centerScreen}>
                <EmptyState
                    icon={<Hospital size={layout.icon.xl} color={theme.textMuted} />}
                    title="No encontramos esta clínica"
                    subtitle="Puede que ya no esté en el directorio o que no tengas conexión."
                    actionLabel="Ver directorio"
                    onAction={c.goBack}
                />
                {topBar}
            </ScreenContainer>
        );
    }

    if (c.isLoading || !clinic) {
        return (
            <ScreenContainer>
                <View style={[styles.content, { paddingTop: insets.top + spacing.huge }]}>
                    <Skeleton width={72} height={72} borderRadius={radius.lg} style={styles.center} />
                    <Skeleton width="60%" height={24} style={styles.center} />
                    <Skeleton height={56} />
                    <Skeleton height={160} />
                </View>
                {topBar}
            </ScreenContainer>
        );
    }

    const place = [clinic.address, clinic.city].filter(Boolean).join(', ');
    const total = rating?.total_reviews ?? 0;

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.huge }]}>
                {/* Encabezado */}
                <View style={styles.hero}>
                    <View style={[styles.logo, { backgroundColor: theme.primary + tint.faint }]}>
                        {clinic.logo_url
                            ? <Image source={{ uri: clinic.logo_url }} style={styles.fill} accessibilityLabel={`Logo de ${clinic.name}`} />
                            : <Hospital size={layout.icon.xl} color={theme.primary} />}
                    </View>
                    <Text style={[type.h1, styles.centerText, { color: theme.text }]}>{clinic.name}</Text>
                    <View style={styles.meta}>
                        <Star size={layout.icon.sm} color={theme.accent} fill={total > 0 ? theme.accent : 'transparent'} />
                        <Text style={[type.bodyStrong, { color: theme.text }]}>{total > 0 ? rating!.average_rating.toFixed(1) : 'Nueva'}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>· {total} {total === 1 ? 'reseña' : 'reseñas'}</Text>
                    </View>
                    {place ? (
                        <View style={styles.meta}>
                            <MapPin size={layout.icon.xs} color={theme.textMuted} />
                            <Text style={[type.caption, styles.centerText, { color: theme.textMuted }]}>{place}</Text>
                        </View>
                    ) : null}
                    {clinic.is_24_hours || clinic.has_emergency ? (
                        <View style={styles.badges}>
                            {clinic.is_24_hours ? <Badge label="24 horas" color={theme.info} size="sm" icon={<Clock size={layout.icon.xs} color={theme.info} />} /> : null}
                            {clinic.has_emergency ? <Badge label="Urgencias" color={theme.error} size="sm" icon={<AlertTriangle size={layout.icon.xs} color={theme.error} />} /> : null}
                        </View>
                    ) : null}
                </View>

                {/* Contacto rápido: solo lo que la clínica tiene registrado */}
                <View style={styles.quickRow}>
                    {c.call ? <QuickAction icon={Phone} label="Llamar" color={theme.primary} onPress={c.call} /> : null}
                    {c.whatsapp ? <QuickAction icon={MessageCircle} label="WhatsApp" color={theme.success} onPress={c.whatsapp} /> : null}
                    <QuickAction icon={Navigation} label="Cómo llegar" color={theme.info} onPress={c.directions} />
                    {c.website ? <QuickAction icon={Globe} label="Sitio web" color={theme.accent} onPress={c.website} /> : null}
                </View>

                {clinic.description ? (
                    <ProviderSection title="Sobre la clínica">
                        <Text style={[type.body, { color: theme.textMuted }]}>{clinic.description}</Text>
                    </ProviderSection>
                ) : null}

                <ProviderSection title="Servicios">
                    {services.length === 0 ? (
                        <Text style={[type.body, { color: theme.textMuted }]}>Aún no hay servicios para agendar en línea. Puedes llamar a la clínica.</Text>
                    ) : (
                        <View style={styles.services}>
                            {services.map((service) => (
                                <TouchableOpacity
                                    key={service.id}
                                    style={[styles.service, { borderColor: theme.cardBorder }]}
                                    onPress={() => c.book(service.id)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Agendar ${service.name}`}
                                >
                                    <View style={styles.flex}>
                                        <Text style={[type.bodyStrong, { color: theme.text }]}>{service.name}</Text>
                                        <Text style={[type.caption, { color: theme.textMuted }]}>{service.duration_minutes} min</Text>
                                    </View>
                                    <Text style={[type.bodyStrong, { color: theme.primary }]}>
                                        {service.price ? formatCurrency(Number(service.price)) : 'Consultar'}
                                    </Text>
                                    <ChevronRight size={layout.icon.sm} color={theme.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ProviderSection>

                <ReviewsSection
                    title="Opiniones"
                    average={rating?.average_rating ?? 0}
                    count={total}
                    reviews={reviews.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at, author_name: 'Cliente' }))}
                    canReview={c.canReview}
                    submitting={c.isCreatingReview}
                    onSubmit={(value, comment) => c.handleCreateReview(value, comment || undefined)}
                    formPrompt="¿Cómo te atendieron?"
                    style={styles.reviews}
                />
            </ScrollView>

            <DetailFooter>
                <Button label="Agendar cita" icon={<Calendar size={layout.icon.sm} color={theme.onPrimary} />} onPress={() => c.book()} size="lg" style={styles.flex} />
            </DetailFooter>
            {topBar}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    fill: { width: '100%', height: '100%' },
    center: { alignSelf: 'center' },
    centerScreen: { justifyContent: 'center' },
    centerText: { textAlign: 'center' },
    content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xl, gap: spacing.md },
    hero: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    logo: {
        width: layout.iconBox.lg * 1.6,
        height: layout.iconBox.lg * 1.6,
        borderRadius: radius.lg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
    quickRow: { flexDirection: 'row', gap: spacing.sm },
    quick: {
        flex: 1,
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md,
        minHeight: layout.minTouch,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    quickLabel: { fontWeight: '600' },
    services: { gap: spacing.sm },
    service: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        minHeight: layout.minTouch,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    reviews: { marginHorizontal: 0, marginBottom: 0 },
});
