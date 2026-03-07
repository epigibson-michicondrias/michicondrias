import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyClinics, getClinicAppointments, Clinic } from '../../src/services/directorio';
import { getClinicMetrics } from '../../src/services/metrics';
import { getCriticalPatients } from '../../src/services/patients';
import { getClinicAlerts } from '../../src/services/alerts';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Calendar, Settings, Activity, Users, ClipboardList, Stethoscope, Briefcase, PlusCircle, ChevronRight, MapPin, Star, Clock } from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function MiClinicaScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { user } = useAuth();

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });

    const clinic = clinics[0];

    // Obtener datos reales de APIs
    const { data: veterinaryMetrics, isLoading: loadingMetrics } = useQuery({
        queryKey: ['clinic-metrics', clinic?.id],
        queryFn: () => getClinicMetrics(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 60000, // Refrescar cada minuto
    });

    const { data: criticalPatients, isLoading: loadingPatients } = useQuery({
        queryKey: ['critical-patients', clinic?.id],
        queryFn: () => getCriticalPatients(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 30000, // Refrescar cada 30 segundos
    });

    const { data: veterinaryAlerts, isLoading: loadingAlerts } = useQuery({
        queryKey: ['clinic-alerts', clinic?.id],
        queryFn: () => getClinicAlerts(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 15000, // Refrescar cada 15 segundos
    });

    const { data: appointments = [], isLoading: loadingAppointments } = useQuery({
        queryKey: ['clinic-appointments', clinic?.id],
        queryFn: () => getClinicAppointments(clinic?.id || '0'),
        enabled: !!clinic?.id,
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === todayStr);
    const pendingAppointments = appointments.filter(a => a.status === 'pending');

    // Datos por defecto si las APIs no responden
    const metrics = veterinaryMetrics || {
        todayAppointments: 0,
        pendingConfirmations: 0,
        surgeriesToday: 0,
        emergencyCases: 0,
        vaccinationsToday: 0,
        checkupsToday: 0,
        labResultsPending: 0,
        prescriptionsActive: 0,
        inventoryAlerts: 0,
        dailyRevenue: 0,
        occupancyRate: 0,
        newPatientsToday: 0,
        criticalPatients: 0
    };

    const alerts = veterinaryAlerts || [];
    const patients = criticalPatients || [];

    if (loadingClinics) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={{ color: theme.textMuted, marginTop: 12, fontWeight: '600' }}>Cargando datos de clínica...</Text>
            </View>
        );
    }

    if (!clinic) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Mi Clínica</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Stethoscope size={80} color={theme.textMuted} strokeWidth={1} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No tienes clínicas registradas</Text>
                    <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                        Registra tu clínica veterinaria para comenzar a gestionar citas y expedientes médicos.
                    </Text>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/directorio/nuevo-lugar' as any)}
                    >
                        <PlusCircle size={20} color="#fff" />
                        <Text style={styles.primaryBtnText}>Registrar Clínica</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.titleBox}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{clinic.name}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={12} color={theme.textMuted} />
                        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>{clinic.city || 'Ubicación no definida'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={[styles.configBtn, { backgroundColor: theme.surface }]} onPress={() => router.push(`/mi-clinica/config/${clinic.id}` as any)}>
                    <Settings size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Clinic Profile Quick View */}
                <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
                    <Image
                        source={{ uri: clinic.logo_url || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=400' }}
                        style={styles.clinicLogo}
                    />
                    <View style={styles.profileInfo}>
                        <View style={styles.statusBox}>
                            <View style={[styles.statusBadge, { backgroundColor: clinic.is_approved ? '#10b98120' : '#f59e0b20' }]}>
                                <Text style={[styles.statusText, { color: clinic.is_approved ? '#10b981' : '#f59e0b' }]}>
                                    {clinic.is_approved ? '✓ Clínica Verificada' : '⏳ Pendiente de Aprobación'}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.ratingRow}>
                            <Star size={14} color="#facc15" fill="#facc15" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>Premium Provider</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity style={[styles.statItem, { backgroundColor: theme.surface }]} onPress={() => router.push('/mi-clinica/agenda' as any)}>
                        <Calendar size={24} color={theme.primary} />
                        <Text style={[styles.statValue, { color: theme.text }]}>{todayAppointments.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Citas Hoy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.statItem, { backgroundColor: theme.surface }]} onPress={() => router.push('/mi-clinica/agenda' as any)}>
                        <Activity size={24} color="#f59e0b" />
                        <Text style={[styles.statValue, { color: theme.text }]}>{pendingAppointments.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Por Confirmar</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Management Sections */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Gestión Operativa</Text>

                <View style={styles.menuGrid}>
                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/mi-clinica/agenda' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.primary + '15' }]}>
                            <ClipboardList size={24} color={theme.primary} />
                        </View>
                        <Text style={[styles.menuLabel, { color: theme.text }]}>Agenda</Text>
                        <Text style={[styles.menuSub, { color: theme.textMuted }]}>Gestionar citas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/mi-clinica/servicios' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.secondary + '15' }]}>
                            <Briefcase size={24} color={theme.secondary} />
                        </View>
                        <Text style={[styles.menuLabel, { color: theme.text }]}>Servicios</Text>
                        <Text style={[styles.menuSub, { color: theme.textMuted }]}>Catálogo pro</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/mi-clinica/veterinarios' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#10b98115' }]}>
                            <Users size={24} color="#10b981" />
                        </View>
                        <Text style={[styles.menuLabel, { color: theme.text }]}>Vets</Text>
                        <Text style={[styles.menuSub, { color: theme.textMuted }]}>Tu Equipo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/mi-clinica/horarios' as any)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: '#f59e0b15' }]}>
                            <Clock size={24} color="#f59e0b" />
                        </View>
                        <Text style={[styles.menuLabel, { color: theme.text }]}>Horarios</Text>
                        <Text style={[styles.menuSub, { color: theme.textMuted }]}>Disponibilidad</Text>
                    </TouchableOpacity>
                </View>

                {/* Latest Activity / Pending Items */}
                <View style={styles.activityHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Citas Pendientes</Text>
                    <TouchableOpacity onPress={() => router.push('/mi-clinica/agenda' as any)}>
                        <Text style={{ color: theme.primary, fontWeight: '700' }}>Ver todo</Text>
                    </TouchableOpacity>
                </View>

                {loadingAppointments ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                ) : pendingAppointments.length === 0 ? (
                    <View style={[styles.emptyRecent, { backgroundColor: theme.surface }]}>
                        <Text style={{ color: theme.textMuted, fontWeight: '600' }}>No hay citas pendientes de confirmación</Text>
                    </View>
                ) : (
                    pendingAppointments.slice(0, 3).map(appt => (
                        <TouchableOpacity
                            key={appt.id}
                            style={[styles.activityItem, { backgroundColor: theme.surface }]}
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: '900' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    headerSubtitle: { fontSize: 12, fontWeight: '600' },
    configBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    content: { paddingHorizontal: 24, paddingBottom: 100 },
    profileCard: { flexDirection: 'row', padding: 20, borderRadius: 28, alignItems: 'center', gap: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    clinicLogo: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#7c3aed' },
    profileInfo: { flex: 1, gap: 6 },
    statusBox: { flexDirection: 'row', alignItems: 'center' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    statusText: { fontSize: 10, fontWeight: '800' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ratingText: { fontSize: 12, fontWeight: '700' },
    statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    statItem: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statValue: { fontSize: 22, fontWeight: '900' },
    statLabel: { fontSize: 11, fontWeight: '700' },
    sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
    menuItem: { width: (width - 64) / 2, padding: 20, borderRadius: 28, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 16, fontWeight: '800' },
    menuSub: { fontSize: 12, fontWeight: '600' },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    emptyRecent: { padding: 30, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' },
    activityItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    apptIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    apptInfo: { flex: 1, gap: 2 },
    apptTitle: { fontSize: 15, fontWeight: '800' },
    apptSub: { fontSize: 12, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 20, marginTop: 100 },
    emptyTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
    emptySubtitle: { fontSize: 14, fontWeight: '600', textAlign: 'center', lineHeight: 22 },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 20 },
    primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});
