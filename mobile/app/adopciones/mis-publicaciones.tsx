import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Plus, MessageSquare, Edit3, Trash2, PawPrint, Heart } from 'lucide-react-native';
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
            {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={styles.image} />
            ) : (
                <View style={[styles.image, { backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center' }]}>
                    <PawPrint size={32} color={theme.textMuted} />
                </View>
            )}
            <View style={styles.info}>
                <View style={styles.nameHeader}>
                    <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.status?.toLowerCase() === 'adoptado' ? theme.info : item.is_approved ? theme.success : theme.warning }]}>
                        <Text style={styles.statusText}>{item.status?.toLowerCase() === 'adoptado' ? 'Adoptado' : item.is_approved ? 'Publicado' : 'En revisión'}</Text>
                    </View>
                </View>
                <Text style={[styles.breed, { color: theme.textMuted }]}>{item.breed || item.species}</Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Ver solicitudes de ${item.name}`}
                        style={[styles.actionBtn, { backgroundColor: theme.primary + '15' }]}
                        onPress={() => goToRequests(item.id)}
                    >
                        <MessageSquare size={16} color={theme.primary} />
                        <Text style={[styles.actionBtnText, { color: theme.primary }]}>Solicitudes</Text>
                    </TouchableOpacity>

                    <View style={styles.miniActions}>
                        {item.status?.toLowerCase() !== 'adoptado' && (
                        <TouchableOpacity
                            style={styles.iconBtn}
                            accessibilityRole="button"
                            accessibilityLabel="Editar publicación"
                            onPress={() => goToEditListing(item.id)}
                        >
                            <Edit3 size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.iconBtn}
                            accessibilityRole="button"
                            accessibilityLabel={`Eliminar publicación de ${item.name}`}
                            onPress={() => handleDelete(item.id, item.name)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size={18} color={theme.error} />
                            ) : (
                                <Trash2 size={18} color={theme.error} />
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
                actionLabel="Publicar mascota"
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
                emptyIcon={<Heart size={48} color={theme.textMuted} strokeWidth={1.5} />}
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
        borderColor: 'rgba(128,128,128,0.2)',
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
