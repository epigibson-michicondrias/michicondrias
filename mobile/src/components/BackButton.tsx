import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';

interface BackButtonProps {
    onPress?: () => void;
    color?: string;
    style?: any;
}

export default function BackButton({ onPress, color, style }: BackButtonProps) {
    const { theme, colorScheme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.overlayHover }, style]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            <ChevronLeft size={22} color={color || theme.text} strokeWidth={2.5} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
