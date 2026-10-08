import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Button from '@/src/components/Button';
import { spacing, type, layout } from '@/constants/design';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    /** Una sola acción clara (CLAUDE.md §4). */
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: theme.overlay, borderColor: theme.border }]}>
                {icon}
            </View>
            <Text style={[type.title, styles.center, { color: theme.text }]}>{title}</Text>
            {subtitle ? <Text style={[type.body, styles.center, styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
            {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} fullWidth={false} /> : null}
        </View>
    );
}

const ICON_BOX = layout.iconBox.lg + spacing.xl;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxxl,
        paddingVertical: spacing.huge,
        gap: spacing.sm,
    },
    iconContainer: {
        width: ICON_BOX,
        height: ICON_BOX,
        borderRadius: ICON_BOX / 2,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    center: { textAlign: 'center' },
    subtitle: { marginBottom: spacing.lg },
});
