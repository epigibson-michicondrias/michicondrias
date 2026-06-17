/**
 * ScreenContainer — Base container for all screens
 * Provides themed background and safe area spacing
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';

interface ScreenContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    /** If true, removes default padding */
    noPadding?: boolean;
}

export default function ScreenContainer({ children, style, noPadding }: ScreenContainerProps) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }, noPadding && styles.noPadding, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    noPadding: {
        padding: 0,
    },
});
