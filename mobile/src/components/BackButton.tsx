import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import IconButton, { type IconButtonVariant } from '@/src/components/IconButton';

interface BackButtonProps {
    onPress?: () => void;
    color?: string;
    variant?: IconButtonVariant;
    style?: StyleProp<ViewStyle>;
}

/** Botón "Volver" estándar: un `IconButton` con chevron. */
export default function BackButton({ onPress, color, variant, style }: BackButtonProps) {
    return (
        <IconButton
            icon={ChevronLeft}
            accessibilityLabel="Volver"
            onPress={onPress}
            variant={variant}
            color={color}
            strokeWidth={2.5}
            style={style}
        />
    );
}
