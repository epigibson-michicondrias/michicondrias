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
import { showAlert } from '@/src/components/AppAlert';
import {
    Award,
    Activity,
    Calendar,
    LayoutGrid,
    HeartPulse,
    ClipboardList,
    Pill,
    Share2,
    Pencil,
    PawPrint,
    Satellite,
    Scissors,
    Flower2,
    Mars,
    Venus,
    Sparkles,
    Stethoscope,
    QrCode,
} from 'lucide-react-native';
import SegmentedControl from '@/src/components/SegmentedControl';
import { Skeleton } from '@/src/components/Skeleton';
import { usePetHealth } from '@/src/hooks/carnet/usePetHealth';
import { PetHealthTab, PetTreatmentsTab } from '@/src/features/mascotas/PetHealthTabs';
import { PetHistoryTab } from '@/src/features/mascotas/PetHistoryTab';
import { PetPassportShare } from '@/src/features/mascotas/PetPassportShare';
import { haptic } from '@/src/utils/haptics';
import { spacing, radius, type, shadow, layout, families, font } from '@/constants/design';

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
    const health = usePetHealth(pet?.id, pet, tab === 'resumen' ? null : tab === 'tratamientos' ? 'tratamientos' : tab);

    if (isLoading) return (
        <ScreenContainer>
            <Skeleton height={280} borderRadius={0} />
            <View style={styles.loadingBody}>
                <Skeleton width="55%" height={32} />
                <Skeleton height={46} borderRadius={radius.lg} />
                <View style={styles.grid}>
                    <Skeleton height={90} width="31%" borderRadius={radius.lg} />
                    <Skeleton height={90} width="31%" borderRadius={radius.lg} />
                    <Skeleton height={90} width="31%" borderRadius={radius.lg} />
                </View>
                <Skeleton height={120} borderRadius={radius.lg} />
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
    const isMale = pet.gender === 'macho';
    const isFemale = pet.gender === 'hembra';

    const vaccineColor =
        health.vaccinesStatus === 'al-dia'
            ? theme.success
            : health.vaccinesStatus === 'vencido'
                ? theme.error
                : theme.textMuted;

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<AppRefreshControl />}>
                <DetailPhoto
                    images={[pet.photo_url]}
                    fallbackIcon={PawPrint}
                    accessibilityLabel={`Foto de ${pet.name}`}
                />

                <View style={styles.content}>
                    {/* Header Hero con Información Principal y Badges */}
                    <View style={styles.titleSection}>
                        <View style={styles.titleInfo}>
                            <Text style={[type.h1, { color: theme.text }]} numberOfLines={1}>
                                {pet.name}
                            </Text>

                            <View style={styles.tagRow}>
                                <View style={[styles.badgePill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <PawPrint size={12} color={theme.primary} />
                                    <Text style={[styles.badgeText, { color: theme.text }]}>
                                        {formattedBreed}
                                    </Text>
                                </View>

                                {(isMale || isFemale) && (
                                    <View style={[styles.badgePill, { backgroundColor: isMale ? '#3B82F615' : '#EC489915', borderColor: isMale ? '#3B82F635' : '#EC489935' }]}>
                                        {isMale ? (
                                            <Mars size={12} color="#3B82F6" strokeWidth={2.5} />
                                        ) : (
                                            <Venus size={12} color="#EC4899" strokeWidth={2.5} />
                                        )}
                                        <Text style={[styles.badgeText, { color: isMale ? '#3B82F6' : '#EC4899' }]}>
                                            {isMale ? 'Macho' : 'Hembra'}
                                        </Text>
                                    </View>
                                )}

                                {pet.is_sterilized && (
                                    <View style={[styles.badgePill, { backgroundColor: theme.success + '15', borderColor: theme.success + '30' }]}>
                                        <Text style={[styles.badgeText, { color: theme.success }]}>
                                            Esterilizado/a
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Barra de Acciones Rápidas Premium (solo dueño) */}
                    {isOwner && (
                        <View style={styles.quickActionsBar}>
                            <TouchableOpacity
                                style={[styles.quickActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => {
                                    haptic.selection();
                                    openShare();
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Compartir carnet con QR"
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <QrCode size={16} color={theme.primary} />
                                </View>
                                <Text style={[styles.quickActionLabel, { color: theme.text }]}>Pasaporte QR</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => {
                                    haptic.selection();
                                    router.push('/mascotas/diagnostico-ia');
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Diagnóstico con Inteligencia Artificial"
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: theme.accent + '20' }]}>
                                    <Sparkles size={16} color={theme.accent} />
                                </View>
                                <Text style={[styles.quickActionLabel, { color: theme.text }]}>Michi-IA</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => {
                                    haptic.selection();
                                    router.push(`/mascotas/editar/${pet.id}`);
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Editar ficha"
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: theme.secondary + '20' }]}>
                                    <Pencil size={16} color={theme.secondary} />
                                </View>
                                <Text style={[styles.quickActionLabel, { color: theme.text }]}>Editar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => {
                                    haptic.selection();
                                    router.push('/directorio');
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Buscar veterinario"
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: theme.info + '15' }]}>
                                    <Stethoscope size={16} color={theme.info} />
                                </View>
                                <Text style={[styles.quickActionLabel, { color: theme.text }]}>Cita Médica</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Pestañas de la Ficha */}
                    <View style={styles.tabsWrapper}>
                        <SegmentedControl
                            accessibilityLabel={`Secciones de ${pet.name}`}
                            value={tab}
                            onChange={setTab}
                            options={[
                                { value: 'resumen', label: 'Resumen', icon: LayoutGrid },
                                { value: 'salud', label: 'Salud', icon: HeartPulse },
                                { value: 'tratamientos', label: 'Tratamientos', icon: Pill },
                                { value: 'historial', label: 'Historial', icon: ClipboardList },
                            ]}
                        />
                    </View>

                    {tab === 'salud' && <View style={styles.tabBody}><PetHealthTab health={health} petName={pet.name} /></View>}
                    {tab === 'tratamientos' && <View style={styles.tabBody}><PetTreatmentsTab health={health} /></View>}
                    {tab === 'historial' && <View style={styles.tabBody}><PetHistoryTab health={health} petId={pet.id} petName={pet.name} /></View>}

                    {tab === 'resumen' && (
                        <>
                            {/* Stats Grid con Indicadores Vivos */}
                            <View style={[styles.grid, styles.tabBody]}>
                                <PetStat
                                    icon={<Calendar size={18} color={theme.warning} />}
                                    iconBg={theme.warning + '15'}
                                    label="Edad"
                                    value={formatAge(pet.age_months)}
                                    theme={theme}
                                />
                                <PetStat
                                    icon={<Activity size={18} color={theme.secondary} />}
                                    iconBg={theme.secondary + '15'}
                                    label="Peso"
                                    value={formatWeight(pet.weight_kg)}
                                    theme={theme}
                                    onPress={() => setTab('historial')}
                                    hint="Ver curva"
                                />
                                <PetStat
                                    icon={<Award size={18} color={vaccineColor} />}
                                    iconBg={vaccineColor + '15'}
                                    label="Vacunas"
                                    value={VACCINE_STATUS_LABEL[health.vaccinesStatus] ?? 'Sin vacunas'}
                                    theme={theme}
                                    onPress={() => setTab('salud')}
                                    statusDotColor={vaccineColor}
                                    hint="Ver carnet"
                                />
                            </View>

                            {/* Seguimiento GPS (solo el dueño) */}
                            {isOwner && (
                                <View style={styles.section}>
                                    <ListRow
                                        icon={Satellite}
                                        color={theme.success}
                                        label="Michi-Tracker Pro"
                                        desc={pet.has_active_subscription
                                            ? 'GPS activo · Gestionar en Facturación'
                                            : isSubscribing ? 'Activando…' : 'Activa el seguimiento GPS en tiempo real ($199/mes)'}
                                        onPress={isSubscribing ? undefined : pet.has_active_subscription ? () => router.push('/perfil/facturacion') : () => {
                                            showAlert({
                                                type: 'info',
                                                title: 'Michi-Tracker Pro',
                                                message: `¿Deseas activar el seguimiento GPS en tiempo real para ${pet.name} por $199.00 MXN / mes?`,
                                                showCancel: true,
                                                cancelText: 'Cancelar',
                                                buttonText: 'Activar ahora',
                                                onButtonPress: handleSubscribeMichiTracker,
                                            });
                                        }}
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
                                    <Text style={[type.title, { color: theme.text, marginBottom: spacing.sm }]}>
                                        Sobre {pet.name}
                                    </Text>
                                    <View style={[styles.notesBox, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                                        <Text style={[type.body, { color: theme.text, lineHeight: 22 }]}>
                                            {pet.description}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
                    )}
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

function PetStat({
    icon,
    iconBg,
    label,
    value,
    theme,
    onPress,
    statusDotColor,
    hint,
}: {
    icon: React.ReactNode;
    iconBg?: string;
    label: string;
    value: string;
    theme: any;
    onPress?: () => void;
    statusDotColor?: string;
    hint?: string;
}) {
    const handlePress = () => {
        if (onPress) {
            haptic.selection();
            onPress();
        }
    };

    const content = (
        <>
            <View style={[styles.statIconContainer, { backgroundColor: iconBg || theme.backgroundSecondary }]}>
                {icon}
            </View>
            <Text style={[styles.statLabel, { color: theme.textMuted }]} numberOfLines={1}>
                {label}
            </Text>
            <View style={styles.statValueRow}>
                {statusDotColor && (
                    <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
                )}
                <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>
                    {value}
                </Text>
            </View>
            {hint && (
                <Text style={[styles.statHint, { color: theme.primary }]} numberOfLines={1}>
                    {hint}
                </Text>
            )}
        </>
    );

    if (!onPress) {
        return (
            <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                {content}
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
            onPress={handlePress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value}`}
        >
            {content}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    loadingBody: { padding: spacing.xl, gap: spacing.md },
    tabBody: { marginTop: spacing.md },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    content: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },
    titleSection: {
        marginBottom: spacing.sm,
    },
    titleInfo: {
        gap: spacing.xs,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: 2,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: font.xs,
        fontFamily: families.semibold,
    },
    quickActionsBar: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    quickActionBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: 4,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: 4,
    },
    quickActionIcon: {
        width: 32,
        height: 32,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionLabel: {
        fontSize: 10,
        fontFamily: families.bold,
        textAlign: 'center',
    },
    tabsWrapper: {
        marginBottom: spacing.xs,
    },
    grid: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.lg,
    },
    statItem: {
        flex: 1,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.xs,
        borderRadius: radius.lg,
        alignItems: 'center',
        borderWidth: 1,
        ...shadow.card,
    },
    statIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: families.medium,
        marginBottom: 2,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statValue: {
        fontSize: font.sm,
        fontFamily: families.bold,
    },
    statHint: {
        fontSize: 10,
        fontFamily: families.medium,
        marginTop: 2,
    },
    section: {
        marginBottom: spacing.lg,
    },
    rows: { gap: spacing.sm },
    notesBox: {
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.card,
    },
});
