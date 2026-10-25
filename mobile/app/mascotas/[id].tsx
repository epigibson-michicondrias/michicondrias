import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { usePetDetail } from '@/src/hooks/mascotas/usePetDetail';
import { formatAge, formatWeight, getSpeciesLabel, capitalize } from '@/src/utils/formatters';
import { DetailPhoto, DetailTopBar } from '@/src/components/layout/DetailLayout';
import IconButton from '@/src/components/IconButton';
import ListRow from '@/src/components/ListRow';
import SectionHeader from '@/src/components/SectionHeader';
import EmptyState from '@/src/components/EmptyState';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import AppRefreshControl from '@/src/components/AppRefreshControl';
import { Award, Activity, Calendar, LayoutGrid, HeartPulse, ClipboardList, Share2, Pencil, PawPrint, Satellite, Scissors, Flower2 } from 'lucide-react-native';
import SegmentedControl from '@/src/components/SegmentedControl';
import { Skeleton } from '@/src/components/Skeleton';
import { usePetHealth } from '@/src/hooks/carnet/usePetHealth';
import { PetHealthTab } from '@/src/features/mascotas/PetHealthTabs';
import { PetHistoryTab } from '@/src/features/mascotas/PetHistoryTab';
import { PetPassportShare } from '@/src/features/mascotas/PetPassportShare';
import { spacing, radius, type, shadow, layout } from '@/constants/design';

const VACCINE_STATUS_LABEL = {
    'al-dia': 'Al día',
    'vencido': 'Vencido',
    'sin-registro': 'Sin vacunas',
} as const;

