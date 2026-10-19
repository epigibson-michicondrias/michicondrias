/**
 * MediaCard / MediaRow — Elemento con foto para listas que se pueden ver en cuadrícula o como lista
 * (mascotas, adopciones, reportes de perdidas…). Se combinan con `ViewModeToggle` + `useViewMode` + `useGridCell`.
 *
 *   <MediaCard width={cellWidth} imageUrl={pet.photo_url} fallbackIcon={Dog} title={pet.name}
 *       lines={[{ text: 'Labrador · 3 años' }]} topLeft={<Badge … />} onPress={…} accessibilityLabel="Ver a Max" />
 *   <MediaRow imageUrl={…} fallbackIcon={Dog} title={…} lines={[…]} onPress={…} accessibilityLabel={…} />
 */
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import type { IconComponent } from '@/src/components/IconButton';
import { layout, radius, shadow, spacing, tint, type } from '@/constants/design';

export interface MediaLine {
    text: string;
    icon?: IconComponent;
    /** Color del texto e ícono (por defecto `theme.textMuted`). */
    color?: string;
}

interface MediaBaseProps {
    imageUrl?: string | null;
    /** Ícono cuando no hay foto. */
    fallbackIcon: IconComponent;
    /** Color del ícono y del fondo tenue sin foto (por defecto, neutro). */
    fallbackColor?: string;
    title: string;
    /** Renglones de detalle bajo el título (1–2 recomendado). */
    lines?: MediaLine[];
    onPress: () => void;
    accessibilityLabel: string;
}

function Photo({ imageUrl, fallbackIcon: Icon, fallbackColor, iconSize, style }: Pick<MediaBaseProps, 'imageUrl' | 'fallbackIcon' | 'fallbackColor'> & { iconSize: number; style: object }) {
    const { theme } = useTheme();
    if (imageUrl) return <Image source={{ uri: imageUrl }} style={style} resizeMode="cover" accessibilityIgnoresInvertColors />;
    return (
        <View style={[style, styles.fallback, { backgroundColor: fallbackColor ? fallbackColor + tint.faint : theme.backgroundSecondary }]}>
            <Icon size={iconSize} color={fallbackColor || theme.textMuted} strokeWidth={1.5} />
        </View>
    );
}

function Lines({ lines }: { lines?: MediaLine[] }) {
    const { theme } = useTheme();
    return (
        <>
            {lines?.map(({ text, icon: Icon, color }, i) => (
                <View key={i} style={styles.line}>
                    {Icon && <Icon size={layout.icon.xs} color={color || theme.textMuted} />}
                    <Text style={[type.caption, styles.flex, { color: color || theme.textMuted }]} numberOfLines={1}>{text}</Text>
                </View>
            ))}
        </>
    );
}

interface MediaCardProps extends MediaBaseProps {
    /** Ancho de la celda (de `useGridCell`). */
    width: number;
    /** Elementos sobre la foto (insignias). */
    topLeft?: React.ReactNode;
    topRight?: React.ReactNode;
}

export function MediaCard({ width, topLeft, topRight, title, lines, onPress, accessibilityLabel, ...photo }: MediaCardProps) {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.card, { width, backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={onPress}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <Photo {...photo} style={styles.cardPhoto} iconSize={layout.icon.xl * 1.5} />
            {topLeft ? <View style={styles.topLeft}>{topLeft}</View> : null}
            {topRight ? <View style={styles.topRight}>{topRight}</View> : null}
            <View style={styles.cardInfo}>
                <Text style={[type.subtitle, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                <Lines lines={lines} />
            </View>
        </TouchableOpacity>
    );
}

interface MediaRowProps extends MediaBaseProps {
    /** Elemento sobre la esquina de la miniatura (p. ej. punto de estado). */
    corner?: React.ReactNode;
    /** Elemento a la derecha del título (p. ej. una insignia). */
    trailing?: React.ReactNode;
}

export function MediaRow({ corner, trailing, title, lines, onPress, accessibilityLabel, ...photo }: MediaRowProps) {
    const { theme } = useTheme();
    return (
        <TouchableOpacity
            style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={onPress}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <View>
                <Photo {...photo} style={styles.thumb} iconSize={layout.icon.lg} />
                {corner ? <View style={styles.corner}>{corner}</View> : null}
            </View>
            <View style={styles.flex}>
                <View style={styles.titleRow}>
                    <Text style={[type.subtitle, styles.flex, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                    {trailing}
                </View>
                <Lines lines={lines} />
            </View>
            <ChevronRight size={layout.icon.sm} color={theme.textMuted} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    fallback: { alignItems: 'center', justifyContent: 'center' },
    line: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },

    card: {
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: 'hidden',
        ...shadow.card,
    },
    cardPhoto: { width: '100%', aspectRatio: 1 },
    topLeft: { position: 'absolute', top: spacing.sm, left: spacing.sm },
    topRight: { position: 'absolute', top: spacing.sm, right: spacing.sm },
    cardInfo: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xxs },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.card,
    },
    thumb: { width: layout.iconBox.lg + spacing.sm, height: layout.iconBox.lg + spacing.sm, borderRadius: radius.md },
    corner: { position: 'absolute', top: -spacing.xxs, right: -spacing.xxs },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
