/**
 * Tarjetas de "Mis mascotas" en sus dos formas de ver:
 * - `PetGridCard`: cuadrícula (foto cuadrada + nombre), 2–3 por fila.
 * - `PetListRow`: fila compacta con avatar.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Cat, Dog } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { getSpeciesLabel, getGenderLabel, formatAge, formatWeight, capitalize } from '@/src/utils/formatters';
import { MediaCard, MediaRow } from '@/src/components/MediaCard';
import type { Pet } from '@/src/types/mascotas';
import { radius } from '@/constants/design';

interface PetCardProps {
    pet: Pet;
    onPress: () => void;
}

const breedOf = (pet: Pet) => (pet.breed ? capitalize(pet.breed) : getSpeciesLabel(pet.species));
const hasAge = (pet: Pet) => pet.age_months != null && pet.age_months > 0;
const hasWeight = (pet: Pet) => pet.weight_kg != null && pet.weight_kg > 0;

/** "Mestizo · 2 años" */
const summaryOf = (pet: Pet) => [breedOf(pet), hasAge(pet) ? formatAge(pet.age_months) : null].filter(Boolean).join(' · ');

/** Punto verde "tracker activo". */
function TrackerDot() {
    const { theme } = useTheme();
    return <View style={[styles.trackerDot, { backgroundColor: theme.success, borderColor: theme.surface }]} />;
}

/** `width`: ancho de la celda (de `useGridCell`). */
export function PetGridCard({ pet, onPress, width }: PetCardProps & { width: number }) {
    return (
        <MediaCard
            width={width}
            imageUrl={pet.photo_url}
            fallbackIcon={pet.species === 'gato' ? Cat : Dog}
            title={pet.name}
            lines={[{ text: summaryOf(pet) }]}
            topRight={pet.has_active_subscription ? <TrackerDot /> : undefined}
            onPress={onPress}
            accessibilityLabel={`Ver a ${pet.name}${pet.has_active_subscription ? ', Michi-Tracker activo' : ''}`}
        />
    );
}

export function PetListRow({ pet, onPress }: PetCardProps) {
    const details = [getGenderLabel(pet.gender), hasWeight(pet) ? formatWeight(pet.weight_kg) : null].filter(Boolean).join(' · ');
    return (
        <MediaRow
            imageUrl={pet.photo_url}
            fallbackIcon={pet.species === 'gato' ? Cat : Dog}
            title={pet.name}
            lines={[{ text: summaryOf(pet) }, ...(details ? [{ text: details }] : [])]}
            corner={pet.has_active_subscription ? <TrackerDot /> : undefined}
            onPress={onPress}
            accessibilityLabel={`Ver a ${pet.name}${pet.has_active_subscription ? ', Michi-Tracker activo' : ''}`}
        />
    );
}

const styles = StyleSheet.create({
    trackerDot: { width: 10, height: 10, borderRadius: radius.pill, borderWidth: 2 },
});
