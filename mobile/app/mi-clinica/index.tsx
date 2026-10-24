import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useMyClinic } from '@/src/hooks/directorio/useMyClinic';
import { useAuth } from '@/src/contexts/AuthContext';
import { canAccessRoute, getRoleTools } from '@/src/constants/roleTools';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Calendar, Settings, Activity, Stethoscope, ChevronRight, DollarSign, BarChart3 } from 'lucide-react-native';
import { font, spacing, layout } from '@/constants/design';

const { width } = Dimensions.get('window');

export default function MiClinicaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    // El mismo criterio que ROLE_TOOLS / ROUTE_ACCESS: cada entrada se muestra solo al rol que puede abrirla.
    const role = user?.role_name ?? null;
    // Menú = herramientas de /mi-clinica del rol (fuente única ROLE_TOOLS), sin la propia "Mi clínica".
    const menuTools = getRoleTools(role).filter((t) => t.route.startsWith('/mi-clinica/') && canAccessRoute(role, t.route));
    const {
        clinic,
        loadingClinics,
        metrics,
        todayAppointments,
        pendingAppointments,
        revenueData,
        occupancyData,
        revenuePeriod,
        setRevenuePeriod,
        goBack,
        goToRegister,
    } = useMyClinic();

    if (loadingClinics) {
        return (
            <ScreenContainer style={styles.center}>
                <LoadingOverlay message="Cargando datos de clínica..." />
            </ScreenContainer>
        );
    }

    if (!clinic) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Mi Clínica" />
                <EmptyState
                    icon={<Stethoscope size={80} color={theme.textMuted} strokeWidth={1} />}
                    title="No tienes clínicas registradas"
                    subtitle="Registra tu clínica veterinaria para comenzar a gestionar citas y expedientes médicos."
                    actionLabel="Registrar Clínica"
                    onAction={goToRegister}
                />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title={clinic.name}
                subtitle={clinic.city || undefined}
                actionIcon={Settings}
                onAction={() => router.push(`/mi-clinica/config/${clinic.id}` as any)}
            />

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Clinic Profile Quick View */}
                    <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        {clinic.logo_url ? (
                            <Image source={{ uri: clinic.logo_url }} style={styles.clinicLogo} />
                        ) : (
                            <View style={[styles.clinicLogo, { backgroundColor: theme.primary + '15', alignItems: 'center', justifyContent: 'center' }]}>
                                <Stethoscope size={32} color={theme.primary} />
                            </View>
                        )}
                        <View style={styles.profileInfo}>
                            <View style={styles.statusBox}>
                                <View style={[styles.statusBadge, { backgroundColor: clinic.is_approved ? theme.successLight : theme.warningLight }]}>
                                    <Text style={[styles.statusText, { color: clinic.is_approved ? theme.success : theme.warning }]}>
                                        {clinic.is_approved ? 'VERIFICADA' : 'EN REVISIÓN: aún no aparece en el directorio'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.ratingText, { color: theme.textMuted, fontSize: font.base, fontWeight: '600' }]} numberOfLines={2}>{clinic.address || 'Sin dirección registrada'}</Text>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <TouchableOpacity
                            style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => router.push('/mi-clinica/agenda' as any)}
                        >
                            <View style={[styles.statIconBox, { backgroundColor: theme.primary + '15' }]}>
                                <Calendar size={20} color={theme.primary} />
                            </View>
                            <View>
                                <Text style={[styles.statValue, { color: theme.text }]}>{todayAppointments.length}</Text>
                                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Citas hoy</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.statItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => router.push('/mi-clinica/agenda' as any)}
                        >
                            <View style={[styles.statIconBox, { backgroundColor: theme.warning + '15' }]}>
                                <Activity size={20} color={theme.warning} />
                            </View>
                            <View>
                                <Text style={[styles.statValue, { color: theme.text }]}>{pendingAppointments.length}</Text>
                                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Pendientes</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Main Management Sections */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Gestión Operativa</Text>

                    <View style={styles.menuGrid}>
                        {menuTools.map((t) => (
                            <MenuItem key={t.id} icon={t.icon} color={t.color} label={t.label} sub={t.desc} onPress={() => router.push(t.route as any)} theme={theme} />
                        ))}
                    </View>

                    {/* Revenue & Occupancy Section */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Métricas Financieras</Text>

                    <View style={styles.metricsRow}>
                        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={[styles.metricIconBox, { backgroundColor: theme.success + '15' }]}>
                                <DollarSign size={20} color={theme.success} />
                            </View>
                            <Text style={[styles.metricValue, { color: theme.text }]}>
                                ${metrics.dailyRevenue?.toLocaleString() || '0'}
                            </Text>
                            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Ingresos Hoy</Text>
                        </View>
                        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={[styles.metricIconBox, { backgroundColor: theme.primary + '15' }]}>
                                <BarChart3 size={20} color={theme.primary} />
                            </View>
                            <Text style={[styles.metricValue, { color: theme.text }]}>
                                {metrics.occupancyRate || 0}%
                            </Text>
                            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Ocupación</Text>
                        </View>
                    </View>

                    {/* Pending Appointments */}
                    <View style={styles.activityHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Citas Pendientes</Text>
                        <TouchableOpacity onPress={() => router.push('/mi-clinica/agenda' as any)} accessibilityRole="button" accessibilityLabel="Ver toda la agenda">
                            <Text style={{ color: theme.primary, fontWeight: '700' }}>Ver todo</Text>
                        </TouchableOpacity>
                    </View>

                    {pendingAppointments.length === 0 ? (
                        <EmptyState
                            icon={<Calendar size={32} color={theme.textMuted} />}
                            title="No hay citas pendientes de confirmación"
                        />
                    ) : (
                        pendingAppointments.slice(0, 3).map(appt => (
                            <TouchableOpacity
                                key={appt.id}
                                style={[styles.activityItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                                onPress={() => router.push('/mi-clinica/agenda' as any)}
                            >
                                <View style={[styles.apptIcon, { backgroundColor: theme.primary + '15' }]}>
                                    <Calendar size={18} color={theme.primary} />
                                </View>
                                <View style={styles.apptInfo}>
                                    <Text style={[styles.apptTitle, { color: theme.text }]}>{appt.service_name}</Text>
                                    <Text style={[styles.apptSub, { color: theme.textMuted }]}>
                                        {appt.date} · {appt.start_time}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={theme.textMuted} />
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

/** Reusable menu item component for the grid */
function MenuItem({ icon: Icon, color, label, sub, onPress, theme }: {
    icon: any; color: string; label: string; sub: string; onPress: () => void; theme: any;
}) {
    return (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={onPress}
        >
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Icon size={24} color={color} />
            </View>
            <Text style={[styles.menuLabel, { color: theme.text }]}>{label}</Text>
            <Text style={[styles.menuSub, { color: theme.textMuted }]}>{sub}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.huge },
    contentScroll: { flex: 1 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.xxl, paddingBottom: 100 },
    profileCard: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: 24,
        alignItems: 'center',
        gap: spacing.lg,
        marginBottom: spacing.xxl,
        borderWidth: 1,
    },
    clinicLogo: { width: 60, height: 60, borderRadius: 30 },
    profileInfo: { flex: 1, gap: spacing.xs },
    statusBox: { flexDirection: 'row', alignItems: 'center' },
    statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 6, alignSelf: 'flex-start' },
    statusText: { fontSize: font.xs, fontWeight: '900' },
    ratingText: { fontSize: font.md, fontWeight: '700' },
    statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxxl },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: 20,
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1,
    },
    statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: font.xxl, fontWeight: '900' },
    statLabel: { fontSize: font.xs, fontWeight: '700', textTransform: 'uppercase' },
    sectionTitle: { fontSize: font.base, fontWeight: '900', marginBottom: spacing.lg, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xxxl },
    menuItem: {
        width: Math.floor((width - 61) / 2),
        padding: spacing.lg,
        borderRadius: 24,
        gap: spacing.md,
        borderWidth: 1,
    },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: font.lg, fontWeight: '800' },
    menuSub: { fontSize: font.sm, fontWeight: '600' },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    activityItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: 20, gap: spacing.lg, marginBottom: spacing.md, borderWidth: 1 },
    apptIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    apptInfo: { flex: 1, gap: spacing.xxs },
    apptTitle: { fontSize: font.base, fontWeight: '800' },
    apptSub: { fontSize: font.sm, fontWeight: '600' },
    metricsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxxl },
    metricCard: { flex: 1, padding: spacing.lg, borderRadius: 20, borderWidth: 1, alignItems: 'center', gap: spacing.sm },
    metricIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    metricValue: { fontSize: font.h2, fontWeight: '900' },
    metricLabel: { fontSize: font.sm, fontWeight: '600', textAlign: 'center' },
});
