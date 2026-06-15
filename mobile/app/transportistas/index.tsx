import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getAvailableDrivers, DriverProfile } from '../../src/services/rides';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, Car, Users, Snowflake, Box, CheckCircle2, Plus } from 'lucide-react-native';

export default function TransportistasScreen() {
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

    const { data: drivers = [], isLoading } = useQuery<DriverProfile[]>({
        queryKey: ['available-drivers'],
        queryFn: () => getAvailableDrivers(),
    });

    const filteredDrivers = drivers.filter(driver =>
        driver.vehicle_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driver.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderDriverItem = ({ item }: { item: DriverProfile }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {}}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Car size={24} color={theme.primary} />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{item.vehicle_model}</Text>
                    <Text style={[styles.cardPlate, { color: theme.textMuted }]}>{item.vehicle_plate}</Text>
                </View>
                {item.is_available && (
                    <View style={[styles.availableBadge, { backgroundColor: theme.secondary + '20' }]}>
                        <CheckCircle2 size={14} color={theme.secondary} />
                        <Text style={[styles.availableText, { color: theme.secondary }]}>Disponible</Text>
                    </View>
                )}
            </View>

            <View style={styles.tagsRow}>
                <View style={[styles.tag, { backgroundColor: theme.background }]}>
                    <Users size={12} color={theme.textMuted} />
                    <Text style={[styles.tagText, { color: theme.textMuted }]}>{item.max_capacity} mascotas</Text>
                </View>
                {item.has_air_conditioning && (
                    <View style={[styles.tag, { backgroundColor: '#06b6d420' }]}>
                        <Snowflake size={12} color="#06b6d4" />
                        <Text style={[styles.tagText, { color: '#06b6d4' }]}>A/C</Text>
                    </View>
                )}
                {item.has_carriers && (
                    <View style={[styles.tag, { backgroundColor: '#f59e0b20' }]}>
                        <Box size={12} color="#f59e0b" />
                        <Text style={[styles.tagText, { color: '#f59e0b' }]}>Transportín</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>🚗 Transportistas</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Transporte seguro para tu mascota
                </Text>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/transportistas/nuevo')}
                >
                    <Plus size={18} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Solicitar Transporte</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Search size={20} color={theme.textMuted} />
                <TextInput
                    placeholder="Buscar por modelo o placa..."
                    placeholderTextColor={theme.textMuted}
                    style={[styles.searchInput, { color: theme.text }]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>Cargando transportistas...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredDrivers}
                    renderItem={renderDriverItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                {searchQuery ? 'No se encontraron transportistas.' : 'No hay transportistas disponibles.'}
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
    cardPlate: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
    },
    availableBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    availableText: {
        fontSize: 12,
        fontWeight: '600',
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
