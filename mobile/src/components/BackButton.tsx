import React from 'react';
import { TouchableOpacity, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { radius, layout } from '@/constants/design';

interface BackButtonProps {
    onPress?: () => void;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export default function BackButton({ onPress, color, style }: BackButtonProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.overlayHover }, style]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
            <ChevronLeft size={layout.icon.lg - 2} color={color || theme.text} strokeWidth={2.5} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        width: layout.minTouch,
        height: layout.minTouch,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
