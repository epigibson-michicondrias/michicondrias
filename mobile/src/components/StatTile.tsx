/**
 * StatTile — Cifra con ícono y etiqueta (p. ej. "2 Perdidas"). Va en filas de 2–4 con `flex: 1`.
 * Con `onPress` funciona como filtro: `active` lo resalta con su color.
 *
 *   <StatTile icon={AlertCircle} value={3} label="Perdidas" color={theme.error} active={f === 'lost'} onPress={…} />
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import type { IconComponent } from '@/src/components/IconButton';
import { layout, radius, spacing, tint, type } from '@/constants/design';

interface StatTileProps {
    icon: IconComponent;
    value: number | string;
    label: string;
    /** Color de identidad de la cifra (por defecto `theme.primary`). */
    color?: string;
    /** Si se pasa, el tile es tocable (filtro). */
    onPress?: () => void;
    active?: boolean;
}

export default function StatTile({ icon: Icon, value, label, color, onPress, active }: StatTileProps) {
    const { theme } = useTheme();
    const c = color || theme.primary;

    const content = (
        <>
            <View style={styles.top}>
                <Text style={[type.h2, { color: active ? theme.onPrimary : c }]}>{value}</Text>
                <Icon size={layout.icon.md} color={active ? theme.onPrimary : c} />
            </View>
            <Text style={[type.caption, styles.label, { color: active ? theme.onPrimary : theme.textMuted }]} numberOfLines={1}>
                {label}
            </Text>
        </>
    );

    const boxStyle = [
        styles.tile,
        active
            ? { backgroundColor: c, borderColor: c }
            : { backgroundColor: c + tint.faint, borderColor: c + tint.medium },
    ];

    if (!onPress) return <View style={boxStyle}>{content}</View>;

    return (
        <TouchableOpacity
            style={boxStyle}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value}`}
            accessibilityState={{ selected: !!active }}
        >
            {content}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tile: {
        flex: 1,
        minHeight: layout.minTouch,
        gap: spacing.xxs,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
    },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    label: { fontWeight: '700' },
});
