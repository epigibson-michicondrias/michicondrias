import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getActiveServices, GroomingService } from '../../src/services/grooming';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, Scissors, Clock, DollarSign, ChevronRight, Plus } from 'lucide-react-native';

export default function EstilistasScreen() {
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

    const [searchQuery, setSearchQuery] = useState('');

    const { data: services = [], isLoading } = useQuery<GroomingService[]>({
        queryKey: ['grooming-services'],
        queryFn: () => getActiveServices(),
    });

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderServiceItem = ({ item }: { item: GroomingService }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {}}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Scissors size={24} color={theme.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                    {item.description && (
                        <Text style={[styles.cardDesc, { color: theme.textMuted }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                    <DollarSign size={14} color={theme.secondary} />
                    <Text style={[styles.metaText, { color: theme.secondary }]}>${item.price}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Clock size={14} color={theme.textMuted} />
                    <Text style={[styles.metaText, { color: theme.textMuted }]}>{item.duration_minutes} min</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>✂️ Estilistas</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Servicios de grooming y estética para tu mascota
                </Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/estilistas/nuevo')}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Ofrecer Servicios</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                    placeholder="Buscar servicios de grooming..."
                    placeholderTextColor={theme.textMuted}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando servicios...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredServices}
                    renderItem={renderServiceItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                {searchQuery ? 'No se encontraron servicios.' : 'No hay servicios disponibles.'}
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
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginBottom: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
    cardMeta: {
        flexDirection: 'row',
        gap: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 14,
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
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
