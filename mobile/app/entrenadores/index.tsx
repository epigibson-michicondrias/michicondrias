import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getAllPrograms, TrainingProgram } from '../../src/services/training';
import { useColorScheme } from '@/components/useColorScheme';
import { Dumbbell, Clock, DollarSign, ChevronRight, Plus } from 'lucide-react-native';

export default function EntrenadoresScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? {
        background: '#000',
        text: '#fff',
        textMuted: '#999',
        surface: '#111',
        border: '#333',
        primary: '#7c3aed',
        secondary: '#10b981',
    } : {
        background: '#fff',
        text: '#000',
        textMuted: '#666',
        surface: '#f9f9f9',
        border: '#e5e5e5',
        primary: '#7c3aed',
        secondary: '#10b981',
    };

    const { data: programs = [], isLoading } = useQuery<TrainingProgram[]>({
        queryKey: ['trainingPrograms'],
        queryFn: () => getAllPrograms(),
    });

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

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>🏋️ Entrenadores</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Programas de entrenamiento para tu mascota
                </Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                    onPress={() => router.push('/entrenadores/nuevo' as any)}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Nuevo Programa</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando programas...</Text>
                </View>
            ) : (
                <FlatList
                    data={programs}
                    renderItem={renderProgramItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Dumbbell size={48} color={theme.textMuted} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                No hay programas de entrenamiento disponibles
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.8,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 24,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
