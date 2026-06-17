import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GroomingService } from '../../src/services/grooming';
import { useGroomingServices } from '@/src/hooks/grooming';
import { useTheme } from '@/src/hooks/useTheme';
import { Scissors, Clock, DollarSign, Plus } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';

import { useAuth } from '@/src/contexts/AuthContext';

export default function EstilistasScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();

    const roleName = user?.role_name || '';
    const isStyler = roleName === 'estilista' || roleName === 'groomer' || roleName === 'admin';

    const {
        services,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        hasActiveFilters,
    } = useGroomingServices();

    const renderServiceItem = ({ item }: { item: GroomingService }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/grooming/agendar', params: { service_id: item.id } } as any)}
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

    const listHeader = (
        <>
            <View style={styles.actionButtons}>
                {isStyler ? (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/estilistas/nuevo')}
                    >
                        <Plus size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Ofrecer Servicios</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                        onPress={() => router.push('/grooming/mis-citas')}
                    >
                        <Scissors size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mis Citas</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar servicios de grooming..."
                />
            </View>
        </>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="✂️ Estilistas"
                subtitle="Servicios de grooming y estética para tu mascota"
            />

            <DataList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando servicios..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                header={listHeader}
                emptyIcon={<Scissors size={32} color={theme.textMuted} />}
                emptyTitle={hasActiveFilters ? 'No se encontraron servicios.' : 'No hay servicios disponibles.'}
                contentStyle={styles.list}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    actionButtons: {
        flexDirection: 'row',
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
        marginBottom: 20,
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
});
