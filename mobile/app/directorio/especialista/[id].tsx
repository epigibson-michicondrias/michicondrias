/**
 * Perfil de especialista: datos, contacto rápido, clínica donde atiende, servicios (agendar) y reseñas.
 */
import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Phone, Star, ShieldCheck, Calendar, Share2, MessageCircle, Building2, ChevronRight, UserX, Stethoscope } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useVetDetail } from '@/src/hooks/directorio/useVetDetail';
import { useVetReviews } from '@/src/hooks/directorio/useVetReviews';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { DetailTopBar, DetailFooter } from '@/src/components/layout/DetailLayout';
import IconButton, { type IconComponent } from '@/src/components/IconButton';
import Button from '@/src/components/Button';
import Badge from '@/src/components/Badge';
import ListRow from '@/src/components/ListRow';
import EmptyState from '@/src/components/EmptyState';
import { Skeleton } from '@/src/components/Skeleton';
import ReviewsSection from '@/src/components/reviews/ReviewsSection';
import { ProviderSection, ProviderBio } from '@/src/features/proveedor/ProviderProfile';
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

export default function SpecialistDetailScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const v = useVetDetail();
    const { specialist, clinic, services } = v;
    const { rating, reviews, handleCreateReview, isCreatingReview } = useVetReviews(v.vetId);

    const topBar = (
        <DetailTopBar
            onBack={v.goBack}
            actions={specialist ? <IconButton icon={Share2} accessibilityLabel="Compartir perfil" onPress={v.share} variant="surface" size="sm" /> : undefined}
        />
    );

    if (v.isLoading) {
        return (
            <ScreenContainer>
                <View style={[styles.content, { paddingTop: insets.top + spacing.huge }]}>
                    <Skeleton width={88} height={88} borderRadius={44} style={styles.center} />
                    <Skeleton width="55%" height={24} style={styles.center} />
                    <Skeleton height={56} />
                    <Skeleton height={140} />
                </View>
                {topBar}
            </ScreenContainer>
        );
    }

    if (!specialist) {
        return (
            <ScreenContainer style={styles.centerScreen}>
                <EmptyState
                    icon={<UserX size={layout.icon.xl} color={theme.textMuted} />}
                    title={v.isError ? 'No pudimos cargar este perfil' : 'No encontramos a este especialista'}
                    subtitle={v.isError ? 'Revisa tu conexión e inténtalo de nuevo.' : 'Puede que ya no esté en el directorio.'}
                    actionLabel={v.isError ? 'Reintentar' : 'Ver directorio'}
                    onAction={v.isError ? () => v.refetch() : v.goBack}
                />
                {topBar}
            </ScreenContainer>
        );
    }

    const total = rating?.total_reviews ?? 0;

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.huge }]}>
                <View style={styles.hero}>
                    <View style={[styles.avatar, { backgroundColor: theme.secondary + tint.soft }]}>
                        {specialist.photo_url
                            ? <Image source={{ uri: specialist.photo_url }} style={styles.fill} accessibilityLabel={`Foto de ${v.fullName}`} />
                            : <Text style={[type.display, { color: theme.secondary }]}>{specialist.first_name.charAt(0).toUpperCase()}</Text>}
                    </View>
                    <Text style={[type.h1, styles.centerText, { color: theme.text }]}>{v.fullName}</Text>
                    <Text style={[type.subtitle, { color: theme.secondary }]}>{specialist.specialty || 'Médico veterinario'}</Text>
                    <View style={styles.meta}>
                        <Star size={layout.icon.sm} color={theme.accent} fill={total > 0 ? theme.accent : 'transparent'} />
                        <Text style={[type.bodyStrong, { color: theme.text }]}>{total > 0 ? Number(rating!.average_rating || 0).toFixed(1) : 'Nuevo'}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>· {total} {total === 1 ? 'reseña' : 'reseñas'}</Text>
                    </View>
                    {specialist.license_number ? (
                        <Badge label={`Cédula ${specialist.license_number}`} color={theme.success} size="sm" icon={<ShieldCheck size={layout.icon.xs} color={theme.success} />} />
                    ) : null}
                </View>

                {v.call || clinic ? (
                    <View style={styles.quickRow}>
                        {v.call ? <QuickAction icon={Phone} label="Llamar" color={theme.primary} onPress={v.call} /> : null}
                        {v.whatsapp ? <QuickAction icon={MessageCircle} label="WhatsApp" color={theme.success} onPress={v.whatsapp} /> : null}
                        {clinic ? <QuickAction icon={Building2} label="Su clínica" color={theme.info} onPress={v.openClinic} /> : null}
                    </View>
                ) : null}

                {specialist.bio ? (
                    <ProviderSection title="Sobre mí">
                        <ProviderBio text={specialist.bio} />
                    </ProviderSection>
                ) : null}

                {clinic ? (
                    <ListRow
                        icon={Building2}
                        label={clinic.name}
                        desc={[clinic.address, clinic.city].filter(Boolean).join(', ') || 'Ver clínica'}
                        onPress={v.openClinic}
                    />
                ) : null}

                {v.canBook ? (
                    <ProviderSection title="Servicios">
                        {services.length === 0 ? (
                            <Text style={[type.body, { color: theme.textMuted }]}>Aún no hay servicios para agendar en línea.</Text>
                        ) : (
                            <View style={styles.services}>
                                {services.map((service) => (
                                    <TouchableOpacity
                                        key={service.id}
                                        style={[styles.service, { borderColor: theme.cardBorder }]}
                                        onPress={() => v.book(service.id)}
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
                ) : (
                    <View style={[styles.note, { backgroundColor: theme.info + tint.faint }]}>
                        <Stethoscope size={layout.icon.sm} color={theme.info} />
                        <Text style={[type.body, styles.flex, { color: theme.text }]}>
                            {clinic
                                ? 'Su clínica aún no tiene servicios para agendar en línea: contáctalo directo.'
                                : 'Atiende por su cuenta: contáctalo directo para acordar la consulta.'}
                        </Text>
                    </View>
                )}

                <ReviewsSection
                    title="Opiniones"
                    average={Number(rating?.average_rating ?? 0)}
                    count={total}
                    reviews={reviews.map((r: any) => ({ id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at, author_name: 'Cliente' }))}
                    canReview={v.canReview}
                    submitting={isCreatingReview}
                    onSubmit={(value, comment) => handleCreateReview(value, comment || undefined)}
                    formPrompt="¿Cómo te atendió?"
                    style={styles.reviews}
                />
            </ScrollView>

            {v.canBook ? (
                <DetailFooter>
                    <Button label="Agendar cita" icon={<Calendar size={layout.icon.sm} color={theme.onPrimary} />} onPress={() => v.book()} size="lg" style={styles.flex} />
                </DetailFooter>
            ) : v.whatsapp || v.call ? (
                <DetailFooter>
                    <Button
                        label={v.whatsapp ? 'Escribir por WhatsApp' : 'Llamar'}
                        icon={v.whatsapp ? <MessageCircle size={layout.icon.sm} color={theme.onPrimary} /> : <Phone size={layout.icon.sm} color={theme.onPrimary} />}
                        onPress={(v.whatsapp ?? v.call)!}
                        size="lg"
                        style={styles.flex}
                    />
                </DetailFooter>
            ) : null}
            {topBar}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    fill: { width: '100%', height: '100%' },
    center: { alignSelf: 'center' },
    centerText: { textAlign: 'center' },
    centerScreen: { justifyContent: 'center' },
    content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xl, gap: spacing.md },
    hero: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
    avatar: {
        width: layout.iconBox.lg * 2,
        height: layout.iconBox.lg * 2,
        borderRadius: layout.iconBox.lg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
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
    note: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
    reviews: { marginHorizontal: 0, marginBottom: 0 },
});
