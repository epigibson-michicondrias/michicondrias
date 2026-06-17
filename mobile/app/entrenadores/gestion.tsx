import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useTrainerDashboard } from '@/src/hooks/training';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Plus, Users, Dumbbell, Target, Calendar, ChevronRight } from 'lucide-react-native';
import type { TrainingEnrollment } from '@/src/services/training';

const STATUS_COLORS: Record<string, string> = {
    active: '#22c55e',
    completed: '#3b82f6',
    cancelled: '#ef4444',
    pending: '#f59e0b',
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Activo',
    completed: 'Completado',
    cancelled: 'Cancelado',
    pending: 'Pendiente',
};

export default function TrainerDashboardScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const {
        enrollments,
        isEnrollmentsLoading,
        refetchEnrollments,
        isRefetchingEnrollments,
    } = useTrainerDashboard();

    // Compute stats
    const totalActive = enrollments.filter(e => e.status === 'active').length;
    const totalCompleted = enrollments.filter(e => e.status === 'completed').length;

    const renderEnrollment = ({ item }: { item: TrainingEnrollment }) => {
        const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
        const statusLabel = STATUS_LABELS[item.status] || 'Pendiente';

        return (
            <TouchableOpacity
                style={[styles.enrollmentCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                onPress={() => router.push(`/entrenadores/metas/${item.id}`)}
                activeOpacity={0.7}
            >
                <View style={styles.enrollmentHeader}>
                    <View style={[styles.enrollmentIcon, { backgroundColor: theme.secondaryLight }]}>
                        <Users size={18} color={theme.secondary} />
                    </View>
                    <View style={styles.enrollmentInfo}>
                        <Text style={[styles.enrollmentPet, { color: theme.text }]}>
                            Mascota: {item.pet_id.substring(0, 8)}...
                        </Text>
                        <Text style={[styles.enrollmentProgram, { color: theme.textMuted }]}>
                            Programa: {item.program_id.substring(0, 8)}...
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                </View>

                <View style={styles.enrollmentFooter}>
                    <View style={styles.dateInfo}>
                        <Calendar size={12} color={theme.textMuted} />
                        <Text style={[styles.dateText, { color: theme.textMuted }]}>
                            {new Date(item.start_date).toLocaleDateString('es-MX')}
                        </Text>
                    </View>
                    <View style={styles.manageRow}>
                        <Text style={[styles.manageText, { color: theme.primary }]}>Gestionar metas</Text>
                        <ChevronRight size={16} color={theme.primary} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Panel Entrenador"
                rightElement={<View style={styles.placeholder} />}
            />

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: theme.primaryLight }]}
                    onPress={() => router.push('/entrenadores/nuevo-programa')}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionIconBg, { backgroundColor: theme.primary }]}>
                        <Plus size={20} color="#fff" />
                    </View>
                    <Text style={[styles.actionLabel, { color: theme.primary }]}>Nuevo Programa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: theme.secondaryLight }]}
                    activeOpacity={0.7}
                >
                    <View style={[styles.actionIconBg, { backgroundColor: theme.secondary }]}>
                        <Target size={20} color="#fff" />
                    </View>
                    <Text style={[styles.actionLabel, { color: theme.secondary }]}>Metas</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={[styles.statsContainer, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: theme.primary }]}>{enrollments.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#22c55e' }]}>{totalActive}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Activos</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{totalCompleted}</Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Completos</Text>
                </View>
            </View>

            {/* Enrollments Section Title */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Inscripciones</Text>
                <Dumbbell size={18} color={theme.textMuted} />
            </View>

            {isEnrollmentsLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={enrollments}
                    renderItem={renderEnrollment}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefetchingEnrollments}
                    onRefresh={refetchEnrollments}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Users size={48} color={theme.textMuted} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin inscripciones</Text>
                            <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
                                Aún no tienes clientes inscritos en tus programas.
                            </Text>
                        </View>
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    placeholder: { width: 24 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 20,
    },
    actionCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    actionIconBg: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 12,
    },
    enrollmentCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 14,
    },
    enrollmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    enrollmentIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enrollmentInfo: { flex: 1 },
    enrollmentPet: {
        fontSize: 14,
        fontWeight: '700',
    },
    enrollmentProgram: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    enrollmentFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: { fontSize: 12 },
    manageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    manageText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    emptyDesc: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});
