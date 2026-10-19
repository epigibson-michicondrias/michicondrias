/**
 * OrderTracking — Seguimiento de un pedido pagado: Pagado → En camino → Entregado.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { TRACKING_STEPS, trackingIndex } from '@/src/features/tienda/orderStatus';
import { layout, radius, spacing, type } from '@/constants/design';

const DOT = layout.iconBox.sm - spacing.sm;

export default function OrderTracking({ status }: { status: string }) {
    const { theme } = useTheme();
    const current = trackingIndex(status);

    return (
        <View accessibilityLabel={`Seguimiento: ${TRACKING_STEPS[Math.max(current, 0)].label}`}>
            {TRACKING_STEPS.map((step, i) => {
                const done = i <= current;
                const isLast = i === TRACKING_STEPS.length - 1;
                return (
                    <View key={step.status} style={styles.step}>
                        <View style={styles.rail}>
                            <View style={[styles.dot, done ? { backgroundColor: theme.success } : { borderColor: theme.border, borderWidth: 2 }]}>
                                {done ? <Check size={layout.icon.xs} color={theme.onPrimary} strokeWidth={3} /> : null}
                            </View>
                            {!isLast ? <View style={[styles.line, { backgroundColor: i < current ? theme.success : theme.border }]} /> : null}
                        </View>
                        <View style={[styles.text, !isLast && styles.textGap]}>
                            <Text style={[type.bodyStrong, { color: done ? theme.text : theme.textMuted }]}>{step.label}</Text>
                            {i === current ? <Text style={[type.caption, { color: theme.textMuted }]}>{step.hint}</Text> : null}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    step: { flexDirection: 'row', gap: spacing.md },
    rail: { alignItems: 'center', width: DOT },
    dot: { width: DOT, height: DOT, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
    line: { width: 2, flex: 1, minHeight: spacing.lg, marginVertical: spacing.xxs },
    text: { flex: 1, paddingTop: spacing.xxs },
    textGap: { paddingBottom: spacing.md },
});
