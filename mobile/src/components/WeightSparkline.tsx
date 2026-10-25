import React from 'react';
import { families, font, radius, spacing } from '@/constants/design';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '@/src/hooks/useTheme';

interface WeightData {
    date: string;
    weight: number;
}

interface WeightSparklineProps {
    data: WeightData[];
    color: string;
    height?: number;
}

export default function WeightSparkline({ data, color, height = 60 }: WeightSparklineProps) {
    const { theme } = useTheme();

    if (data.length < 2) return null;

    const screenWidth = Dimensions.get('window').width - 80;
    const maxWeight = Math.max(...data.map(d => d.weight)) * 1.1;
    const minWeight = Math.min(...data.map(d => d.weight)) * 0.9;
    const range = maxWeight - minWeight;

    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * screenWidth,
        y: height - ((d.weight - minWeight) / range) * height
    }));

    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            <View style={styles.header}>
                <Text style={[styles.label, { color }]}>EVOLUCIÓN DE PESO (kg)</Text>
                <Text style={[styles.currentWeight, { color: theme.text }]}>{data[data.length - 1].weight} kg</Text>
            </View>
            <Svg width={screenWidth} height={height} style={styles.svg}>
                <Path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {points.map((p, i) => (
                    <Circle key={i} cx={p.x} cy={p.y} r="4" fill={color} />
                ))}
            </Svg>
            <View style={styles.footer}>
                <Text style={[styles.dateText, { color: theme.textMuted }]}>{new Date(data[0].date).toLocaleDateString()}</Text>
                <Text style={[styles.dateText, { color: theme.textMuted }]}>{new Date(data[data.length - 1].date).toLocaleDateString()}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.xl,
        marginBottom: spacing.md,
        padding: spacing.xl,
        borderRadius: radius.xl,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: font.xs,
        fontFamily: families.black,
        letterSpacing: 1,
    },
    currentWeight: {
        fontSize: font.xxl,
        fontFamily: families.black,
    },
    svg: {
        marginTop: spacing.xs,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    dateText: {
        fontSize: font.xs,
        fontFamily: families.bold,
    }
});
