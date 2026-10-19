import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import IconButton, { type IconButtonVariant } from '@/src/components/IconButton';

interface BackButtonProps {
    onPress?: () => void;
    color?: string;
    variant?: IconButtonVariant;
    size?: 'sm' | 'md';
    style?: StyleProp<ViewStyle>;
}

/** Botón "Volver" estándar: un `IconButton` con chevron. */
export default function BackButton({ onPress, color, variant, size, style }: BackButtonProps) {
    return (
        <IconButton
            icon={ChevronLeft}
            accessibilityLabel="Volver"
            onPress={onPress}
            variant={variant}
            size={size}
            color={color}
            strokeWidth={2.5}
            style={style}
        />
    );
}
