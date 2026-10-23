/**
 * ViewModeToggle — Selector compacto de solo íconos para cambiar la forma de ver una lista.
 * Se combina con `useViewMode` (que recuerda la elección).
 *
 *   <ViewModeToggle value={mode} onChange={setMode} options={[
 *       { value: 'grid', label: 'Cuadrícula', icon: LayoutGrid },
 *       { value: 'list', label: 'Lista', icon: List },
 *   ]} />
 */
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import type { IconComponent } from '@/src/components/IconButton';
import { layout, radius, spacing } from '@/constants/design';

export interface ViewModeOption<T extends string> {
    value: T;
    /** Texto para lectores de pantalla. */
    label: string;
    icon: IconComponent;
}

interface ViewModeToggleProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    options: ViewModeOption<T>[];
}

export default function ViewModeToggle<T extends string>({ value, onChange, options }: ViewModeToggleProps<T>) {
    const { theme } = useTheme();
    return (
        <View
            style={[styles.track, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            accessibilityRole="tablist"
            accessibilityLabel="Forma de ver"
        >
            {options.map(({ value: v, label, icon: Icon }) => {
                const active = v === value;
                return (
                    <TouchableOpacity
                        key={v}
                        style={[styles.segment, active && { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => onChange(v)}
                        activeOpacity={0.8}
                        accessibilityRole="tab"
                        accessibilityLabel={label}
                        accessibilityState={{ selected: active }}
                        hitSlop={{ top: 4, bottom: 4 }}
                    >
                        <Icon size={layout.icon.sm} color={active ? theme.primary : theme.textMuted} />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        flexDirection: 'row',
        padding: spacing.xxs,
        borderRadius: radius.md,
        borderWidth: 1,
        gap: spacing.xxs,
    },
    segment: {
        width: layout.iconBox.md,
        height: layout.iconBox.sm + spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
});
