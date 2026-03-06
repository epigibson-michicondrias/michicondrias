import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMyListings, Listing } from '../../src/services/adopciones';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, MessageSquare, Edit3, Trash2 } from 'lucide-react-native';

export default function MisPublicacionesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: listings = [], isLoading } = useQuery({
        queryKey: ['my-adopciones'],
        queryFn: getMyListings,
    });

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
                        onPress={() => router.push(`/adopciones/ver-solicitudes/${item.id}`)}
                    >
                        <MessageSquare size={16} color={theme.primary} />
                        <Text style={[styles.actionBtnText, { color: theme.primary }]}>Solicitudes</Text>
                    </TouchableOpacity>

                    <View style={styles.miniActions}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Edit3 size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Mis Publicaciones</Text>
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/adopciones/nuevo')}>
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={listings}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={{ fontSize: 60, marginBottom: 20 }}>🏠</Text>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No has publicado mascotas</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                                Si tienes un michi o lomito buscando hogar, ¡publícalo aquí!
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    empty: {
        paddingTop: 100,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
    }
});
