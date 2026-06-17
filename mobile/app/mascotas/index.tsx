import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Plus, Settings, ChevronRight } from 'lucide-react-native';
import { usePets } from '@/src/hooks/mascotas';
import { getSpeciesLabel, getGenderLabel } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { Pet } from '@/src/types/mascotas';

export default function MascotasListScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pets, isLoading, isRefetching, refetch } = usePets();

    const renderPetCard = ({ item }: { item: Pet }) => (
        <TouchableOpacity
            style={[styles.petCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => router.push(`/mascotas/${item.id}`)}
        >
            <Image source={{ uri: item.photo_url || 'https://via.placeholder.com/150' }} style={styles.petImage} />
            <View style={styles.petInfo}>
                <View style={styles.petHeader}>
                    <View>
                        <Text style={[styles.petName, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.petBreed, { color: theme.textMuted }]}>{item.breed || item.species}</Text>
                    </View>
                    <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push(`/mascotas/editar/${item.id}`)}>
                        <Settings size={20} color={theme.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={styles.petStats}>
                    <View style={styles.stat}>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>ESPECIE</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{getSpeciesLabel(item.species)}</Text>
                    </View>
                    <View style={styles.stat}>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>GÉNERO</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>{getGenderLabel(item.gender)}</Text>
                    </View>
                </View>
            </View>
            <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder }]}>
                <View style={styles.trackerBadge}>
                    <View style={styles.trackerDot} />
                    <Text style={styles.trackerText}>Michi-Tracker Activo</Text>
                </View>
                <ChevronRight size={20} color={theme.textMuted} />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis Mascotas"
                actionIcon={Plus}
                onAction={() => router.push('/mascotas/nuevo')}
            />

            <DataList
                data={pets}
                renderItem={renderPetCard}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando a tus mejores amigos..."
                onRefresh={refetch}
                isRefreshing={isRefetching}
                emptyIcon={<Text style={{ fontSize: 60 }}>🐶🐱</Text>}
                emptyTitle="Aún no tienes mascotas"
                emptySubtitle="Agrega a tu perro o gato para llevar su control, carnet y tracker."
                emptyActionLabel="Agregar Mascota"
                onEmptyAction={() => router.push('/mascotas/nuevo')}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    petCard: {
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
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
    },
    petBreed: {
        fontSize: 14,
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
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    cardFooter: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
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
