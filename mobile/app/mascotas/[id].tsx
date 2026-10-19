import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import { usePetDetail } from '@/src/hooks/mascotas/usePetDetail';
import { formatAge, formatWeight, getSpeciesLabel, capitalize } from '@/src/utils/formatters';
import BackButton from '@/src/components/BackButton';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { Settings, Award, Activity, Calendar, ChevronRight, LayoutGrid, HeartPulse, ClipboardList, Share2 } from 'lucide-react-native';
import SegmentedControl from '@/src/components/SegmentedControl';
import { Skeleton } from '@/src/components/Skeleton';
import { usePetHealth } from '@/src/hooks/carnet/usePetHealth';
import { PetHealthTab, PetHistoryTab } from '@/src/features/mascotas/PetHealthTabs';
import { PetPassportShare } from '@/src/features/mascotas/PetPassportShare';
import { spacing, radius, type, shadow, layout, font } from '@/constants/design';

const { width } = Dimensions.get('window');

const VACCINE_STATUS_LABEL = {
    'al-dia': 'Al día',
    'vencido': 'Vencido',
    'sin-registro': 'Sin vacunas',
} as const;

export default function PetProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
        const errorCopy = status === 403
            ? 'No tienes permiso para ver esta mascota.'
            : status === 404
                ? 'Esta mascota ya no existe o fue eliminada.'
                : 'No pudimos cargar a tu mascota. Revisa tu conexión.';
        return (
            <ScreenContainer style={styles.center}>
                <Text style={{ color: theme.error }}>{errorCopy}</Text>
                {status !== 403 && status !== 404 && (
                    <TouchableOpacity onPress={() => refetch()} style={[styles.backBtn, { backgroundColor: theme.primary }]} accessibilityRole="button">
                        <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Reintentar</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={goBack} style={[styles.backBtn, { backgroundColor: theme.surface }]}>
                    <Text style={{ color: theme.text }}>Regresar</Text>
                </TouchableOpacity>
            </ScreenContainer>
        );
    }

    const speciesLabel = getSpeciesLabel(pet.species);
    const formattedBreed = pet.breed ? capitalize(pet.breed) : speciesLabel;
    const genderText = pet.gender === 'macho' ? 'Macho ♂️' : pet.gender === 'hembra' ? 'Hembra ♀️' : 'Sin género';

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    {pet.photo_url ? (
                        <Image source={{ uri: pet.photo_url }} style={styles.mainImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.mainImage, styles.center, { backgroundColor: theme.backgroundSecondary }]}>
                            <Text style={styles.fallbackEmoji}>{pet.species === 'gato' ? '🐱' : '🐶'}</Text>
                        </View>
                    )}
                    <View style={[styles.headerButtons, { top: Math.max(insets.top + spacing.xs, spacing.md) }]}>
                        <BackButton onPress={goBack} color={theme.onPrimary} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} />
                        {isOwner && (
                            <View style={styles.headerActions}>
                                <TouchableOpacity
                                    style={styles.iconBtn}
                                    onPress={openShare}
                                    accessibilityRole="button"
                                    accessibilityLabel="Compartir carnet"
                                >
                                    <Share2 size={layout.icon.md} color={theme.onPrimary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.iconBtn}
                                    onPress={() => router.push(`/mascotas/editar/${pet.id}`)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Editar mascota"
                                >
                                    <Settings size={layout.icon.md} color={theme.onPrimary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Content */}
                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.titleSection}>
                        <View style={{ flex: 1, gap: spacing.xxs }}>
                            <Text style={[type.display, { color: theme.text }]} numberOfLines={1}>{pet.name}</Text>
                            <Text style={[type.body, { color: theme.textMuted }]} numberOfLines={1}>
                                {formattedBreed} • {genderText}
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
                    {tab === 'historial' && <View style={styles.tabBody}><PetHistoryTab health={health} petId={pet.id} /></View>}

                    {tab === 'resumen' && (<>
                    {/* Stats Grid */}
                    <View style={styles.grid}>
                        <PetStat icon={<Calendar size={layout.icon.md} color={theme.accent} />} label="Edad" value={formatAge(pet.age_months)} theme={theme} />
                        <PetStat icon={<Activity size={layout.icon.md} color={theme.secondary} />} label="Peso" value={formatWeight(pet.weight_kg)} theme={theme} />
                        <PetStat
                            icon={<Award size={layout.icon.md} color={theme.warning} />}
                            label="Vacunas"
                            value={VACCINE_STATUS_LABEL[health.vaccinesStatus] ?? 'Sin vacunas'}
                            theme={theme}
                        />
                    </View>

                    {/* Seguimiento GPS (solo el dueño). Con la suscripción activa hay salida: facturación */}
                    {isOwner && (
                        <View style={styles.section}>
                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                                onPress={pet.has_active_subscription ? openTrackerBilling : handleSubscribeMichiTracker}
                                disabled={isSubscribing || isOpeningBilling}
                                accessibilityRole="button"
                                activeOpacity={0.88}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: theme.successLight }]}>
                                    <Text style={{ fontSize: font.h2 }}>🛰️</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[type.subtitle, { color: theme.text }]}>Michi-Tracker Pro</Text>
                                    <Text style={[type.caption, { color: theme.textMuted, marginTop: spacing.xxs }]}>
                                        {pet.has_active_subscription
                                            ? 'Seguimiento GPS activo · Gestionar suscripción'
                                            : isSubscribing ? 'Abriendo...' : 'Activar seguimiento GPS en tiempo real'}
                                    </Text>
                                </View>
                                <ChevronRight size={layout.icon.md} color={theme.textMuted} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Servicios y recuerdo (solo el dueño) */}
                    {isOwner && (
                        <View style={styles.section}>
                            <Text style={[type.title, { color: theme.text, marginBottom: spacing.md }]}>Servicios Adicionales</Text>
                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                                onPress={() => router.push({ pathname: '/funeraria/memorial/[petId]', params: { petId: pet.id } } as any)}
                                activeOpacity={0.88}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: theme.errorLight }]}>
                                    <Text style={{ fontSize: font.h2 }}>🕯️</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[type.subtitle, { color: theme.text }]}>Memorial y Recuerdo</Text>
                                    <Text style={[type.caption, { color: theme.textMuted, marginTop: spacing.xxs }]}>Crear o ver el espacio de homenaje</Text>
                                </View>
                                <ChevronRight size={layout.icon.md} color={theme.textMuted} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                                onPress={() => router.push({ pathname: '/grooming/historial/[petId]', params: { petId: pet.id } } as any)}
                                activeOpacity={0.88}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: theme.primaryLight }]}>
                                    <Text style={{ fontSize: font.h2 }}>✂️</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[type.subtitle, { color: theme.text }]}>Historial de Estética</Text>
                                    <Text style={[type.caption, { color: theme.textMuted, marginTop: spacing.xxs }]}>Consultar visitas y fotos de grooming</Text>
                                </View>
                                <ChevronRight size={layout.icon.md} color={theme.textMuted} />
                            </TouchableOpacity>
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
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Carnet compartible con QR (solo el dueño lo abre) */}
            <PetPassportShare url={shareUrl} petName={pet.name} onClose={closeShare} />
        </ScreenContainer>
    );
}

function PetStat({ icon, label, value, theme }: { icon: any; label: string; value: string; theme: any }) {
    return (
        <View style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            {icon}
            <Text style={[type.label, { color: theme.textMuted }]} numberOfLines={1}>{label}</Text>
            <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>{value}</Text>
        </View>
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
    imageContainer: {
        width: width,
        height: 380,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    fallbackEmoji: {
        fontSize: 96,
    },
    headerButtons: {
        position: 'absolute',
        left: spacing.lg,
        right: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconBtn: {
        width: layout.minTouch,
        height: layout.minTouch,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        ...shadow.card,
    },
    content: {
        padding: spacing.xl,
        marginTop: -spacing.xxl,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        ...shadow.raised,
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
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        gap: spacing.lg,
        borderWidth: 1,
        ...shadow.card,
    },
    actionIcon: {
        width: layout.iconBox.lg,
        height: layout.iconBox.lg,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notesBox: {
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.card,
    },
    backBtn: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
