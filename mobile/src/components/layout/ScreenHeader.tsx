/**
 * ScreenHeader — Standardized header for all screens
 * Replaces the repeated header pattern across 100+ screens
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
    /** Screen title */
    title: string;
    /** Optional subtitle below the title */
    subtitle?: string;
    /** Show back button (default: true) */
    showBack?: boolean;
    /** Custom back handler (default: router.back()) */
    onBack?: () => void;
    /** Right-side action icon component (e.g., Plus from lucide) */
    actionIcon?: React.ComponentType<{ size: number; color: string }>;
    /** Handler for action button */
    onAction?: () => void;
    /** Optional custom right element (overrides actionIcon) */
    rightElement?: React.ReactNode;
    /** Optional custom left element (overrides back button) */
    leftElement?: React.ReactNode;
    /** Optional gradient colors for premium headers */
    gradient?: string[];
    /** Etiqueta para lectores de pantalla del botón de acción (por defecto "Acción principal") */
    actionLabel?: string;
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

const PREMIUM_HEADER = ['#1c2f6b', '#101c3d'];

export default function ScreenHeader({
    title,
    subtitle,
    showBack = true,
    onBack,
    actionIcon: ActionIcon,
    onAction,
    rightElement,
    leftElement,
    gradient,
    actionLabel,
}: ScreenHeaderProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const textColor = gradient ? '#fff' : theme.text;
    const subtitleColor = gradient ? 'rgba(255,255,255,0.8)' : theme.textMuted;
    const backBtnStyle = gradient
        ? { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(233,200,131,0.3)' }
        : { backgroundColor: theme.surface, borderColor: theme.cardBorder, borderWidth: 1 };
    const actionBtnStyle = gradient
        ? { backgroundColor: 'rgba(233,200,131,0.18)', borderWidth: 1, borderColor: 'rgba(233,200,131,0.3)' }
        : { backgroundColor: theme.primary };

    const headerContent = (
        <View style={[
            styles.header,
            gradient ? { paddingTop: insets.top + 12 } : undefined,
        ]}>
            <View style={styles.headerLeft}>
                {leftElement ? (
                    leftElement
                ) : showBack ? (
                    <TouchableOpacity
                        onPress={handleBack}
                        accessibilityRole="button"
                        accessibilityLabel="Volver"
                        style={[styles.backBtn, backBtnStyle]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ChevronLeft size={22} color={textColor} />
                    </TouchableOpacity>
                ) : null}
                <View style={styles.titleContainer}>
                    <Text accessibilityRole="header" style={[styles.title, { color: textColor }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle ? (
                        <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            </View>

            <View style={styles.headerRight}>
                {rightElement ? (
                    rightElement
                ) : ActionIcon && onAction ? (
                    <TouchableOpacity
                        onPress={onAction}
                        accessibilityRole="button"
                        accessibilityLabel={actionLabel || ACTION_ICON_LABELS[(ActionIcon as any).displayName] || 'Acción principal'}
                        style={[styles.actionBtn, actionBtnStyle]}
                    >
                        <ActionIcon size={24} color="#fff" />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );

    if (gradient) {
        return (
            // Todas las cabeceras con degradado comparten el mismo azul medianoche con filo dorado,
            // sin importar el color que pida cada pantalla (identidad homogénea).
            <LinearGradient
                colors={PREMIUM_HEADER as any}
                style={styles.gradientWrapper}
            >
                {headerContent}
            </LinearGradient>
        );
    }

    return headerContent;
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.4,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    actionBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientWrapper: {
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        borderBottomWidth: 1,
        borderColor: 'rgba(233,200,131,0.25)',
    },
});
