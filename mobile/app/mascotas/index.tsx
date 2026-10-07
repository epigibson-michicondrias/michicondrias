import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Plus, Settings, ChevronRight } from 'lucide-react-native';
import { usePets } from '@/src/hooks/mascotas/usePets';
import { getSpeciesLabel, getGenderLabel } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { Pet } from '@/src/types/mascotas';

export default function MascotasListScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pets, isLoading, isRefetching, refetch } = usePets();

    // Contenedor View + botón principal + botón de editar como hermanos: en web un <button> no puede anidar otro.
    const renderPetCard = ({ item }: { item: Pet }) => (
        <View style={[styles.petCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
        <TouchableOpacity
            onPress={() => router.push(`/mascotas/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Ver a ${item.name}`}
        >
            {item.photo_url ? (
                <Image source={{ uri: item.photo_url }} style={styles.petImage} />
            ) : (
                <View style={[styles.petImage, styles.petImageFallback, { backgroundColor: theme.backgroundSecondary }]}>
                    <Text style={{ fontSize: 56 }}>{item.species === 'gato' ? '🐱' : '🐶'}</Text>
                </View>
            )}
            <View style={styles.petInfo}>
                <View style={styles.petHeader}>
                    <View>
                        <Text style={[styles.petName, { color: theme.text }]}>{item.name}</Text>
                        <Text style={[styles.petBreed, { color: theme.textMuted }]}>{item.breed || getSpeciesLabel(item.species)}</Text>
                    </View>
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
                {item.has_active_subscription ? (
                    <View style={styles.trackerBadge}>
                        <View style={styles.trackerDot} />
                        <Text style={styles.trackerText}>Michi-Tracker Activo</Text>
                    </View>
                ) : (
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>Ver carnet y detalles</Text>
                )}
                <ChevronRight size={20} color={theme.textMuted} />
            </View>
        </TouchableOpacity>
        <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(`/mascotas/editar/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Editar a ${item.name}`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            <Settings size={18} color={theme.text} />
        </TouchableOpacity>
        </View>
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
    editBtn: {
        position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20,
        borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    },
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
    petImageFallback: {
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: '#22c55e', // estado semántico: activo
    },
    trackerText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#22c55e',
    },
});
