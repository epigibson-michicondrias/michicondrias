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
import { UI_SCALE_FACTORS, readUiScale } from '@/src/lib/uiScale';

/**
 * Factor de escala elegido por el usuario (Compacto 0.9 · Normal 1 · Grande 1.12). Se lee una vez al arrancar: todos
 * los tamaños de abajo (espaciado, letra, radios, íconos, alturas) se multiplican por él. Cambiarlo recarga la app.
 */
export const UI_SCALE = UI_SCALE_FACTORS[readUiScale()];

/** Aplica la escala del usuario a una medida base. */
export const scaled = (n: number): number => Math.round(n * UI_SCALE);

/** Escala de espaciado (múltiplos de 4). Premium: más compacta, intencional. */
export const spacing = {
    xxs: scaled(2),
    xs: scaled(4),
    sm: scaled(6),
    md: scaled(10),
    lg: scaled(14),
    xl: scaled(18),
    xxl: scaled(22),
    xxxl: scaled(28),
    huge: scaled(40),
} as const;

/** Radios de borde. Premium: radios más suaves, menos "burbuja". */
export const radius = {
    xs: scaled(4),
    sm: scaled(8),
    md: scaled(12),
    lg: scaled(16),
    xl: scaled(20),
    xxl: scaled(28),
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
    xs: scaled(10),
    sm: scaled(11),
    md: scaled(12),
    base: scaled(13),
    lg: scaled(14),
    xl: scaled(15),
    xxl: scaled(16),
    h3: scaled(18),
    h2: scaled(20),
    h1: scaled(22),
    display: scaled(26),
} as const;

/**
 * Tipografía premium: jerarquía refinada, pesos cuidados, letter-spacing sutil.
 * display/h1 para héroes, h2/title para secciones, body para lectura, label para micro-textos.
 *
 * La familia es **Hanken Grotesk** (marca; se carga en `app/_layout.tsx`). Cada peso es un archivo
 * estático de `@expo-google-fonts/hanken-grotesk`, así que el peso va en el `fontFamily` y NO en
 * `fontWeight` (combinarlos hace que iOS/Android caigan a la fuente del sistema).
 */
export const families = {
    regular: 'HankenGrotesk_400Regular',
    medium: 'HankenGrotesk_500Medium',
    semibold: 'HankenGrotesk_600SemiBold',
    bold: 'HankenGrotesk_700Bold',
    extrabold: 'HankenGrotesk_800ExtraBold',
    /** Monoespaciada (identificadores, códigos); no es de la marca. */
    mono: 'SpaceMono',
} as const;

export const type = {
    display: { fontFamily: families.extrabold, fontSize: scaled(28), letterSpacing: -0.6 } as TextStyle,
    /** Título de `ScreenHeader`. */
    screenTitle: { fontFamily: families.extrabold, fontSize: scaled(19), letterSpacing: -0.3 } as TextStyle,
    h1: { fontFamily: families.bold, fontSize: scaled(22), letterSpacing: -0.4 } as TextStyle,
    h2: { fontFamily: families.bold, fontSize: scaled(18), letterSpacing: -0.2 } as TextStyle,
    title: { fontFamily: families.semibold, fontSize: scaled(16), letterSpacing: -0.1 } as TextStyle,
    subtitle: { fontFamily: families.semibold, fontSize: scaled(14) } as TextStyle,
    body: { fontFamily: families.regular, fontSize: scaled(13), lineHeight: scaled(19) } as TextStyle,
    bodyStrong: { fontFamily: families.semibold, fontSize: scaled(13), lineHeight: scaled(19) } as TextStyle,
    caption: { fontFamily: families.medium, fontSize: scaled(11), lineHeight: scaled(15) } as TextStyle,
    label: { fontFamily: families.bold, fontSize: scaled(10), letterSpacing: 1, textTransform: 'uppercase' } as TextStyle,
    /** Etiqueta de campo en tipo oración (sin versalitas): para formularios y controles. */
    labelSentence: { fontFamily: families.semibold, fontSize: scaled(12) } as TextStyle,
    button: { fontFamily: families.semibold, fontSize: scaled(13), letterSpacing: 0.1 } as TextStyle,
} as const;

/** Medidas de layout comunes. Premium: más compactas, elegantes. */
export const layout = {
    /** Margen horizontal estándar de pantallas. */
    screenPadding: scaled(18),
    /** Alto mínimo táctil (accesibilidad). */
    minTouch: 44,
    /** Alto de botones. */
    buttonHeight: { sm: scaled(34), md: scaled(42), lg: scaled(50) },
    /** Alto de inputs. */
    inputHeight: scaled(44),
    /** Tamaño de iconos. */
    icon: { xs: scaled(12), sm: scaled(14), md: scaled(18), lg: scaled(22), xl: scaled(28) },
    /** Contenedor de icono en filas/tarjetas. */
    iconBox: { sm: scaled(30), md: scaled(38), lg: scaled(46) },
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
