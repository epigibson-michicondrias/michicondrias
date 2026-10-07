/**
 * SegmentedControl — selector de una opción entre 2–4 (tema claro/oscuro/sistema, pestañas de una ficha, filtros).
 *
 *   <SegmentedControl value={mode} onChange={setMode} options={[{ value: 'light', label: 'Claro', icon: Sun }, …]} />
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { layout, radius, spacing, type } from '@/constants/design';

export interface SegmentOption<T extends string> {
    value: T;
    label: string;
    icon?: React.ComponentType<any>;
}

interface SegmentedControlProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: SegmentOption<T>[];
    accessibilityLabel?: string;
}

export default function SegmentedControl<T extends string>({ value, onChange, options, accessibilityLabel }: SegmentedControlProps<T>) {
    const { theme } = useTheme();
    return (
        <View
            style={[styles.track, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            accessibilityRole="tablist"
            accessibilityLabel={accessibilityLabel}
        >
            {options.map((opt) => {
                const active = opt.value === value;
                const Icon = opt.icon;
                const color = active ? theme.text : theme.textMuted;
                return (
                    <TouchableOpacity
                        key={opt.value}
                        style={[styles.segment, active && [styles.active, { backgroundColor: theme.surface, borderColor: theme.border }]]}
                        onPress={() => onChange(opt.value)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={opt.label}
                        activeOpacity={0.8}
                    >
                        {Icon && <Icon size={layout.icon.sm} color={active ? theme.accent : theme.textMuted} />}
                        <Text style={[type.bodyStrong, { color }]} numberOfLines={1}>{opt.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        flexDirection: 'row',
        padding: spacing.xs,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.xs,
    },
    segment: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        minHeight: layout.minTouch,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    active: {
        borderWidth: 1,
    },
});
