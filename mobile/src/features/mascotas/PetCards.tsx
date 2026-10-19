/**
 * Tarjetas de "Mis mascotas" en sus tres formas de ver:
 * - `PetGridCard`: cuadrícula (foto cuadrada + nombre), 2–3 por fila.
 * - `PetListRow`: fila compacta con avatar.
 * - `PetDetailCard`: tarjeta grande con foto, datos y acceso a editar.
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Cat, Dog, ChevronRight, Settings } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { getSpeciesLabel, getGenderLabel, formatAge, formatWeight, capitalize } from '@/src/utils/formatters';
import type { Pet } from '@/src/types/mascotas';
import { spacing, radius, type, shadow, layout } from '@/constants/design';

interface PetCardProps {
    pet: Pet;
    onPress: () => void;
}

const breedOf = (pet: Pet) => (pet.breed ? capitalize(pet.breed) : getSpeciesLabel(pet.species));
const hasAge = (pet: Pet) => pet.age_months != null && pet.age_months > 0;
const hasWeight = (pet: Pet) => pet.weight_kg != null && pet.weight_kg > 0;

/** "Mestizo · 2 años" */
const summaryOf = (pet: Pet) => [breedOf(pet), hasAge(pet) ? formatAge(pet.age_months) : null].filter(Boolean).join(' · ');

/** Foto de la mascota o, sin foto, el ícono de su especie. */
function PetPhoto({ pet, style, iconSize }: { pet: Pet; style: object; iconSize: number }) {
    const { theme } = useTheme();
    if (pet.photo_url) {
        return <Image source={{ uri: pet.photo_url }} style={style} resizeMode="cover" accessibilityIgnoresInvertColors />;
    }
    const SpeciesIcon = pet.species === 'gato' ? Cat : Dog;
    return (
        <View style={[style, styles.photoFallback, { backgroundColor: theme.backgroundSecondary }]}>
            <SpeciesIcon size={iconSize} color={theme.textMuted} strokeWidth={1.5} />
        </View>
    );
}

/** Punto verde "tracker activo". */
function TrackerDot() {
    const { theme } = useTheme();
    return <View style={[styles.trackerDot, { backgroundColor: theme.success, borderColor: theme.surface }]} />;
}

/** `width`: ancho de la celda (lo calcula la pantalla según las columnas). */
export function PetGridCard({ pet, onPress, width }: PetCardProps & { width: number }) {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.gridCard, { width, backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={onPress}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`Ver a ${pet.name}`}
        >
            <PetPhoto pet={pet} style={styles.gridPhoto} iconSize={layout.icon.xl * 1.5} />
            {pet.has_active_subscription && (
                <View style={styles.gridTracker} accessibilityLabel="Michi-Tracker activo">
                    <TrackerDot />
                </View>
            )}
            <View style={styles.gridInfo}>
                <Text style={[type.subtitle, { color: theme.text }]} numberOfLines={1}>{pet.name}</Text>
                <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>{summaryOf(pet)}</Text>
            </View>
        </TouchableOpacity>
    );
}

