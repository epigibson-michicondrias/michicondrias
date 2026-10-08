/** Colores de un modo (claro u oscuro). Se leen con `useTheme().theme`. */
export interface ThemeColors {
  text: string;
  textMuted: string;
  background: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  surface: string;
  border: string;
  borderLight: string;
  error: string;
  errorLight: string;
  primary: string;
  /** Texto e íconos sobre fondo `primary` (chips activos, botones). */
  onPrimary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;
  overlay: string;
  overlayHover: string;
  glassBg: string;
  glassBorder: string;
  divider: string;
  inputBg: string;
  inputBorder: string;
  badgeBg: string;
  badgeText: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  /** Texto sobre `heroGradient` (cabeceras azul medianoche de Inicio, Explorar y Tienda). */
  onHero: string;
  onHeroMuted: string;
  /** Degradado del hero: siempre azul medianoche (identidad de marca), en ambos modos. */
  heroGradient: readonly [string, string];
  /** Superficie translúcida y su borde sobre el hero (botones, buscador, estadísticas). */
  heroGlass: string;
  heroGlassBorder: string;
  /** Estado de la barra del sistema sobre `background`. */
  statusBar: 'light' | 'dark';
}

export interface Palette {
  name: string;
  dark: ThemeColors;
  light: ThemeColors;
}

// ═══════════════════════════════════════════════════════════════════
//  PALETA ÚNICA: Midnight & Gold (claro / oscuro). Se lee con useTheme().theme.
// ═══════════════════════════════════════════════════════════════════

const midnightGold: Palette = {
  name: 'Midnight & Gold',
  dark: {
    text: '#f5f1e8',
    textMuted: '#9aa3b5',
    background: '#0b0e17',
    tint: '#e9c883',
    tabIconDefault: '#5b6478',
    tabIconSelected: '#e9c883',
    surface: '#131826',
    border: 'rgba(233, 200, 131, 0.14)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    error: '#f0716f',
    errorLight: 'rgba(240, 113, 111, 0.14)',
    primary: '#4f8cff',
    onPrimary: '#ffffff',
    primaryLight: 'rgba(79, 140, 255, 0.14)',
    secondary: '#8b7cf6',
    secondaryLight: 'rgba(139, 124, 246, 0.14)',
    accent: '#e9c883',
    accentLight: 'rgba(233, 200, 131, 0.14)',
    backgroundSecondary: '#0f1320',
    card: '#131826',
    cardBorder: 'rgba(233, 200, 131, 0.12)',
    overlay: 'rgba(255,255,255,0.03)',
    overlayHover: 'rgba(255,255,255,0.06)',
    glassBg: 'rgba(19, 24, 38, 0.85)',
    glassBorder: 'rgba(233, 200, 131, 0.16)',
    divider: 'rgba(255, 255, 255, 0.06)',
    inputBg: 'rgba(255,255,255,0.045)',
    inputBorder: 'rgba(233, 200, 131, 0.2)',
    badgeBg: 'rgba(233, 200, 131, 0.14)',
    badgeText: '#e9c883',
    success: '#3ecf9a',
    successLight: 'rgba(62, 207, 154, 0.14)',
    warning: '#f2a541',
    warningLight: 'rgba(242, 165, 65, 0.14)',
    info: '#5aa9ff',
    infoLight: 'rgba(90, 169, 255, 0.14)',
    onHero: '#ffffff',
    onHeroMuted: 'rgba(255, 255, 255, 0.7)',
    heroGradient: ['#1c2f6b', '#101c3d'],
    heroGlass: 'rgba(255, 255, 255, 0.14)',
    heroGlassBorder: 'rgba(255, 255, 255, 0.2)',
    statusBar: 'light',
  },
  light: {
    text: '#141824',
    textMuted: '#667085',
    background: '#faf8f4',
    tint: '#1f3a8a',
    tabIconDefault: '#a0a7b8',
    tabIconSelected: '#1f3a8a',
    surface: '#ffffff',
    border: '#ebe5d8',
    borderLight: '#f3efe6',
    error: '#d64545',
    errorLight: '#fde8e8',
    primary: '#2f5fd0',
    onPrimary: '#ffffff',
    primaryLight: '#e8eefc',
    secondary: '#6a5ae0',
    secondaryLight: '#eeebfd',
    accent: '#b8893a',
    accentLight: '#f7edd6',
    backgroundSecondary: '#f3efe6',
    card: '#ffffff',
    cardBorder: '#ebe5d8',
    overlay: 'rgba(20,24,36,0.04)',
    overlayHover: 'rgba(20,24,36,0.07)',
    glassBg: 'rgba(255,255,255,0.8)',
    glassBorder: 'rgba(184, 137, 58, 0.18)',
    divider: '#ebe5d8',
    inputBg: '#ffffff',
    inputBorder: '#ddd5c3',
    badgeBg: '#f7edd6',
    badgeText: '#7a5a1e',
    success: '#16a36e',
    successLight: '#dcf5ea',
    warning: '#c46a0c',
    warningLight: '#fdf0e1',
    info: '#2f6fd0',
    infoLight: '#e8f0fc',
    onHero: '#ffffff',
    onHeroMuted: 'rgba(255, 255, 255, 0.75)',
    heroGradient: ['#1f3a8a', '#14275e'],
    heroGlass: 'rgba(255, 255, 255, 0.14)',
    heroGlassBorder: 'rgba(255, 255, 255, 0.2)',
    statusBar: 'dark',
  },
};

export function getPalette(): Palette {
  return midnightGold;
}
