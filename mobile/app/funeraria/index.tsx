import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useFuneraryServices } from '@/src/hooks/funerary/useFuneraryServices';
import { FuneraryService } from '@/src/services/funerary';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { Heart, DollarSign, Plus } from 'lucide-react-native';
import SearchBar from '@/src/components/SearchBar';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';

import { useAuth } from '@/src/contexts/AuthContext';

export default function FunerariaScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { searchQuery, setSearchQuery, services, isLoading, router } = useFuneraryServices();

    const roleName = user?.role_name || '';
    const isFuneralHome = roleName === 'funeraria' || roleName === 'admin';

    const renderServiceItem = ({ item }: { item: FuneraryService }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/funeraria/reservar', params: { service_id: item.id } } as any)}
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
        <ScreenContainer>
            <ScreenHeader
                title="🕊️ Funeraria"
                subtitle="Servicios funerarios y memorial para tus mascotas"
            />

            <View style={styles.actionButtons}>
                {isFuneralHome ? (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/funeraria/nuevo-servicio')}
                    >
                        <Plus size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Crear Servicio</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.secondary }]}
                        onPress={() => router.push('/funeraria/mis-reservas')}
                    >
                        <Heart size={18} color="#fff" />
                        <Text style={[styles.actionButtonText, { color: '#fff' }]}>Mis Reservas</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={{ marginHorizontal: 24, marginBottom: 20 }}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar servicios funerarios..."
                />
            </View>

            {isLoading ? (
                <LoadingOverlay message="Cargando servicios..." />
            ) : (
                <FlatList
                    data={services}
                    renderItem={renderServiceItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Heart size={32} color={theme.textMuted} />}
                            title={searchQuery ? 'No se encontraron servicios.' : 'No hay servicios disponibles.'}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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
});
