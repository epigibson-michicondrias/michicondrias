/**
 * MiniBarChart — Barras simples para tendencias cortas (ventas por semana, citas por día…). Sin dependencias:
 * cada barra es una View con alto proporcional al máximo. Resalta la última barra (el periodo actual).
 *
 *   <MiniBarChart data={[{ label: '7 oct', value: 1200 }, …]} color={accent} formatValue={formatCurrency} />
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { radius, spacing, tint, type } from '@/constants/design';

interface MiniBarChartProps {
    data: { label: string; value: number }[];
    color?: string;
    height?: number;
    /** Formato del valor para lectores de pantalla. */
    formatValue?: (value: number) => string;
}

export default function MiniBarChart({ data, color, height = 96, formatValue = String }: MiniBarChartProps) {
    const { theme } = useTheme();
    const c = color || theme.primary;
    const max = Math.max(...data.map((d) => d.value), 0);

    return (
        <View
            style={styles.wrap}
            accessible
            accessibilityLabel={data.map((d) => `${d.label}: ${formatValue(d.value)}`).join(', ')}
        >
            <View style={[styles.bars, { height }]}>
                {data.map((d, i) => {
                    const isLast = i === data.length - 1;
                    // Las barras en cero se ven como una línea base para no dejar huecos
                    const h = max > 0 ? Math.max((d.value / max) * height, d.value > 0 ? 4 : 2) : 2;
                    return (
                        <View key={d.label + i} style={styles.col}>
                            <View style={[styles.bar, { height: h, backgroundColor: isLast ? c : c + tint.strong }]} />
                        </View>
                    );
                })}
            </View>
            <View style={styles.labels}>
                {data.map((d, i) => (
                    <Text key={d.label + i} style={[type.caption, styles.label, { color: theme.textMuted }]} numberOfLines={1}>{d.label}</Text>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: spacing.xs },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
    col: { flex: 1, justifyContent: 'flex-end' },
    bar: { borderTopLeftRadius: radius.xs, borderTopRightRadius: radius.xs },
    labels: { flexDirection: 'row', gap: spacing.xs },
    label: { flex: 1, textAlign: 'center' },
});
