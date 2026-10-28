import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { families, radius, spacing, type } from '@/constants/design';

/** Barra de pasos del checkout (Envío → Pago). `current`: 1 = dirección, 2 = pago. */
export default function CheckoutSteps({ current }: { current: 1 | 2 }) {
    const { theme } = useTheme();

    const renderStep = (step: 1 | 2, label: string) => {
        const done = current > step;
        const active = current === step;
        const fill = done || active ? theme.accent : theme.backgroundSecondary;
        const fg = done || active ? theme.onAccent : theme.textMuted;

        return (
            <View style={styles.stepItem} key={label}>
                <View style={[styles.stepCircle, { backgroundColor: fill }]}>
                    <Text style={[styles.stepNumber, { color: fg }]}>{done ? '✓' : step}</Text>
                </View>
                <Text
                    style={[
                        type.caption,
                        {
                            fontFamily: families.bold,
                            color: done || active ? theme.accent : theme.textMuted,
                        },
                    ]}
                >
                    {label}
                </Text>
            </View>
        );
    };

    return (
        <View
            style={styles.stepsBar}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: 2, now: current, text: `Paso ${current} de 2` }}
        >
            {renderStep(1, 'Envío')}
            <View style={[styles.stepLine, { backgroundColor: current > 1 ? theme.accent : theme.border }]} />
            {renderStep(2, 'Pago')}
        </View>
    );
}

const styles = StyleSheet.create({
    stepsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xs,
    },
    stepItem: {
        alignItems: 'center',
        gap: 4,
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumber: {
        fontFamily: families.bold,
        fontSize: 13,
    },
    stepLine: {
        flex: 1,
        height: 2,
        marginHorizontal: spacing.md,
        marginBottom: 16,
    },
});
