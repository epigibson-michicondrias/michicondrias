import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getAdminAnalytics, AnalyticsMetrics } from '../../src/services/analytics';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Users, ShieldCheck, Activity, BarChart2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AdminStatsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: metrics, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getAdminAnalytics,
    });

    if (isLoading || !metrics) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const { kpis, role_distribution } = metrics;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Métricas</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Resumen global de plataforma</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.grid}>
                    <StatCard label="Usuarios" value={kpis.total_users} icon={<Users size={20} color="#7c3aed" />} color="#7c3aed" theme={theme} />
                    <StatCard label="Aprobados" value={kpis.approved_verifications} icon={<ShieldCheck size={20} color="#10b981" />} color="#10b981" theme={theme} />
                    <StatCard label="Pendientes" value={kpis.pending_verifications} icon={<Activity size={20} color="#f59e0b" />} color="#f59e0b" theme={theme} />
                    <StatCard label="Admins" value={kpis.system_admins} icon={<BarChart2 size={20} color="#3b82f6" />} color="#3b82f6" theme={theme} />
                </View>

                <View style={[styles.chartBox, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Distribución de Roles</Text>
                    {Object.entries(role_distribution).map(([role, count]) => (
                        <View key={role} style={styles.roleItem}>
                            <View style={styles.roleInfo}>
                                <Text style={[styles.roleName, { color: theme.text }]}>{role.toUpperCase()}</Text>
                                <Text style={[styles.roleCount, { color: theme.textMuted }]}>{count}</Text>
                            </View>
                            <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                <View style={[styles.progressFill, { width: `${(count / kpis.total_users) * 100}%`, backgroundColor: theme.primary }]} />
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

function StatCard({ label, value, icon, color, theme }: any) {
    return (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>{icon}</View>
            <Text style={[styles.cardValue, { color: theme.text }]}>{value}</Text>
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 13,
    },
    scroll: {
        padding: 24,
        gap: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    card: {
        width: (width - 64) / 2,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardValue: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    chartBox: {
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 24,
    },
    roleItem: {
        marginBottom: 20,
    },
    roleInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    roleName: {
        fontSize: 12,
        fontWeight: '800',
    },
    roleCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    }
});
