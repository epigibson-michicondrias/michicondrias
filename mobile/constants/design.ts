/**
 * Design tokens de Michicondrias — ÚNICA fuente de verdad para espaciado, radios,
 * sombras, tipografía y tamaños. Estética premium: bordes finos, sombras sutiles,
 * tipografía refinada, espaciado intencional.
 *
 * Uso:
 *   import { spacing, radius, shadow, type, layout } from '@/constants/design';
 *   <View style={{ padding: spacing.lg, borderRadius: radius.lg, ...shadow.card }} />
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';

/** Escala de espaciado (múltiplos de 4). Premium: más compacta, intencional. */
export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    huge: 40,
} as const;

/** Radios de borde. Premium: radios más suaves, menos "burbuja". */
export const radius = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    pill: 999,
} as const;

/** Sombras (nativo + web). Premium: sutiles, casi imperceptibles. */
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
    card: makeShadow(0.04, 6, 1, 1),
    raised: makeShadow(0.08, 12, 4, 4),
    floating: makeShadow(0.14, 20, 8, 10),
} as const;

/**
 * Escala de tamaños de letra. Para estilos que necesitan solo el tamaño (con su propio peso/color); si el texto
 * encaja en un estilo completo, usa `type`. Nada de `fontSize` numéricos sueltos en pantallas.
 */
export const font = {
    xs: 10,
    sm: 11,
    md: 12,
    base: 13,
    lg: 14,
    xl: 15,
    xxl: 16,
    h3: 18,
    h2: 20,
    h1: 22,
    display: 26,
} as const;

/**
 * Tipografía premium: jerarquía refinada, pesos cuidados, letter-spacing sutil.
 * display/h1 para héroes, h2/title para secciones, body para lectura, label para micro-textos.
 */
export const type = {
    display: { fontSize: 28, fontWeight: '700', letterSpacing: -0.6 } as TextStyle,
    /** Título de `ScreenHeader`. */
    screenTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 } as TextStyle,
    h1: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4 } as TextStyle,
    h2: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 } as TextStyle,
    title: { fontSize: 16, fontWeight: '600', letterSpacing: -0.1 } as TextStyle,
    subtitle: { fontSize: 14, fontWeight: '600' } as TextStyle,
    body: { fontSize: 13, fontWeight: '400', lineHeight: 19 } as TextStyle,
    bodyStrong: { fontSize: 13, fontWeight: '600', lineHeight: 19 } as TextStyle,
    caption: { fontSize: 11, fontWeight: '500', lineHeight: 15 } as TextStyle,
    label: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' } as TextStyle,
    /** Etiqueta de campo en tipo oración (sin versalitas): para formularios y controles. */
    labelSentence: { fontSize: 12, fontWeight: '600' } as TextStyle,
    button: { fontSize: 13, fontWeight: '600', letterSpacing: 0.1 } as TextStyle,
} as const;

/** Medidas de layout comunes. Premium: más compactas, elegantes. */
export const layout = {
    /** Margen horizontal estándar de pantallas. */
    screenPadding: 18,
    /** Alto mínimo táctil (accesibilidad). */
    minTouch: 44,
    /** Alto de botones. */
    buttonHeight: { sm: 34, md: 42, lg: 50 },
    /** Alto de inputs. */
    inputHeight: 44,
    /** Tamaño de iconos. */
    icon: { xs: 12, sm: 14, md: 18, lg: 22, xl: 28 },
    /** Contenedor de icono en filas/tarjetas. */
    iconBox: { sm: 30, md: 38, lg: 46 },
} as const;

/**
 * Acentos de dominio (categorías de Explorar, atajos y herramientas por rol). Paleta corta y armonizada con
 * *Midnight & Gold*: tonos medios que se leen sobre el fondo claro y el oscuro. Se usan como `color` de ícono y,
 * con `tint`, como fondo suave (`accents.health + tint.soft`). No uses hex de Tailwind sueltos: elige uno de estos.
 */
export const accents = {
    health: '#2fb886',
    info: '#3d8ef0',
    services: '#7d6ff0',
    shop: '#d4609a',
    community: '#e2605e',
    warning: '#e0912f',
    teal: '#25a3a0',
    gold: '#c99a45',
    neutral: '#7c8698',
    danger: '#e2605e',
    // Tonos de identidad por módulo/rol (ver `src/constants/modules.ts`): repartidos en la rueda de color para que
    // ningún módulo comparta tono.
    orange: '#e8743b',
    brown: '#b07a4f',
    yellow: '#d9b526',
    lime: '#8db33a',
    green: '#46a85a',
    cyan: '#1fa5c4',
    indigo: '#5b6ee8',
    purple: '#9a5be0',
    orchid: '#c45cc4',
    rose: '#e0507f',
    slate: '#5f6675',
} as const;

export type AccentKey = keyof typeof accents;

/** Mezcla un color hex (#rrggbb) con negro. `amount` 0 = igual, 1 = negro. */
function darken(hex: string, amount: number): string {
    const n = parseInt(hex.slice(1, 7), 16);
    const channel = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount));
    return `#${[16, 8, 0].map((s) => channel(s).toString(16).padStart(2, '0')).join('')}`;
}

/** Luminancia relativa WCAG de un color hex (#rrggbb): 0 = negro, 1 = blanco. */
function luminance(hex: string): number {
    const n = parseInt(hex.slice(1, 7), 16);
    const lin = (shift: number) => {
        const c = ((n >> shift) & 255) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(16) + 0.7152 * lin(8) + 0.0722 * lin(0);
}

/** Luminancia máxima del inicio del degradado: el texto blanco (y el 70 % de `onHeroMuted`) se lee con holgura. */
const HERO_MAX_LUMINANCE = 0.12;

/**
 * Degradado de cabecera a partir del acento de un módulo (p. ej. `accents.danger` → rojo profundo). Cada acento se
 * oscurece lo necesario para que el texto blanco (`theme.onHero`) tenga buen contraste: los tonos claros (amarillo,
 * lima) bajan más que los medios.
 */
export function accentGradient(accent: string): readonly [string, string] {
    let amount = 0.25;
    while (amount < 0.6 && luminance(darken(accent, amount)) > HERO_MAX_LUMINANCE) amount += 0.05;
    return [darken(accent, amount), darken(accent, Math.max(0.6, amount + 0.25))];
}

/** Duraciones de animación (ms). */
export const motion = { fast: 150, base: 220, slow: 360 } as const;

/** Opacidad para tintes de iconos/badges: `color + tint.soft` (hex alpha). */
export const tint = { faint: '10', soft: '18', medium: '28', strong: '40' } as const;
