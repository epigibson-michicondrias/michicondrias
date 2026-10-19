/**
 * QuantityStepper — Selector de cantidad con − y + (objetivo táctil de 44 px).
 *
 *   <QuantityStepper value={qty} onChange={setQty} max={stock} />
 *   <QuantityStepper value={item.quantity} onChange={…} min={0} size="sm" />  // en 0 se puede quitar
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { layout, radius, spacing, type } from '@/constants/design';

interface QuantityStepperProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    /** Si `min` es 0, en 1 el botón − se vuelve "quitar" (bote de basura). */
    size?: 'sm' | 'md';
    /** Nombre del artículo para lectores de pantalla. */
    itemLabel?: string;
    /** Se llama al intentar pasar de `max` (p. ej. para avisar "solo hay N"). */
    onMaxReached?: () => void;
}

export default function QuantityStepper({
    value, onChange, min = 1, max = Infinity, size = 'md', itemLabel, onMaxReached,
}: QuantityStepperProps) {
    const { theme } = useTheme();
    const isSmall = size === 'sm';
    const box = isSmall ? layout.iconBox.md : layout.minTouch;
    // Lo que falte para 44 px se completa con hitSlop
    const slop = (layout.minTouch - box) / 2 + 2;
    const canDecrease = value > min;
    const atMax = value >= max;
    const removes = min === 0 && value === 1;
    const DecIcon = removes ? Trash2 : Minus;
    const suffix = itemLabel ? ` de ${itemLabel}` : '';

    return (
        <View style={[styles.track, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <TouchableOpacity
                style={[styles.btn, { width: box, height: box }, !canDecrease && styles.disabled]}
                onPress={() => canDecrease && onChange(value - 1)}
                disabled={!canDecrease}
                hitSlop={slop}
                accessibilityRole="button"
                accessibilityLabel={removes ? `Quitar${suffix}` : `Quitar una unidad${suffix}`}
            >
                <DecIcon size={layout.icon.sm} color={removes ? theme.error : theme.text} />
            </TouchableOpacity>
            <Text style={[type.bodyStrong, styles.value, { color: theme.text }]} accessibilityLabel={`Cantidad ${value}`}>
                {value}
            </Text>
            <TouchableOpacity
                style={[styles.btn, { width: box, height: box }, atMax && styles.disabled]}
                onPress={() => (atMax ? onMaxReached?.() : onChange(value + 1))}
                hitSlop={slop}
                accessibilityRole="button"
                accessibilityLabel={`Agregar una unidad${suffix}`}
                accessibilityState={{ disabled: atMax }}
            >
                <Plus size={layout.icon.sm} color={theme.text} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: radius.pill,
    },
    btn: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
    value: { minWidth: spacing.xxl, textAlign: 'center' },
    disabled: { opacity: 0.35 },
});
