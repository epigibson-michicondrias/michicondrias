/**
 * Button — botón estándar premium.
 * variant: primary (relleno), secondary (borde), ghost (texto), danger (acción destructiva), gold (acento premium).
 */
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { layout, radius, shadow, spacing, type } from '@/constants/design';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    label: string;
    onPress?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    /** Icono a la izquierda (nodo ya renderizado). */
    icon?: React.ReactNode;
    /** Icono a la derecha. */
    iconRight?: React.ReactNode;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
    accessibilityLabel?: string;
}

export default function Button({
    label, onPress, variant = 'primary', size = 'md', loading, disabled, icon, iconRight,
    fullWidth = true, style, accessibilityLabel,
}: ButtonProps) {
    const { theme } = useTheme();
    const inactive = disabled || loading;

    const palette = {
        primary: { bg: theme.primary, fg: '#fff', border: 'transparent' },
        gold: { bg: theme.accent, fg: '#101c3d', border: 'transparent' },
        danger: { bg: theme.error, fg: '#fff', border: 'transparent' },
        secondary: { bg: 'transparent', fg: theme.text, border: theme.border },
        ghost: { bg: 'transparent', fg: theme.primary, border: 'transparent' },
    }[variant];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={inactive}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ disabled: !!inactive, busy: !!loading }}
            style={[
                styles.base,
                {
                    minHeight: layout.buttonHeight[size],
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                    borderWidth: variant === 'secondary' ? 1.5 : 0,
                    opacity: inactive ? 0.55 : 1,
                    alignSelf: fullWidth ? 'stretch' : 'flex-start',
                },
                (variant === 'primary' || variant === 'gold' || variant === 'danger') && shadow.card,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={palette.fg} />
            ) : (
                <View style={styles.row}>
                    {icon}
                    <Text style={[type.button, { color: palette.fg, fontSize: size === 'sm' ? 13 : 15 }]} numberOfLines={1}>
                        {label}
                    </Text>
                    {iconRight}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.md,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
