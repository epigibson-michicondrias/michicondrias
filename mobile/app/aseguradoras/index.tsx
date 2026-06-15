import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getActivePlans, InsurancePlan } from '../../src/services/insurance';
import { useColorScheme } from '@/components/useColorScheme';
import { Shield, Clock, DollarSign, ChevronRight, Plus, CheckCircle } from 'lucide-react-native';

export default function AseguradorasScreen() {
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

    const { data: plans = [], isLoading } = useQuery<InsurancePlan[]>({
        queryKey: ['insurancePlans'],
        queryFn: () => getActivePlans(),
    });

    const renderPlanItem = ({ item }: { item: InsurancePlan }) => (
        <TouchableOpacity
            style={[styles.planCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/aseguradoras/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.planHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Shield size={24} color={theme.primary} />
                </View>
                <View style={styles.planInfo}>
                    <Text style={[styles.planName, { color: theme.text }]}>{item.name}</Text>
                    {item.description && (
                        <Text style={[styles.planDesc, { color: theme.textMuted }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
                <TouchableOpacity style={[styles.arrowButton, { backgroundColor: theme.border + '40' }]}>
                    <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
            </View>

            <View style={styles.planStats}>
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.primary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        ${item.coverage_limit.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cobertura</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <DollarSign size={14} color={theme.secondary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        ${item.base_premium.toLocaleString()}/mes
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Prima</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Clock size={14} color={theme.textMuted} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                        {item.min_age}-{item.max_age} años
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Edad</Text>
                </View>
            </View>

            <View style={styles.tagsContainer}>
                {item.allowed_species.map((species, index) => (
                    <View key={index} style={[styles.speciesTag, { backgroundColor: theme.secondary + '15' }]}>
                        <Text style={[styles.speciesText, { color: theme.secondary }]}>
                            {species === 'dog' ? '🐕 Perro' : species === 'cat' ? '🐈 Gato' : species}
                        </Text>
                    </View>
                ))}
                {item.is_active && (
                    <View style={[styles.activeTag, { backgroundColor: '#10b98115' }]}>
                        <CheckCircle size={12} color="#10b981" />
                        <Text style={[styles.activeText, { color: '#10b981' }]}>Activo</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>🛡️ Aseguradoras</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Protege a tu mascota con el mejor seguro
                </Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/aseguradoras/nuevo' as any)}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Nuevo Plan</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando planes...</Text>
                </View>
            ) : (
                <FlatList
                    data={plans}
                    renderItem={renderPlanItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Shield size={48} color={theme.textMuted} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                No hay planes de seguro disponibles
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
    planCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    planHeader: {
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
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    planDesc: {
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
    planStats: {
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
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    speciesTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    speciesText: {
        fontSize: 12,
        fontWeight: '600',
    },
    activeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    activeText: {
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
