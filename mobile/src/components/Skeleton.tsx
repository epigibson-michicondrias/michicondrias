/**
 * Skeleton — placeholder animado para estados de carga.
 *   <Skeleton height={16} width="60%" />  ·  <SkeletonCard />  ·  <SkeletonList count={4} />
 */
import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { radius, spacing } from '@/constants/design';

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 14, borderRadius = radius.sm, style }: SkeletonProps) {
    const { theme } = useTheme();
    const pulse = useRef(new Animated.Value(0.45)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.45, duration: 750, useNativeDriver: true }),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [pulse]);

    return (
        <Animated.View
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={[{ width, height, borderRadius, backgroundColor: theme.overlayHover, opacity: pulse }, style]}
        />
    );
}

export function SkeletonCard() {
    const { theme } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Skeleton width={44} height={44} borderRadius={radius.md} />
            <View style={{ flex: 1, gap: spacing.sm }}>
                <Skeleton width="55%" height={14} />
                <Skeleton width="85%" height={11} />
            </View>
        </View>
    );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
    return (
        <View style={{ gap: spacing.md, padding: spacing.xl }} accessibilityLabel="Cargando">
            {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
        </View>
    );
}


const styles = StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
});
