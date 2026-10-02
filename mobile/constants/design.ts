/**
 * Design tokens de Michicondrias — ÚNICA fuente de verdad para espaciado, radios,
 * sombras, tipografía y tamaños. Los colores viven en constants/palettes.ts
 * (se leen con useTheme().theme). Usa estos tokens en pantallas nuevas y al migrar las existentes.
 *
 * Uso:
 *   import { spacing, radius, shadow, type, layout } from '@/constants/design';
 *   <View style={{ padding: spacing.lg, borderRadius: radius.lg, ...shadow.card }} />
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';

/** Escala de espaciado (múltiplos de 4). */
export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
} as const;

/** Radios de borde. */
export const radius = {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    pill: 999,
} as const;

/** Sombras (nativo + web). `card` para tarjetas de lista, `raised` para elementos destacados, `floating` para modales/tab bar. */
function makeShadow(opacity: number, radiusPx: number, offsetY: number, elevation: number): ViewStyle {
    return Platform.select<ViewStyle>({
        web: { boxShadow: `0px ${offsetY}px ${radiusPx}px rgba(0,0,0,${opacity})` } as ViewStyle,
        default: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: offsetY },
            shadowOpacity: opacity,
            shadowRadius: radiusPx,
            elevation,
        },
    }) as ViewStyle;
}

export const shadow = {
    none: {} as ViewStyle,
    card: makeShadow(0.06, 8, 2, 2),
    raised: makeShadow(0.12, 14, 6, 6),
    floating: makeShadow(0.2, 22, 10, 12),
} as const;

/** Tipografía. Usa `type.title`, `type.body`, etc. y añade `color` desde el tema. */
export const type = {
    display: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5 } as TextStyle,
    h1: { fontSize: 24, fontWeight: '900', letterSpacing: -0.3 } as TextStyle,
    h2: { fontSize: 20, fontWeight: '800' } as TextStyle,
    title: { fontSize: 17, fontWeight: '800' } as TextStyle,
    subtitle: { fontSize: 15, fontWeight: '700' } as TextStyle,
    body: { fontSize: 14, fontWeight: '500', lineHeight: 20 } as TextStyle,
    bodyStrong: { fontSize: 14, fontWeight: '700', lineHeight: 20 } as TextStyle,
    caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 } as TextStyle,
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' } as TextStyle,
    button: { fontSize: 15, fontWeight: '800' } as TextStyle,
} as const;

/** Medidas de layout comunes. */
export const layout = {
    /** Margen horizontal estándar de pantallas. */
    screenPadding: 20,
    /** Alto mínimo táctil (accesibilidad). */
    minTouch: 44,
    /** Alto de botones. */
    buttonHeight: { sm: 38, md: 48, lg: 56 },
    /** Alto de inputs. */
    inputHeight: 52,
    /** Tamaño de iconos. */
    icon: { xs: 14, sm: 16, md: 20, lg: 24, xl: 32 },
    /** Contenedor de icono en filas/tarjetas. */
    iconBox: { sm: 36, md: 44, lg: 52 },
} as const;

/** Colores semánticos de dominio que no dependen del tema (categorías, estados). */
export const accents = {
    health: '#10b981',
    services: '#8b5cf6',
    shop: '#ec4899',
    community: '#f43f5e',
    info: '#0ea5e9',
    warning: '#f59e0b',
    danger: '#ef4444',
    neutral: '#64748b',
    gold: '#e9c883',
} as const;

/** Duraciones de animación (ms). */
export const motion = { fast: 150, base: 220, slow: 360 } as const;

/** Opacidad para tintes de iconos/badges: `color + tint.soft` (hex alpha). */
export const tint = { faint: '10', soft: '18', medium: '28', strong: '40' } as const;
