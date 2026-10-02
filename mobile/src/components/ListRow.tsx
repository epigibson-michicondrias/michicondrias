/**
 * ListRow — fila estándar de lista (icono tintado + título + descripción + chevron/badge).
 * Úsala en menús, ajustes y listas de herramientas.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { layout, radius, shadow, spacing, tint, type } from '@/constants/design';

interface ListRowProps {
    icon: React.ComponentType<any>;
    label: string;
    desc?: string;
    color?: string;
    onPress?: () => void;
    /** Texto de badge a la derecha (p. ej. "Nuevo", "3"). */
    badge?: string;
    destructive?: boolean;
}

export default function ListRow({ icon: Icon, label, desc, color, onPress, badge, destructive }: ListRowProps) {
    const { theme } = useTheme();
    const c = destructive ? theme.error : color || theme.primary;
    return (
        <TouchableOpacity
            activeOpacity={0.75}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={desc ? `${label}. ${desc}` : label}
            style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }, shadow.card]}
        >
            <View style={[styles.iconBox, { backgroundColor: c + tint.soft }]}>
                <Icon size={layout.icon.md} color={c} />
            </View>
            <View style={styles.info}>
                <Text style={[type.subtitle, { color: destructive ? theme.error : theme.text }]} numberOfLines={1}>{label}</Text>
                {desc ? <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={1}>{desc}</Text> : null}
            </View>
            {badge ? (
                <View style={[styles.badge, { backgroundColor: theme.accentLight }]}>
                    <Text style={[styles.badgeText, { color: theme.accent }]}>{badge}</Text>
                </View>
            ) : null}
            {!destructive && <ChevronRight size={layout.icon.sm} color={theme.textMuted} />}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', alignItems: 'center', padding: spacing.md + 2, borderRadius: radius.lg,
        borderWidth: 1, gap: spacing.md, minHeight: layout.minTouch + 12,
    },
    iconBox: { width: layout.iconBox.md, height: layout.iconBox.md, borderRadius: radius.md - 2, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
    badgeText: { fontSize: 10, fontWeight: '800' },
});
