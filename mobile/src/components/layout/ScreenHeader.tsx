/**
 * ScreenHeader — Cabecera estándar de pantalla: volver a la izquierda, título (+ subtítulo) y acciones a la derecha.
 *
 * Variantes:
 * - `hero` (por defecto): `HeroBackground` con el color de la pantalla (módulo o rol, deducido de la ruta) y botones
 *   de vidrio. No hace falta pasar color: `/perdidas/*` sale rojo, `/mi-clinica/*` con el color del veterinario, etc.
 * - `plain`: sin fondo, sobre `theme.background` (para casos excepcionales, p. ej. dentro de un modal).
 *
 * Acciones: `actions` (lista de `IconButton`) o, para un solo botón, `actionIcon` + `onAction`. `rightElement` queda
 * para contenido que no sea un botón de ícono.
 *
 * Piezas reutilizables por separado: `IconButton`, `BackButton`, `layout/HeroBackground`, `src/constants/modules.ts`.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/hooks/useTheme';
import BackButton from '@/src/components/BackButton';
import IconButton, { type IconComponent } from '@/src/components/IconButton';
import HeroBackground from '@/src/components/layout/HeroBackground';
import type { ModuleKey } from '@/src/constants/modules';
import { families, layout, spacing, type } from '@/constants/design';

export interface HeaderAction {
    icon: IconComponent;
    /** Texto para lectores de pantalla. */
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    /** Contador sobre el botón (p. ej. artículos en la bolsa). */
    badge?: number;
}

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    /** Muestra el botón volver (por defecto sí). */
    showBack?: boolean;
    /** Acción de volver (por defecto `router.back()`). */
    onBack?: () => void;
    /** Botones de ícono a la derecha (máx. 2 recomendado). */
    actions?: HeaderAction[];
    /** Atajo para una sola acción: ícono de lucide. */
    actionIcon?: IconComponent;
    onAction?: () => void;
    /** Etiqueta para lectores de pantalla de `actionIcon` (por defecto, según el ícono). */
    actionLabel?: string;
    /** Contenido libre a la derecha (reemplaza las acciones). */
    rightElement?: React.ReactNode;
    /** Contenido libre a la izquierda (reemplaza el botón volver). */
    leftElement?: React.ReactNode;
    /** `hero` (por defecto) o `plain`. */
    variant?: 'hero' | 'plain';
    /** Fuerza el color de un módulo distinto al de la ruta. */
    module?: ModuleKey;
    /** Fuerza un acento suelto distinto al de la ruta. */
    accent?: string;
}

/** Etiqueta por defecto del botón de acción según su ícono, para lectores de pantalla. */
const ACTION_ICON_LABELS: Record<string, string> = {
    Plus: 'Agregar',
    UserPlus: 'Agregar persona',
    Settings: 'Ajustes',
    Search: 'Buscar',
    Sparkles: 'Novedades',
    Filter: 'Filtrar',
    Share2: 'Compartir',
    Edit: 'Editar',
    Edit3: 'Editar',
    Trash2: 'Eliminar',
    Bell: 'Notificaciones',
    ShoppingCart: 'Carrito',
};

/** Espacio superior de la variante simple (por debajo de la barra de estado). */
const PLAIN_TOP_PADDING = 60;

export default function ScreenHeader({
    title,
    subtitle,
    showBack = true,
    onBack,
    actions,
    actionIcon,
    onAction,
    actionLabel,
    rightElement,
    leftElement,
    variant = 'hero',
    module,
    accent,
}: ScreenHeaderProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const isHero = variant === 'hero';

    const allActions: HeaderAction[] = actions ?? (actionIcon && onAction
        ? [{
            icon: actionIcon,
            onPress: onAction,
            label: actionLabel || ACTION_ICON_LABELS[(actionIcon as any).displayName] || 'Acción principal',
        }]
        : []);

    const content = (
        <View style={[styles.header, { paddingTop: isHero ? insets.top + spacing.sm : PLAIN_TOP_PADDING }]}>
            <View style={styles.headerLeft}>
                {leftElement ? (
                    leftElement
                ) : showBack ? (
                    <BackButton onPress={onBack ?? (() => router.back())} variant={isHero ? 'glass' : 'surface'} size="sm" />
                ) : null}
                <View style={styles.titleContainer}>
                    <Text
                        accessibilityRole="header"
                        style={[styles.title, { color: isHero ? theme.onHero : theme.text }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                    >
                        {title}
                    </Text>
                    {subtitle ? (
                        <Text
                            style={[styles.subtitle, { color: isHero ? theme.onHeroMuted : theme.textMuted }]}
                            numberOfLines={2}
                        >
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            </View>

            {rightElement || allActions.length > 0 ? (
                <View style={styles.headerRight}>
                    {rightElement ??
                        allActions.map((a) => (
                            <IconButton
                                key={a.label}
                                icon={a.icon}
                                accessibilityLabel={a.label}
                                onPress={a.onPress}
                                loading={a.loading}
                                disabled={a.disabled}
                                badge={a.badge}
                                variant={isHero ? 'glass' : 'primary'}
                                size="sm"
                            />
                        ))}
                </View>
            ) : null}
        </View>
    );

    if (isHero) {
        return <HeroBackground module={module} accent={accent} style={styles.hero}>{content}</HeroBackground>;
    }

    return content;
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.lg,
        gap: spacing.md,
    },
    // Separa el contenido de la pantalla del borde redondeado de la cabecera
    hero: {
        marginBottom: spacing.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    titleContainer: {
        flex: 1,
    },
    title: type.screenTitle,
    subtitle: {
        ...type.caption,
        fontFamily: families.medium,
        marginTop: spacing.xxs,
    },
});