export function PetListRow({ pet, onPress }: PetCardProps) {
    const { theme } = useTheme();
    const details = [getGenderLabel(pet.gender), hasWeight(pet) ? formatWeight(pet.weight_kg) : null].filter(Boolean).join(' · ');
    return (
        <TouchableOpacity
            style={[styles.listRow, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={onPress}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`Ver a ${pet.name}`}
        >
            <View>
                <PetPhoto pet={pet} style={styles.listAvatar} iconSize={layout.icon.lg} />
                {pet.has_active_subscription && (
                    <View style={styles.listTracker} accessibilityLabel="Michi-Tracker activo">
                        <TrackerDot />
                    </View>
                )}
            </View>
            <View style={styles.flex}>
                <Text style={[type.subtitle, { color: theme.text }]} numberOfLines={1}>{pet.name}</Text>
                <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>{summaryOf(pet)}</Text>
                {details ? <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>{details}</Text> : null}
            </View>
            <ChevronRight size={layout.icon.sm} color={theme.textMuted} />
        </TouchableOpacity>
    );
}

interface PetDetailCardProps extends PetCardProps {
    onEdit: () => void;
}

// Contenedor View + botón principal + botón de editar como hermanos: en web un <button> no puede anidar otro.
export function PetDetailCard({ pet, onPress, onEdit }: PetDetailCardProps) {
    const { theme } = useTheme();
    const stats = [
        { label: 'ESPECIE', value: getSpeciesLabel(pet.species) },
        { label: 'GÉNERO', value: getGenderLabel(pet.gender) },
        hasAge(pet) ? { label: 'EDAD', value: formatAge(pet.age_months) } : null,
        hasWeight(pet) ? { label: 'PESO', value: formatWeight(pet.weight_kg) } : null,
    ].filter((s): s is { label: string; value: string } => s !== null);

    return (
        <View style={[styles.detailCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={`Ver a ${pet.name}`} activeOpacity={0.88}>
                <PetPhoto pet={pet} style={styles.detailPhoto} iconSize={layout.icon.xl * 2} />

                <View style={styles.detailInfo}>
                    <View style={styles.detailTitles}>
                        <Text style={[type.h2, { color: theme.text }]} numberOfLines={1}>{pet.name}</Text>
                        <Text style={[type.body, { color: theme.textMuted }]} numberOfLines={1}>{breedOf(pet)}</Text>
                    </View>
                    <View style={styles.statsGrid}>
                        {stats.map((s) => (
                            <View key={s.label} style={styles.statBox}>
                                <Text style={[type.label, { color: theme.textMuted }]}>{s.label}</Text>
                                <Text style={[type.bodyStrong, { color: theme.text }]} numberOfLines={1}>{s.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={[styles.detailFooter, { borderTopColor: theme.cardBorder, backgroundColor: theme.backgroundSecondary }]}>
                    {pet.has_active_subscription ? (
                        <View style={styles.trackerBadge}>
                            <TrackerDot />
                            <Text style={[type.caption, styles.strong, { color: theme.success }]}>Michi-Tracker Pro activo</Text>
                        </View>
                    ) : (
                        <Text style={[type.caption, { color: theme.textMuted }]}>Ver ficha, carnet y salud</Text>
                    )}
                    <ChevronRight size={layout.icon.sm} color={theme.textMuted} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                onPress={onEdit}
                accessibilityRole="button"
                accessibilityLabel={`Editar a ${pet.name}`}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
                <Settings size={layout.icon.sm} color={theme.text} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    strong: { fontWeight: '700' },
    photoFallback: { alignItems: 'center', justifyContent: 'center' },
    trackerDot: { width: 10, height: 10, borderRadius: radius.pill, borderWidth: 2 },

    // Cuadrícula
    gridCard: {
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: 'hidden',
        ...shadow.card,
    },
    gridPhoto: { width: '100%', aspectRatio: 1 },
    gridTracker: { position: 'absolute', top: spacing.sm, right: spacing.sm },
    gridInfo: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xxs },

    // Lista
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.card,
    },
    listAvatar: { width: layout.iconBox.lg + spacing.sm, height: layout.iconBox.lg + spacing.sm, borderRadius: radius.md },
    listTracker: { position: 'absolute', top: -spacing.xxs, right: -spacing.xxs },

    // Tarjetas
    detailCard: {
        borderRadius: radius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        ...shadow.card,
    },
    detailPhoto: { width: '100%', height: 170 },
    detailInfo: { padding: spacing.lg, gap: spacing.md },
    detailTitles: { gap: spacing.xxs, paddingRight: layout.minTouch },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, columnGap: spacing.md },
    statBox: { flexBasis: '45%', flexGrow: 1, gap: spacing.xxs },
    detailFooter: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    trackerBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    editBtn: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: layout.iconBox.md,
        height: layout.iconBox.md,
        borderRadius: radius.pill,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.raised,
    },
});
