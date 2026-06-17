import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TrainingProgram } from '../../src/services/training';
import { usePrograms } from '@/src/hooks/training';
import { useTheme } from '@/src/hooks/useTheme';
import { useAuth } from '@/src/contexts/AuthContext';
import { Dumbbell, Clock, DollarSign, ChevronRight, Plus } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';

export default function EntrenadoresScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();

    const roleName = user?.role_name || '';
    const isTrainer = roleName === 'entrenador' || roleName === 'admin';

    const { programs, isLoading, refetch, isRefetching } = usePrograms();

    const renderProgramItem = ({ item }: { item: TrainingProgram }) => (
        <TouchableOpacity
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
                <TouchableOpacity style={[styles.arrowButton, { backgroundColor: theme.border + '40' }]}>
                    <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
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
                        👤 Entrenador ID: {item.trainer_id.substring(0, 8)}...
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const listHeader = (
        <View style={styles.actionButtons}>
            {isTrainer ? (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/entrenadores/nuevo-programa' as any)}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Nuevo Programa</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
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
                title="🏋️ Entrenadores"
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
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    programCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    programHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
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
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    programDesc: {
        fontSize: 13,
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
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    statText: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    programFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    trainerTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    trainerText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
