import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useEnrollment } from '@/src/hooks/training';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import StatusBadge from '@/src/features/servicios-pro/StatusBadge';
import { BookOpen, PawPrint, Calendar, TrendingUp, ChevronRight } from 'lucide-react-native';

const STATUS_LABEL: Record<string, string> = { active: 'Activo', completed: 'Completado', cancelled: 'Cancelado', pending: 'Pendiente' };
const statusColorOf = (status: string, theme: any): string =>
    ({ active: theme.success, completed: theme.info, cancelled: theme.error } as Record<string, string>)[status] || theme.warning;

export default function MyEnrollmentsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const {
        enrollments,
        isEnrollmentsLoading,
        refetchEnrollments,
        isRefetchingEnrollments,
    } = useEnrollment();

    const renderEnrollment = ({ item }: { item: typeof enrollments[0] }) => {
        const statusInfo = { label: STATUS_LABEL[item.status] || STATUS_LABEL.pending, color: statusColorOf(item.status, theme) };

        return (
            <TouchableOpacity accessibilityRole="button"
                style={[styles.enrollmentCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                onPress={() => router.push(`/entrenadores/metas/${item.id}` as any)}
                activeOpacity={0.7}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.programIcon, { backgroundColor: theme.secondaryLight }]}>
                        <BookOpen size={20} color={theme.secondary} />
                    </View>
                    <View style={styles.cardHeaderInfo}>
                        <Text style={[styles.programTitle, { color: theme.text }]} numberOfLines={1}>
                            {item.programTitle}
                        </Text>
                        <View style={styles.petRow}>
                            <PawPrint size={12} color={theme.textMuted} />
                            <Text style={[styles.petName, { color: theme.textMuted }]}>{item.petName}</Text>
                        </View>
                    </View>
                    <StatusBadge label={statusInfo.label} color={statusInfo.color} dot />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <TrendingUp size={14} color={theme.textMuted} />
                        <Text style={[styles.progressLabel, { color: theme.textMuted }]}>{item.goals_total ? `${item.goals_done || 0} de ${item.goals_total} metas` : 'Sin metas aún'}</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.overlay }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    backgroundColor: statusInfo.color,
                                    width: item.status === 'completed' ? '100%' : item.goals_total ? `${Math.round(((item.goals_done || 0) / item.goals_total) * 100)}%` : '0%',
                                },
                            ]}
                        />
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <View style={styles.dateRow}>
                        <Calendar size={12} color={theme.textMuted} />
                        <Text style={[styles.dateText, { color: theme.textMuted }]}>
                            Inicio: {new Date(item.start_date).toLocaleDateString('es-MX')}
                        </Text>
                    </View>
                    <ChevronRight size={18} color={theme.textMuted} />
                </View>
                {item.status === 'completed' && (
                    <TouchableOpacity
                        onPress={() => router.push(`/entrenadores/${item.program_id}` as any)}
                        accessibilityRole="button"
                        accessibilityLabel="Calificar programa"
                        style={{ paddingTop: 10 }}
                    >
                        <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 13 }}>Calificar programa</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Mis Inscripciones" rightElement={<View style={styles.placeholder} />} />

            {isEnrollmentsLoading ? (
                <SkeletonList count={4} />
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
                            <View style={[styles.emptyIcon, { backgroundColor: theme.secondaryLight }]}>
                                <BookOpen size={40} color={theme.secondary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Sin inscripciones</Text>
                            <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
                                Explora nuestros programas de entrenamiento y ¡inscribe a tu mascota!
                            </Text>
                            <TouchableOpacity accessibilityRole="button"
                                style={[styles.exploreButton, { backgroundColor: theme.primary }]}
                                onPress={() => router.push('/entrenadores')}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.exploreButtonText}>Ver Programas</Text>
                            </TouchableOpacity>
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
        gap: 16,
    },
    loadingText: { fontSize: 16 },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 16,
    },
    enrollmentCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        gap: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    programIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardHeaderInfo: {
        flex: 1,
    },
    programTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    petRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    petName: {
        fontSize: 13,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    progressSection: { gap: 8 },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 32,
        gap: 12,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    emptyDesc: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    exploreButton: {
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 14,
        marginTop: 8,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});
