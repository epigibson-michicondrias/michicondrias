import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { Plus, Settings, ChevronRight } from 'lucide-react-native';
import { usePets } from '@/src/hooks/mascotas/usePets';
import { getSpeciesLabel, getGenderLabel, formatAge, formatWeight, capitalize } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import type { Pet } from '@/src/types/mascotas';
import { spacing, radius, type, shadow, layout } from '@/constants/design';

export default function MascotasListScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pets, isLoading, isRefetching, refetch } = usePets();

    // Contenedor View + botón principal + botón de editar como hermanos: en web un <button> no puede anidar otro.
    const renderPetCard = ({ item }: { item: Pet }) => {
        const breedDisplay = item.breed ? capitalize(item.breed) : getSpeciesLabel(item.species);
        const hasAge = item.age_months != null && item.age_months > 0;
        const hasWeight = item.weight_kg != null && item.weight_kg > 0;

        return (
            <View style={[styles.petCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <TouchableOpacity
                    onPress={() => router.push(`/mascotas/${item.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver a ${item.name}`}
                    activeOpacity={0.88}
                >
                    {item.photo_url ? (
                        <Image source={{ uri: item.photo_url }} style={styles.petImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.petImage, styles.petImageFallback, { backgroundColor: theme.backgroundSecondary }]}>
                            <Text style={styles.fallbackEmoji}>{item.species === 'gato' ? '🐱' : '🐶'}</Text>
                        </View>
                    )}

                    <View style={styles.petInfo}>
                        <View style={styles.petHeader}>
                            <View style={styles.headerTitles}>
                                <Text style={[type.h2, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                                <Text style={[type.body, { color: theme.textMuted }]} numberOfLines={1}>{breedDisplay}</Text>
                            </View>
                        </View>

                        <View style={styles.petStatsGrid}>
                            <View style={styles.statBox}>
                                <Text style={[type.label, { color: theme.textMuted }]}>ESPECIE</Text>
                                <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>
                                    {getSpeciesLabel(item.species)}
                                </Text>
                            </View>

                            <View style={styles.statBox}>
                                <Text style={[type.label, { color: theme.textMuted }]}>GÉNERO</Text>
                                <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>
                                    {getGenderLabel(item.gender)}
                                </Text>
                            </View>

                            {hasAge && (
                                <View style={styles.statBox}>
                                    <Text style={[type.label, { color: theme.textMuted }]}>EDAD</Text>
                                    <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>
                                        {formatAge(item.age_months)}
                                    </Text>
                                </View>
                            )}

                            {hasWeight && (
                                <View style={styles.statBox}>
                                    <Text style={[type.label, { color: theme.textMuted }]}>PESO</Text>
                                    <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>
                                        {formatWeight(item.weight_kg)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder, backgroundColor: theme.backgroundSecondary }]}>
                        {item.has_active_subscription ? (
                            <View style={styles.trackerBadge}>
                                <View style={[styles.trackerDot, { backgroundColor: theme.success }]} />
                                <Text style={[type.caption, { color: theme.success, fontWeight: '800' }]}>Michi-Tracker Pro Activo</Text>
                            </View>
                        ) : (
                            <Text style={[type.caption, { color: theme.textMuted, fontWeight: '600' }]}>
                                Ver ficha, carnet y salud
                            </Text>
                        )}
                        <ChevronRight size={layout.icon.sm} color={theme.textMuted} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                    onPress={() => router.push(`/mascotas/editar/${item.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar a ${item.name}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Settings size={layout.icon.sm} color={theme.text} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mis Mascotas"
                actionIcon={Plus}
                actionLabel="Agregar mascota"
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
                emptyIcon={<Text style={styles.emptyEmoji}>🐶🐱</Text>}
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
        borderRadius: radius.xl,
        marginBottom: spacing.xl,
        overflow: 'hidden',
        borderWidth: 1,
        ...shadow.card,
    },
    editBtn: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: layout.minTouch,
        height: layout.minTouch,
        borderRadius: radius.pill,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.raised,
    },
    petImage: {
        width: '100%',
        height: 190,
    },
    petImageFallback: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackEmoji: {
        fontSize: 64,
    },
    emptyEmoji: {
        fontSize: 56,
    },
    petInfo: {
        padding: spacing.xl,
        gap: spacing.lg,
    },
    petHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitles: {
        flex: 1,
        gap: spacing.xxs,
        paddingRight: layout.minTouch,
    },
    petStatsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: spacing.md,
        columnGap: spacing.md,
    },
    statBox: {
        flexBasis: '45%',
        flexGrow: 1,
        gap: spacing.xxs,
    },
    cardFooter: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 48,
    },
    trackerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    trackerDot: {
        width: 8,
        height: 8,
        borderRadius: radius.pill,
    },
});
