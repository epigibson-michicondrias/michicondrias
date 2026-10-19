/**
 * IconButton — Botón cuadrado de solo ícono (44 px, objetivo táctil mínimo). Base de los botones de cabecera
 * (volver, acción) y de cualquier acción de ícono suelta.
 *
 * Variantes:
 * - `subtle`: fondo tenue del tema (por defecto).
 * - `surface`: tarjeta con borde, para fondos claros/oscuros normales.
 * - `primary`: acción principal sólida.
 * - `glass`: vidrio translúcido, para usar encima de una cabecera hero (`HeroBackground`).
 */
import React from 'react';
import { ActivityIndicator, TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { radius, layout } from '@/constants/design';

export type IconButtonVariant = 'subtle' | 'surface' | 'primary' | 'glass';

/** Forma de un ícono de `lucide-react-native`. */
export type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface IconButtonProps {
    icon: IconComponent;
    /** Texto para lectores de pantalla (obligatorio: el botón no tiene texto visible). */
    accessibilityLabel: string;
    onPress?: () => void;
    variant?: IconButtonVariant;
    /** Color del ícono; por defecto el que corresponde a la variante. */
    color?: string;
    strokeWidth?: number;
    disabled?: boolean;
    /** Muestra un indicador en lugar del ícono y bloquea el botón (p. ej. mientras se guarda). */
    loading?: boolean;
    style?: StyleProp<ViewStyle>;
}

export default function IconButton({
    icon: Icon,
    accessibilityLabel,
    onPress,
    variant = 'subtle',
    color,
    strokeWidth,
    disabled,
    loading,
    style,
}: IconButtonProps) {
    const { theme } = useTheme();

    const variantStyle: Record<IconButtonVariant, { box: ViewStyle; icon: string }> = {
        subtle: { box: { backgroundColor: theme.overlayHover }, icon: theme.text },
        surface: { box: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.cardBorder }, icon: theme.text },
        primary: { box: { backgroundColor: theme.primary }, icon: theme.onPrimary },
        glass: { box: { backgroundColor: theme.heroGlass, borderWidth: 1, borderColor: theme.heroGlassBorder }, icon: theme.onHero },
    };
    const current = variantStyle[variant];
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            style={[styles.btn, current.box, disabled && styles.disabled, style]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            {loading ? (
                <ActivityIndicator size="small" color={color || current.icon} />
            ) : (
                <Icon size={layout.icon.lg} color={color || current.icon} strokeWidth={strokeWidth} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        width: layout.minTouch,
        height: layout.minTouch,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
});
