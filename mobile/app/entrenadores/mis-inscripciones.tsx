import React from 'react';
import { SkeletonList } from '@/src/components/Skeleton';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useEnrollment } from '@/src/hooks/training/useEnrollment';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import StatusBadge from '@/src/features/servicios-pro/StatusBadge';
import { BookOpen, PawPrint, Calendar, TrendingUp, ChevronRight } from 'lucide-react-native';
import { font, spacing } from '@/constants/design';

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
                        style={{ paddingTop: spacing.md }}
                    >
                        <Text style={{ color: theme.primary, fontWeight: '800', fontSize: font.base }}>Calificar programa</Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Mis Inscripciones" />

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.lg,
    },
    loadingText: { fontSize: font.xl },
    listContent: {
        paddingHorizontal: spacing.xxl,
        paddingBottom: spacing.huge,
        gap: spacing.lg,
    },
    enrollmentCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: spacing.xl,
        gap: spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
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
        fontSize: font.xl,
        fontWeight: '700',
    },
    petRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.xxs,
    },
    petName: {
        fontSize: font.base,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 10,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    progressSection: { gap: spacing.sm },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    progressLabel: {
        fontSize: font.md,
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
        gap: spacing.sm,
    },
    dateText: {
        fontSize: font.md,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: spacing.xxxl,
        gap: spacing.md,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    emptyTitle: {
        fontSize: font.h3,
        fontWeight: '800',
    },
    emptyDesc: {
        fontSize: font.base,
        textAlign: 'center',
        lineHeight: 20,
    },
    exploreButton: {
        paddingHorizontal: spacing.xxxl,
        paddingVertical: spacing.lg,
        borderRadius: 14,
        marginTop: spacing.sm,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: font.lg,
        fontWeight: '700',
    },
});
