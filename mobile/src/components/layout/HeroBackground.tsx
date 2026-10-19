/**
 * HeroBackground — Fondo de degradado con esquinas inferiores redondeadas para cabeceras hero.
 *
 * El color sale, en este orden, de `module` (`MODULE_ACCENTS`), de `accent`, o de la ruta actual (`useScreenAccent`:
 * módulo o rol de la pantalla). Si nada aplica, usa el `heroGradient` azul de la marca. Mientras la pantalla tiene el
 * foco, pone la barra de estado en claro.
 * Encima van textos `theme.onHero` y botones `IconButton variant="glass"`.
 */
import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/hooks/useTheme';
import { accentGradient, radius, shadow, spacing } from '@/constants/design';
import { MODULE_ACCENTS, type ModuleKey } from '@/src/constants/modules';
import { useScreenAccent } from '@/src/hooks/useScreenAccent';
import HeroStatusBar from '@/src/components/layout/HeroStatusBar';

interface HeroBackgroundProps {
    children: React.ReactNode;
    /** Módulo cuyo color de identidad se usa. */
    module?: ModuleKey;
    /** Acento suelto (de `accents`): solo para forzar un color distinto al que deduce la ruta. */
    accent?: string;
    style?: StyleProp<ViewStyle>;
}

export default function HeroBackground({ children, module, accent, style }: HeroBackgroundProps) {
    const { theme } = useTheme();
    const routeAccent = useScreenAccent();
    const color = (module ? MODULE_ACCENTS[module] : accent) ?? routeAccent;

    return (
        <LinearGradient
            colors={color ? accentGradient(color) : theme.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.wrapper, style]}
        >
            <HeroStatusBar />
            {children}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        borderBottomLeftRadius: radius.xxl,
        borderBottomRightRadius: radius.xxl,
        paddingBottom: spacing.xs,
        ...shadow.raised,
    },
});
