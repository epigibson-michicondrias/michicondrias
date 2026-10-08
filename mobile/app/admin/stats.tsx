import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminStats } from '@/src/hooks/admin/useAdminStats';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Users, ShieldCheck, Activity, BarChart2, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AdminStatsScreen() {
    const { theme } = useTheme();
    const { metrics, isLoading, kpis, roleDistribution } = useAdminStats();

    if (isLoading || !metrics) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: 60 }}><SkeletonList count={4} /></View>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Estadísticas"
                subtitle="Métricas en Tiempo Real"
                gradient={['#3b82f6', '#3b82f6E6', '#3b82f6CC']}
                rightElement={
                    <View style={styles.headerAction}>
                        <TrendingUp size={22} color="#fff" style={{ opacity: 0.8 }} />
                    </View>
                }
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.grid}>
                    <StatCard label="Usuarios" value={kpis!.total_users} icon={<Users size={20} color={theme.secondary} />} color={theme.secondary} theme={theme} />
                    <StatCard label="Aprobados" value={kpis!.approved_verifications} icon={<ShieldCheck size={20} color={theme.success} />} color={theme.success} theme={theme} />
                    <StatCard label="Pendientes" value={kpis!.pending_verifications} icon={<Activity size={20} color={theme.warning} />} color={theme.warning} theme={theme} />
                    <StatCard label="Admins" value={kpis!.system_admins} icon={<BarChart2 size={20} color={theme.info} />} color={theme.info} theme={theme} />
                    {kpis!.professionals !== undefined && <StatCard label="Profesionales" value={kpis!.professionals} icon={<ShieldCheck size={20} color={theme.info} />} color={theme.info} theme={theme} />}
                    {kpis!.new_users_7d !== undefined && <StatCard label="Nuevos 7 días" value={kpis!.new_users_7d} icon={<TrendingUp size={20} color="#ec4899" />} color="#ec4899" theme={theme} />}
                    {kpis!.new_users_30d !== undefined && <StatCard label="Nuevos 30 días" value={kpis!.new_users_30d} icon={<TrendingUp size={20} color={theme.secondary} />} color={theme.secondary} theme={theme} />}
                    {kpis!.active_users !== undefined && <StatCard label="Activos" value={kpis!.active_users} icon={<Activity size={20} color={theme.success} />} color={theme.success} theme={theme} />}
                </View>

                {!!metrics.registrations_14d?.length && (
                    <View style={[styles.chartBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.sectionHeader}>
                            <TrendingUp size={20} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Registros (14 días)</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 4 }}>
                            {metrics.registrations_14d.map((d) => {
                                const max = Math.max(...metrics.registrations_14d!.map((x) => x.count), 1);
                                return (
                                    <View key={d.date} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }} accessibilityLabel={`${d.date}: ${d.count} registros`}>
                                        <View style={{ width: '100%', height: Math.max((d.count / max) * 80, 3), borderRadius: 4, backgroundColor: theme.accent }} />
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                <View style={[styles.chartBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.sectionHeader}>
                        <BarChart2 size={20} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Distribución de Roles</Text>
                    </View>
                    {Object.entries(roleDistribution!).map(([role, count]) => (
                        <View key={role} style={styles.roleItem}>
                            <View style={styles.roleInfo}>
                                <Text style={[styles.roleName, { color: theme.text }]}>{role.toUpperCase()}</Text>
                                <Text style={[styles.rolePercentage, { color: theme.primary }]}>
                                    {kpis!.total_users ? ((count / kpis!.total_users) * 100).toFixed(1) : '0.0'}%
                                </Text>
                            </View>
                            <View style={[styles.progressBar, { backgroundColor: theme.background }]}>
                                <LinearGradient
                                    colors={theme.heroGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${Math.max(kpis!.total_users ? (count / kpis!.total_users) * 100 : 0, 5)}%` }]}
                                />
                            </View>
                            <Text style={[styles.roleCount, { color: theme.textMuted }]}>{count} usuarios registrados</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

function StatCard({ label, value, icon, color, theme }: any) {
    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>{icon}</View>
            <View>
                <Text style={[styles.cardValue, { color: theme.text }]}>{value}</Text>
                <Text style={[styles.cardLabel, { color: theme.textMuted }]}>{label.toUpperCase()}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 40,
    },
    loadingText: { 
        fontSize: 14, 
        fontWeight: '700', 
        letterSpacing: 0.5 
    },
    headerAction: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: { 
        padding: 20, 
        paddingBottom: 60, 
        paddingTop: 12,
        gap: 24 
    },
    grid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 16 
    },
    card: { 
        width: '47.5%', 
        padding: 20, 
        borderRadius: 28, 
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    iconBox: { 
        width: 48, 
        height: 48, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 16,
        elevation: 2,
    },
    cardValue: { 
        fontSize: 26, 
        fontWeight: '800', 
        letterSpacing: -0.5 
    },
    cardLabel: { 
        fontSize: 10, 
        fontWeight: '800', 
        marginTop: 4, 
        letterSpacing: 1 
    },
    chartBox: { 
        padding: 24, 
        borderRadius: 32, 
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    sectionHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: 28 
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '800' 
    },
    roleItem: { 
        marginBottom: 24 
    },
    roleInfo: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    roleName: { 
        fontSize: 13, 
        fontWeight: '800', 
        letterSpacing: 0.5 
    },
    rolePercentage: { 
        fontSize: 13, 
        fontWeight: '800' 
    },
    roleCount: { 
        fontSize: 11, 
        fontWeight: '700', 
        marginTop: 8, 
        textAlign: 'right' 
    },
    progressBar: { 
        height: 12, 
        borderRadius: 6, 
        overflow: 'hidden',
        elevation: 1,
    },
    progressFill: { 
        height: '100%', 
        borderRadius: 6 
    }
});
