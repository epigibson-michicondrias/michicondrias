import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useMyClinic } from '@/src/hooks/directorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Calendar, Settings, Activity, Users, ClipboardList, Stethoscope, Briefcase, ChevronRight, Clock, Package, FlaskConical, FileText, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MiClinicaScreen() {
    const router = useRouter();
    const { theme } = useTheme();
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
                subtitle={clinic.city || 'Sede Central'}
                actionIcon={Settings}
                onAction={() => router.push(`/mi-clinica/config/${clinic.id}` as any)}
                gradient={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
            />

            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Clinic Profile Quick View */}
                    <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Image
                            source={{ uri: clinic.logo_url || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=400' }}
                            style={styles.clinicLogo}
                        />
                        <View style={styles.profileInfo}>
                            <View style={styles.statusBox}>
                                <View style={[styles.statusBadge, { backgroundColor: clinic.is_approved ? '#10b98115' : '#f59e0b15' }]}>
                                    <Text style={[styles.statusText, { color: clinic.is_approved ? '#10b981' : '#f59e0b' }]}>
                                        {clinic.is_approved ? '✓ VERIFICADA' : '⏳ PENDIENTE'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.ratingText, { color: theme.text, fontSize: 14, fontWeight: '800' }]}>Clínica Asociada</Text>
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
                            <View style={[styles.statIconBox, { backgroundColor: '#f59e0b15' }]}>
                                <Activity size={20} color="#f59e0b" />
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
                        <MenuItem icon={ClipboardList} color={theme.primary} label="Agenda" sub="Gestionar citas" onPress={() => router.push('/mi-clinica/agenda' as any)} theme={theme} />
                        <MenuItem icon={Briefcase} color={theme.secondary} label="Servicios" sub="Catálogo pro" onPress={() => router.push('/mi-clinica/servicios' as any)} theme={theme} />
                        <MenuItem icon={Users} color="#10b981" label="Vets" sub="Tu Equipo" onPress={() => router.push('/mi-clinica/veterinarios' as any)} theme={theme} />
                        <MenuItem icon={Clock} color="#f59e0b" label="Horarios" sub="Disponibilidad" onPress={() => router.push('/mi-clinica/horarios' as any)} theme={theme} />
                        <MenuItem icon={Stethoscope} color="#ef4444" label="Cirugías" sub="Quirófano" onPress={() => router.push('/mi-clinica/cirugias' as any)} theme={theme} />
                        <MenuItem icon={Package} color="#8b5cf6" label="Inventario" sub="Insumos médicos" onPress={() => router.push('/mi-clinica/inventario' as any)} theme={theme} />
                        <MenuItem icon={FlaskConical} color="#0ea5e9" label="Laboratorio" sub="Pruebas y resultados" onPress={() => router.push('/mi-clinica/laboratorio' as any)} theme={theme} />
                        <MenuItem icon={FileText} color="#10b981" label="Recetas" sub="Prescripciones" onPress={() => router.push('/mi-clinica/recetas' as any)} theme={theme} />
                        <MenuItem icon={AlertTriangle} color="#f43f5e" label="Pacientes" sub="General y Críticos" onPress={() => router.push('/mi-clinica/pacientes' as any)} theme={theme} />
                    </View>

                    {/* Revenue & Occupancy Section */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Métricas Financieras</Text>

                    <View style={styles.metricsRow}>
                        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={[styles.metricIconBox, { backgroundColor: '#10b98115' }]}>
                                <DollarSign size={20} color="#10b981" />
                            </View>
                            <Text style={[styles.metricValue, { color: theme.text }]}>
                                ${metrics.dailyRevenue?.toLocaleString() || '0'}
                            </Text>
                            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Ingresos Hoy</Text>
                        </View>
                        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={[styles.metricIconBox, { backgroundColor: '#8b5cf615' }]}>
                                <BarChart3 size={20} color="#8b5cf6" />
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
                        <TouchableOpacity onPress={() => router.push('/mi-clinica/agenda' as any)}>
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
                                    <Text style={{ fontSize: 18 }}>📅</Text>
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    contentScroll: { flex: 1 },
    content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 },
    profileCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    clinicLogo: { width: 60, height: 60, borderRadius: 30 },
    profileInfo: { flex: 1, gap: 4 },
    statusBox: { flexDirection: 'row', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    statusText: { fontSize: 10, fontWeight: '900' },
    ratingText: { fontSize: 12, fontWeight: '700' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
    },
    statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '900' },
    statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
    menuItem: {
        width: (width - 60) / 2,
        padding: 16,
        borderRadius: 24,
        gap: 12,
        borderWidth: 1,
    },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 15, fontWeight: '800' },
    menuSub: { fontSize: 11, fontWeight: '600' },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, gap: 14, marginBottom: 10, borderWidth: 1 },
    apptIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    apptInfo: { flex: 1, gap: 2 },
    apptTitle: { fontSize: 14, fontWeight: '800' },
    apptSub: { fontSize: 11, fontWeight: '600' },
    metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    metricCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center', gap: 8 },
    metricIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    metricValue: { fontSize: 22, fontWeight: '900' },
    metricLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
