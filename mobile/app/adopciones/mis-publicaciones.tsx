import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Plus, MessageSquare, Edit3, Trash2 } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import { useMyListings } from '@/src/hooks/adopciones/useMyListings';
import type { Listing } from '@/src/types/adopciones';

export default function MisPublicacionesScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        listings,
        isLoading,
        isRefetching,
        refetch,
        goToNewListing,
        goToRequests,
        goToEditListing,
        handleDelete,
        isDeleting,
    } = useMyListings();

    const renderItem = ({ item }: { item: Listing }) => (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Image
                source={{ uri: item.photo_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=300' }}
                style={styles.image}
            />
            <View style={styles.info}>
                <View style={styles.nameHeader}>
                    <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.is_approved ? '#10b981' : '#f59e0b' }]}>
                        <Text style={styles.statusText}>{item.is_approved ? 'Publicado' : 'Pendiente'}</Text>
                    </View>
                </View>
                <Text style={[styles.breed, { color: theme.textMuted }]}>{item.breed || item.species}</Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => goToRequests(item.id)}
                    >
                        <MessageSquare size={16} color={theme.primary} />
                        <Text style={[styles.actionBtnText, { color: theme.primary }]}>Solicitudes</Text>
                    </TouchableOpacity>

                    <View style={styles.miniActions}>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => goToEditListing(item.id)}
                        >
                            <Edit3 size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => handleDelete(item.id, item.name)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size={18} color="#ef4444" />
                            ) : (
                                <Trash2 size={18} color="#ef4444" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis Publicaciones"
                actionIcon={Plus}
                onAction={goToNewListing}
            />

            <DataList
                data={listings}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                isLoading={isLoading}
                onRefresh={refetch}
                isRefreshing={isRefetching}
                contentStyle={styles.list}
                emptyIcon={<Text style={{ fontSize: 48 }}>🏠</Text>}
                emptyTitle="No has publicado mascotas"
                emptySubtitle="Si tienes un michi o lomito buscando hogar, ¡publícalo aquí!"
                emptyActionLabel="Publicar"
                onEmptyAction={goToNewListing}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        padding: 20,
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    image: {
        width: 100,
        height: 120,
    },
    info: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    nameHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    breed: {
        fontSize: 12,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '800',
    },
    miniActions: {
        flexDirection: 'row',
        gap: 12,
    },
    iconBtn: {
        padding: 4,
    },
});
