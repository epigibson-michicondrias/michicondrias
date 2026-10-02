/**
 * SectionHeader — título de sección con icono opcional y acción "Ver todo".
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, type } from '@/constants/design';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    /** Estilo "etiqueta" en mayúsculas (para listas de Más/Ajustes). */
    overline?: boolean;
}

export default function SectionHeader({ title, subtitle, icon, actionLabel, onAction, overline }: SectionHeaderProps) {
    const { theme } = useTheme();
    return (
        <View style={styles.row}>
            <View style={styles.left}>
                {icon}
                <View style={{ flexShrink: 1 }}>
                    <Text
                        accessibilityRole="header"
                        style={overline ? [type.label, { color: theme.textMuted }] : [type.title, { color: theme.text }]}
                        numberOfLines={1}
                    >
                        {overline ? title.toUpperCase() : title}
                    </Text>
                    {subtitle ? <Text style={[type.caption, { color: theme.textMuted }]}>{subtitle}</Text> : null}
                </View>
            </View>
            {actionLabel && onAction ? (
                <TouchableOpacity onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={8}>
                    <Text style={[type.bodyStrong, { color: theme.primary }]}>{actionLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
});
