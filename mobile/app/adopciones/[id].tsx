import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import {
    Share2, Heart, PawPrint, Calendar, Ruler, Scale, Zap, MapPin, AlertTriangle, CheckCircle2, MinusCircle, ClipboardList, FileText, Cpu,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useListingDetail } from '@/src/hooks/adopciones/useListingDetail';
import { capitalize, sentenceCase, formatAge, formatWeight } from '@/src/utils/formatters';
import { shareContent } from '@/src/utils/share';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { DetailPhoto, DetailTopBar, DetailFooter, useDetailPhotoHeight } from '@/src/components/layout/DetailLayout';
import IconButton from '@/src/components/IconButton';
import Button from '@/src/components/Button';
import Badge from '@/src/components/Badge';
import EmptyState from '@/src/components/EmptyState';
import { Skeleton } from '@/src/components/Skeleton';
import { layout, radius, spacing, type } from '@/constants/design';

export default function AdopcionDetalleScreen() {
    const { theme } = useTheme();
    const photoHeight = useDetailPhotoHeight();
    const { listing, isLoading, error, refetch, goBack, goToSolicitar, goToMyRequests, goToRequests, myRequest, isOwner } = useListingDetail();

    const share = () => listing && shareContent(
        'Adopción',
        `Conoce a ${listing.name}, ${listing.species?.toLowerCase() === 'gato' ? 'un michi' : 'una mascota'} en adopción${listing.location ? ` en ${listing.location}` : ''}. Encuéntralo en Michicondrias 🐾`,
    );

    const topBar = (
        <DetailTopBar
            onBack={goBack}
            actions={listing ? <IconButton icon={Share2} accessibilityLabel={`Compartir a ${listing.name}`} onPress={share} variant="surface" size="sm" /> : undefined}
        />
    );

    if (isLoading) return (
        <ScreenContainer>
            <Skeleton height={photoHeight} borderRadius={0} />
            <View style={styles.content}>
                <Skeleton width="30%" height={20} />
                <Skeleton width="55%" height={28} />
                <Skeleton height={110} />
                <Skeleton height={90} />
            </View>
            {topBar}
        </ScreenContainer>
    );

    if (error || !listing) return (
        <ScreenContainer style={styles.center}>
            <EmptyState
                icon={<AlertTriangle size={layout.icon.xl} color={theme.textMuted} />}
                title="No pudimos cargar la mascota"
                subtitle="Puede que ya no esté disponible o que no tengas conexión."
                actionLabel="Reintentar"
                onAction={() => refetch()}
            />
            {topBar}
        </ScreenContainer>
    );

    const status = listing.status?.toLowerCase();
    const isOpen = status === 'abierto';
    const statusBadge = isOpen
        ? <Badge label="En adopción" color={theme.success} variant="solid" />
        : status === 'en_proceso'
            ? <Badge label="En proceso" color={theme.warning} variant="solid" />
            : <Badge label="Adoptado" color={theme.textMuted} variant="solid" />;

    const stats = [
        { icon: Calendar, label: 'Edad', value: formatAge(listing.age_months) },
        { icon: Ruler, label: 'Tamaño', value: listing.size ? sentenceCase(listing.size) : 'No indicado' },
        { icon: Scale, label: 'Peso', value: listing.weight_kg != null ? formatWeight(listing.weight_kg) : 'No indicado' },
        { icon: Zap, label: 'Energía', value: listing.energy_level ? sentenceCase(listing.energy_level) : 'No indicada' },
    ];

    const health = [
        { label: 'Vacunado', ok: listing.is_vaccinated },
        { label: 'Desparasitado', ok: listing.is_dewormed },
        { label: 'Esterilizado', ok: listing.is_sterilized },
        { label: 'Convive con perros', ok: listing.social_dogs },
        { label: 'Convive con gatos', ok: listing.social_cats },
        { label: 'Convive con niños', ok: listing.social_children },
    ];

    const traits = (listing.temperament ?? '').split(',').map((t) => t.trim()).filter(Boolean);

    // Una sola acción principal según quién mira y el estado de la publicación
    const footer = isOwner ? (
        <Button label="Ver solicitudes recibidas" icon={<ClipboardList size={layout.icon.sm} color={theme.onPrimary} />} onPress={goToRequests} size="lg" style={styles.flex} />
    ) : !isOpen ? (
        <Text style={[type.bodyStrong, styles.footerNote, { color: theme.textMuted }]}>
            {status === 'en_proceso' ? `${listing.name} ya está en proceso de adopción.` : `${listing.name} ya encontró hogar.`}
        </Text>
    ) : myRequest ? (
        <Button label="Ver mi solicitud" variant="secondary" icon={<FileText size={layout.icon.sm} color={theme.text} />} onPress={goToMyRequests} size="lg" style={styles.flex} />
    ) : (
        <Button label={`Quiero adoptar a ${listing.name}`} icon={<Heart size={layout.icon.sm} color={theme.onPrimary} />} onPress={goToSolicitar} size="lg" style={styles.flex} />
    );

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <DetailPhoto
                    images={[listing.photo_url, ...(listing.gallery ?? [])]}
                    fallbackIcon={PawPrint}
                    fallbackLabel="Sin foto"
                    accessibilityLabel={`Foto de ${listing.name}`}
                />

                <View style={styles.content}>
                    <View style={styles.titleBlock}>
                        <View style={styles.badges}>
                            {statusBadge}
                            {listing.is_emergency ? <Badge label="Urgente" color={theme.error} variant="solid" /> : null}
                        </View>
                        <Text style={[type.display, { color: theme.text }]} numberOfLines={2}>{listing.name}</Text>
                        <Text style={[type.subtitle, { color: theme.primary }]}>
                            {[sentenceCase(listing.species), listing.breed ? capitalize(listing.breed) : 'Mestizo', listing.gender && sentenceCase(listing.gender)].filter(Boolean).join(' · ')}
                        </Text>
                        {listing.location ? (
                            <View style={styles.metaRow}>
                                <MapPin size={layout.icon.sm} color={theme.textMuted} />
                                <Text style={[type.body, styles.flex, { color: theme.textMuted }]}>{listing.location}</Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={styles.grid}>
                        {stats.map(({ icon: Icon, label, value }) => (
                            <View key={label} style={[styles.gridItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                                <Icon size={layout.icon.sm} color={theme.primary} />
                                <View style={styles.flex}>
                                    <Text style={[type.caption, { color: theme.textMuted }]}>{label}</Text>
                                    <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>{value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <Text style={[type.title, { color: theme.text }]}>Su historia</Text>
                        <Text style={[type.body, { color: theme.textMuted }]}>
                            {listing.description?.trim() || 'Aún no hay una historia escrita para esta mascota.'}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[type.title, { color: theme.text }]}>Salud y convivencia</Text>
                        <View style={styles.chips}>
                            {health.map(({ label, ok }) => (
                                <Badge
                                    key={label}
                                    label={label}
                                    color={ok ? theme.success : theme.textMuted}
                                    icon={ok
                                        ? <CheckCircle2 size={layout.icon.xs} color={theme.success} />
                                        : <MinusCircle size={layout.icon.xs} color={theme.textMuted} />}
                                    accessibilityLabel={`${label}: ${ok ? 'sí' : 'no o sin dato'}`}
                                />
                            ))}
                        </View>
                        {listing.microchip_number ? (
                            <View style={styles.metaRow}>
                                <Cpu size={layout.icon.sm} color={theme.textMuted} />
                                <Text style={[type.caption, { color: theme.textMuted }]}>Con microchip</Text>
                            </View>
                        ) : null}
                    </View>

                    {traits.length > 0 ? (
                        <View style={styles.section}>
                            <Text style={[type.title, { color: theme.text }]}>Personalidad</Text>
                            <View style={styles.chips}>
                                {traits.map((trait) => <Badge key={trait} label={sentenceCase(trait)} color={theme.primary} />)}
                            </View>
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            <DetailFooter>{footer}</DetailFooter>
            {topBar}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: { justifyContent: 'center' },
    flex: { flex: 1 },
    scroll: { paddingBottom: spacing.xxl },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.xl, gap: spacing.xl },
    titleBlock: { gap: spacing.xs },
    badges: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    gridItem: {
        flexGrow: 1,
        flexBasis: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    section: { gap: spacing.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    footerNote: { flex: 1, textAlign: 'center', paddingVertical: spacing.sm },
});
