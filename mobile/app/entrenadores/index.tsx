import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TrainingProgram } from '../../src/services/training';
import { usePrograms } from '@/src/hooks/training/usePrograms';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { Dumbbell, Clock, DollarSign, ChevronRight, Plus } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { font, spacing, layout } from '@/constants/design';

export default function EntrenadoresScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();

    const roleName = user?.role_name || '';
    const isTrainer = roleName === 'entrenador' || roleName === 'admin';

    const { programs, isLoading, refetch, isRefetching } = usePrograms();

    const renderProgramItem = ({ item }: { item: TrainingProgram }) => (
        <TouchableOpacity accessibilityRole="button"
            style={[styles.programCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/entrenadores/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.programHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.secondary + '20' }]}>
                    <Dumbbell size={24} color={theme.secondary} />
                </View>
                <View style={styles.programInfo}>
                    <Text style={[styles.programName, { color: theme.text }]}>{item.title}</Text>
                    {item.description && (
                        <Text style={[styles.programDesc, { color: theme.textMuted }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <View style={[styles.arrowButton, { backgroundColor: theme.border + '40' }]}>
                    <ChevronRight size={16} color={theme.textMuted} />
                </View>
            </View>

            <View style={styles.programStats}>
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.primary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        ${item.price.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Precio</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Clock size={14} color={theme.secondary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        {item.duration_weeks} semanas
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Duración</Text>
                </View>
            </View>

            <View style={styles.programFooter}>
                <View style={[styles.trainerTag, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.trainerText, { color: theme.primary }]}>
                        Entrenador: {item.trainer_name || 'Sin nombre'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const listHeader = (
        <View style={styles.actionButtons}>
            {isTrainer ? (
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/entrenadores/nuevo-programa' as any)}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Nuevo Programa</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity accessibilityRole="button"
                    style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                    onPress={() => router.push('/entrenadores/mis-inscripciones' as any)}
                >
                    <Dumbbell size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mis Inscripciones</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Entrenadores"
                subtitle="Programas de entrenamiento para tu mascota"
            />

            <DataList
                data={programs}
                renderItem={renderProgramItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando programas..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                header={listHeader}
                emptyIcon={<Dumbbell size={32} color={theme.textMuted} />}
                emptyTitle="Sin programas"
                emptySubtitle="No hay programas de entrenamiento disponibles"
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        gap: spacing.sm,
    },
    actionButtonText: {
        fontSize: font.base,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 100,
    },
    programCard: {
        padding: spacing.xl,
        borderRadius: 16,
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    programHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    programInfo: {
        flex: 1,
    },
    programName: {
        fontSize: font.xxl,
        fontWeight: '800',
        marginBottom: spacing.xs,
    },
    programDesc: {
        fontSize: font.base,
        lineHeight: 18,
    },
    arrowButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    programStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.2)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128,128,128,0.2)',
        marginBottom: spacing.lg,
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(128,128,128,0.25)',
    },
    statText: {
        fontSize: font.xl,
        fontWeight: '700',
        marginTop: spacing.xs,
    },
    statLabel: {
        fontSize: font.sm,
        marginTop: spacing.xxs,
    },
    programFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    trainerTag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    trainerText: {
        fontSize: font.sm,
        fontWeight: '600',
    },
});
