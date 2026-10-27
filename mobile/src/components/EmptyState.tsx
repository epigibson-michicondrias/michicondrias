import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import Button from '@/src/components/Button';
import { haptic } from '@/src/utils/haptics';
import { spacing, type, layout, radius, font, families } from '@/constants/design';

export interface EmptySuggestion {
    label: string;
    icon?: React.ReactNode;
    onPress: () => void;
}

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    /** Una sola acción clara (CLAUDE.md §4). */
    actionLabel?: string;
    onAction?: () => void;
    /** Sugerencias rápidas cuando un filtro devuelve 0 resultados */
    suggestions?: EmptySuggestion[];
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction, suggestions }: EmptyStateProps) {
    const { theme } = useTheme();

    const handleAction = () => {
        haptic.selection();
        onAction?.();
    };

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                {icon}
            </View>
            <Text style={[type.title, styles.center, { color: theme.text }]}>{title}</Text>
            {subtitle ? <Text style={[type.body, styles.center, styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}

            {suggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={[styles.suggestionsTitle, { color: theme.textMuted }]}>
                        Sugerencias rápidas:
                    </Text>
                    <View style={styles.suggestionsRow}>
                        {suggestions.map((s, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.suggestionChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                onPress={() => {
                                    haptic.selection();
                                    s.onPress();
                                }}
                                accessibilityRole="button"
                                accessibilityLabel={s.label}
                            >
                                {s.icon}
                                <Text style={[styles.suggestionText, { color: theme.primary }]}>
                                    {s.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {actionLabel && onAction ? (
                <Button label={actionLabel} onPress={handleAction} fullWidth={false} style={styles.action} />
            ) : null}
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
        paddingVertical: spacing.xxxl,
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
    subtitle: { marginBottom: spacing.md },
    suggestionsContainer: {
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    suggestionsTitle: {
        fontSize: font.xs,
        fontFamily: families.medium,
    },
    suggestionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    suggestionText: {
        fontSize: font.xs,
        fontFamily: families.semibold,
    },
    action: { alignSelf: 'center' },
});