export default function PetProfileScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        pet, isOwner, isLoading, error, refetch, goBack, tab, setTab,
        shareUrl, openShare, closeShare,
        handleSubscribeMichiTracker, isSubscribing, openTrackerBilling, isOpeningBilling,
    } = usePetDetail();
    const health = usePetHealth(pet?.id, pet, tab === 'resumen' ? null : tab);

    if (isLoading) return (
        <ScreenContainer>
            <Skeleton height={300} borderRadius={0} />
            <View style={styles.loadingBody}>
                <Skeleton width="50%" height={28} />
                <Skeleton height={48} borderRadius={radius.lg} />
                <Skeleton height={96} borderRadius={radius.lg} />
            </View>
        </ScreenContainer>
    );

    if (error || !pet) {
        const status = (error as any)?.status;
        const copy = status === 403
            ? { title: 'No tienes acceso a esta mascota', subtitle: 'Solo su dueño o un profesional autorizado puede verla.' }
            : status === 404
                ? { title: 'Esta mascota ya no existe', subtitle: 'Puede que la hayan eliminado.' }
                : { title: 'No pudimos cargar a tu mascota', subtitle: 'Revisa tu conexión e inténtalo de nuevo.' };
        const retry = status !== 403 && status !== 404;
        return (
            <ScreenContainer style={styles.center}>
                <EmptyState
                    icon={<PawPrint size={layout.icon.xl} color={theme.textMuted} />}
                    title={copy.title}
                    subtitle={copy.subtitle}
                    actionLabel={retry ? 'Reintentar' : 'Ver mis mascotas'}
                    onAction={retry ? () => refetch() : () => router.replace('/mascotas')}
                />
                <DetailTopBar onBack={goBack} />
            </ScreenContainer>
        );
    }

    const speciesLabel = getSpeciesLabel(pet.species);
    const formattedBreed = pet.breed ? capitalize(pet.breed) : speciesLabel;
    const genderText = pet.gender === 'macho' ? 'Macho' : pet.gender === 'hembra' ? 'Hembra' : null;

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<AppRefreshControl />}>
                <DetailPhoto
                    images={[pet.photo_url]}
                    fallbackIcon={PawPrint}
                    accessibilityLabel={`Foto de ${pet.name}`}
                />

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.titleSection}>
                        <View style={{ flex: 1, gap: spacing.xxs }}>
                            <Text style={[type.display, { color: theme.text }]} numberOfLines={1}>{pet.name}</Text>
                            <Text style={[type.body, { color: theme.textMuted }]} numberOfLines={1}>
                                {[formattedBreed, genderText].filter(Boolean).join(' · ')}
                            </Text>
                        </View>
                    </View>

                    <SegmentedControl
                        accessibilityLabel={`Secciones de ${pet.name}`}
                        value={tab}
                        onChange={setTab}
                        options={[
                            { value: 'resumen', label: 'Resumen', icon: LayoutGrid },
                            { value: 'salud', label: 'Salud', icon: HeartPulse },
                            { value: 'historial', label: 'Historial', icon: ClipboardList },
                        ]}
                    />

                    {tab === 'salud' && <View style={styles.tabBody}><PetHealthTab health={health} petName={pet.name} /></View>}
                    {tab === 'historial' && <View style={styles.tabBody}><PetHistoryTab health={health} petId={pet.id} petName={pet.name} /></View>}

                    {tab === 'resumen' && (<>
                    {/* Stats Grid: Peso y Vacunas llevan a su detalle (Historial con la curva de peso, Salud con el carnet) */}
                    <View style={styles.grid}>
                        <PetStat icon={<Calendar size={layout.icon.md} color={theme.accent} />} label="Edad" value={formatAge(pet.age_months)} theme={theme} />
                        <PetStat icon={<Activity size={layout.icon.md} color={theme.secondary} />} label="Peso" value={formatWeight(pet.weight_kg)} theme={theme} onPress={() => setTab('historial')} />
                        <PetStat
                            icon={<Award size={layout.icon.md} color={theme.warning} />}
                            label="Vacunas"
                            value={VACCINE_STATUS_LABEL[health.vaccinesStatus] ?? 'Sin vacunas'}
                            theme={theme}
                            onPress={() => setTab('salud')}
                        />
                    </View>

                    {/* Seguimiento GPS (solo el dueño). Con la suscripción activa hay salida: facturación */}
                    {isOwner && (
                        <View style={styles.section}>
                            <ListRow
                                icon={Satellite}
                                color={theme.success}
                                label="Michi-Tracker Pro"
                                desc={pet.has_active_subscription
                                    ? 'GPS activo · Gestionar suscripción'
                                    : isSubscribing || isOpeningBilling ? 'Abriendo…' : 'Activa el seguimiento GPS en tiempo real'}
                                onPress={isSubscribing || isOpeningBilling ? undefined : pet.has_active_subscription ? openTrackerBilling : handleSubscribeMichiTracker}
                            />
                        </View>
                    )}

                    {/* Servicios y recuerdo (solo el dueño) */}
                    {isOwner && (
                        <View style={[styles.section, styles.rows]}>
                            <SectionHeader title="Más para tu mascota" />
                            <ListRow
                                icon={Scissors}
                                color={theme.info}
                                label="Historial de estética"
                                desc="Visitas y fotos de baño y corte"
                                onPress={() => router.push({ pathname: '/grooming/historial/[petId]', params: { petId: pet.id } } as any)}
                            />
                            <ListRow
                                icon={Flower2}
                                color={theme.textMuted}
                                label="Memorial y recuerdo"
                                desc="Un espacio de homenaje, cuando llegue el momento"
                                onPress={() => router.push({ pathname: '/funeraria/memorial/[petId]', params: { petId: pet.id } } as any)}
                            />
                        </View>
                    )}

                    {/* Descripción libre del dueño */}
                    {!!pet.description && (
                        <View style={styles.section}>
                            <Text style={[type.title, { color: theme.text, marginBottom: spacing.md }]}>Sobre {pet.name}</Text>
                            <View style={[styles.notesBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                                <Text style={[type.body, { color: theme.text, lineHeight: 22 }]}>{pet.description}</Text>
                            </View>
                        </View>
                    )}
                    </>)}
                </View>
            </ScrollView>

            <DetailTopBar
                onBack={goBack}
                actions={isOwner ? (
                    <>
                        <IconButton icon={Share2} accessibilityLabel="Compartir carnet" onPress={openShare} variant="surface" size="sm" />
                        <IconButton icon={Pencil} accessibilityLabel="Editar mascota" onPress={() => router.push(`/mascotas/editar/${pet.id}`)} variant="surface" size="sm" />
                    </>
                ) : undefined}
            />

            {/* Carnet compartible con QR (solo el dueño lo abre) */}
            <PetPassportShare url={shareUrl} petName={pet.name} onClose={closeShare} />
        </ScreenContainer>
    );
}

function PetStat({ icon, label, value, theme, onPress }: { icon: any; label: string; value: string; theme: any; onPress?: () => void }) {
    const style = [styles.statItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }];
    const body = (
        <>
            {icon}
            <Text style={[type.label, { color: theme.textMuted }]} numberOfLines={1}>{label}</Text>
            <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>{value}</Text>
        </>
    );
    if (!onPress) return <View style={style}>{body}</View>;
    return (
        <TouchableOpacity style={style} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}. Ver detalle`}>
            {body}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    loadingBody: { padding: spacing.xl, gap: spacing.lg },
    tabBody: { marginTop: spacing.xl },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    content: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    grid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    statItem: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.lg,
        alignItems: 'center',
        gap: spacing.xs,
        borderWidth: 1,
        ...shadow.card,
    },
    section: {
        marginBottom: spacing.xxl,
    },
    rows: { gap: spacing.sm },
    notesBox: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.card,
    },
});
