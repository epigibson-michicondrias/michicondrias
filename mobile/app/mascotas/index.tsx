import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getUserPets, Pet } from '../../src/services/mascotas';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Plus, Settings, ChevronRight, Info } from 'lucide-react-native';

export default function MascotasListScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: pets = [], isLoading } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Mis Mascotas</Text>
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/mascotas/nuevo')}>
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <Text style={{ color: theme.textMuted }}>Cargando a tus mejores amigos...</Text>
                </View>
            ) : pets.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🐶🐱</Text>
                    <Text style={styles.emptyTitle}>Aún no tienes mascotas</Text>
                    <Text style={styles.emptySubtitle}>Agrega a tu perro o gato para llevar su control, carnet y tracker.</Text>
                    <TouchableOpacity style={styles.emptyAddBtn} onPress={() => router.push('/mascotas/nuevo')}>
                        <Text style={styles.emptyAddBtnText}>Agregar Mascota</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={pets}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listPadding}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.petCard, { backgroundColor: theme.surface }]}
                            onPress={() => router.push(`/mascotas/${item.id}`)}
                        >
                            <Image source={{ uri: item.photo_url || 'https://via.placeholder.com/150' }} style={styles.petImage} />
                            <View style={styles.petInfo}>
                                <View style={styles.petHeader}>
                                    <View>
                                        <Text style={styles.petName}>{item.name}</Text>
                                        <Text style={styles.petBreed}>{item.breed || item.species}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.settingsBtn}>
                                        <Settings size={20} color={theme.textMuted} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.petStats}>
                                    <View style={styles.stat}>
                                        <Text style={styles.statLabel}>ESPECIE</Text>
                                        <Text style={styles.statValue}>{item.species === 'perro' ? '🐕 Perro' : '🐈 Gato'}</Text>
                                    </View>
                                    <View style={styles.stat}>
                                        <Text style={styles.statLabel}>GÉNERO</Text>
                                        <Text style={styles.statValue}>{item.gender === 'macho' ? '♂️ Macho' : '♀️ Hembra'}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.cardFooter}>
                                <View style={styles.trackerBadge}>
                                    <View style={styles.trackerDot} />
                                    <Text style={styles.trackerText}>Michi-Tracker Activo</Text>
                                </View>
                                <ChevronRight size={20} color={theme.textMuted} />
                            </View>
                        </TouchableOpacity>
                    )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#f8fafc',
    },
    addBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#f8fafc',
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    emptyAddBtn: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 20,
    },
    emptyAddBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    listPadding: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    petCard: {
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    petImage: {
        width: '100%',
        height: 180,
    },
    petInfo: {
        padding: 20,
    },
    petHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    petName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#f8fafc',
    },
    petBreed: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 2,
    },
    settingsBtn: {
        padding: 5,
    },
    petStats: {
        flexDirection: 'row',
        gap: 24,
    },
    stat: {
        gap: 4,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 14,
        color: '#cbd5e1',
        fontWeight: '600',
    },
    cardFooter: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trackerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    trackerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    trackerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#22c55e',
    },
});
