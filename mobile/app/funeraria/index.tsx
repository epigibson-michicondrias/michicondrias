import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getActiveFuneraryServices, FuneraryService } from '../../src/services/funerary';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, Heart, DollarSign, Plus } from 'lucide-react-native';

export default function FunerariaScreen() {
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

    const { data: services = [], isLoading } = useQuery<FuneraryService[]>({
        queryKey: ['funerary-services'],
        queryFn: () => getActiveFuneraryServices(),
    });

    const filteredServices = services.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderServiceItem = ({ item }: { item: FuneraryService }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {}}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.secondary + '20' }]}>
                    <Heart size={24} color={theme.secondary} />
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

            <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: theme.primary + '10' }]}>
                    <DollarSign size={12} color={theme.primary} />
                    <Text style={[styles.tagText, { color: theme.primary }]}>${item.price}</Text>
                </View>
                {item.cremation_type && (
                    <View style={[styles.tag, { backgroundColor: theme.secondary + '10' }]}>
                        <Text style={[styles.tagText, { color: theme.secondary }]}>{item.cremation_type}</Text>
                    </View>
                )}
                {item.urn_included && (
                    <View style={[styles.tag, { backgroundColor: '#f59e0b20' }]}>
                        <Text style={[styles.tagText, { color: '#f59e0b' }]}>Urna incluida</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>🕊️ Funeraria</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Servicios funerarios y memorial para tus mascotas
                </Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/funeraria/nuevo')}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Crear Servicio</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                    placeholder="Buscar servicios funerarios..."
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
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    tagText: {
        fontSize: 12,
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
