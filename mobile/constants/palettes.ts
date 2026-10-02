export interface Palette {
  name: string;
  dark: {
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
  };
  light: {
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
  };
}

// ═══════════════════════════════════════════════════════════════════
//  CAMBIA ESTA LÍNEA PARA PROBAR DIFERENTES PALETAS
// ═══════════════════════════════════════════════════════════════════
export const ACTIVE_PALETTE = 'premium';

// ═══════════════════════════════════════════════════════════════════
//  PALETAS DISPONIBLES
// ═══════════════════════════════════════════════════════════════════

export const palettes: Record<string, Palette> = {

  // ── Premium (Midnight & Gold) ───────────────────────────────
  premium: {
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
      warning: '#e9c883',
      warningLight: 'rgba(233, 200, 131, 0.14)',
      info: '#5aa9ff',
      infoLight: 'rgba(90, 169, 255, 0.14)',
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
      warning: '#b8893a',
      warningLight: '#f7edd6',
      info: '#2f6fd0',
      infoLight: '#e8f0fc',
    },
  },

  // ── Indigo (Default) ────────────────────────────────────────
  indigo: {
    name: 'Indigo Elegante',
    dark: {
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      background: '#0f0f1a',
      tint: '#f8fafc',
      tabIconDefault: '#475569',
      tabIconSelected: '#f8fafc',
      surface: '#16213e',
      border: 'rgba(148, 163, 184, 0.12)',
      borderLight: 'rgba(148, 163, 184, 0.06)',
      error: '#ef4444',
      errorLight: 'rgba(239, 68, 68, 0.15)',
      primary: '#7c3aed',
      primaryLight: 'rgba(124, 58, 237, 0.15)',
      secondary: '#ec4899',
      secondaryLight: 'rgba(236, 72, 153, 0.15)',
      accent: '#f59e0b',
      accentLight: 'rgba(245, 158, 11, 0.15)',
      backgroundSecondary: '#1a1a2e',
      card: '#16213e',
      cardBorder: 'rgba(148, 163, 184, 0.1)',
      overlay: 'rgba(255,255,255,0.03)',
      overlayHover: 'rgba(255,255,255,0.06)',
      glassBg: 'rgba(22, 33, 62, 0.8)',
      glassBorder: 'rgba(148, 163, 184, 0.1)',
      divider: 'rgba(148, 163, 184, 0.08)',
      inputBg: 'rgba(255,255,255,0.05)',
      inputBorder: 'rgba(148, 163, 184, 0.15)',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeText: '#fbbf24',
      success: '#10b981',
      successLight: 'rgba(16, 185, 129, 0.15)',
      warning: '#f59e0b',
      warningLight: 'rgba(245, 158, 11, 0.15)',
      info: '#3b82f6',
      infoLight: 'rgba(59, 130, 246, 0.15)',
    },
    light: {
      text: '#0f0f1a',
      textMuted: '#64748b',
      background: '#f8fafc',
      tint: '#7c3aed',
      tabIconDefault: '#94a3b8',
      tabIconSelected: '#7c3aed',
      surface: '#ffffff',
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      error: '#ef4444',
      errorLight: 'rgba(239, 68, 68, 0.15)',
      primary: '#7c3aed',
      primaryLight: '#ede9fe',
      secondary: '#ec4899',
      secondaryLight: '#fdf2f8',
      accent: '#f59e0b',
      accentLight: '#fef3c7',
      backgroundSecondary: '#f1f5f9',
      card: '#ffffff',
      cardBorder: '#e2e8f0',
      overlay: 'rgba(0,0,0,0.04)',
      overlayHover: 'rgba(0,0,0,0.06)',
      glassBg: 'rgba(255,255,255,0.7)',
      glassBorder: 'rgba(0,0,0,0.06)',
      divider: '#e2e8f0',
      inputBg: '#f8fafc',
      inputBorder: '#cbd5e1',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
      success: '#10b981',
      successLight: '#d1fae5',
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      info: '#3b82f6',
      infoLight: '#dbeafe',
    },
  },

  // ── Ocean Blue ──────────────────────────────────────────────
  ocean: {
    name: 'Ocean Blue',
    dark: {
      text: '#e8f4f8',
      textMuted: '#7aa8bf',
      background: '#0a1628',
      tint: '#e8f4f8',
      tabIconDefault: '#3d6b82',
      tabIconSelected: '#e8f4f8',
      surface: '#0f2438',
      border: 'rgba(122, 168, 191, 0.12)',
      borderLight: 'rgba(122, 168, 191, 0.06)',
      error: '#f87171',
      errorLight: 'rgba(248, 113, 113, 0.15)',
      primary: '#0ea5e9',
      primaryLight: 'rgba(14, 165, 233, 0.15)',
      secondary: '#06b6d4',
      secondaryLight: 'rgba(6, 182, 212, 0.15)',
      accent: '#fbbf24',
      accentLight: 'rgba(251, 191, 36, 0.15)',
      backgroundSecondary: '#0f1e32',
      card: '#0f2438',
      cardBorder: 'rgba(122, 168, 191, 0.1)',
      overlay: 'rgba(255,255,255,0.03)',
      overlayHover: 'rgba(255,255,255,0.06)',
      glassBg: 'rgba(15, 36, 56, 0.85)',
      glassBorder: 'rgba(122, 168, 191, 0.12)',
      divider: 'rgba(122, 168, 191, 0.08)',
      inputBg: 'rgba(255,255,255,0.05)',
      inputBorder: 'rgba(122, 168, 191, 0.15)',
      badgeBg: 'rgba(251, 191, 36, 0.15)',
      badgeText: '#fbbf24',
      success: '#34d399',
      successLight: 'rgba(52, 211, 153, 0.15)',
      warning: '#fbbf24',
      warningLight: 'rgba(251, 191, 36, 0.15)',
      info: '#38bdf8',
      infoLight: 'rgba(56, 189, 248, 0.15)',
    },
    light: {
      text: '#0c1929',
      textMuted: '#5b8aa0',
      background: '#f0f9ff',
      tint: '#0ea5e9',
      tabIconDefault: '#94c5d8',
      tabIconSelected: '#0ea5e9',
      surface: '#ffffff',
      border: '#bae6fd',
      borderLight: '#e0f2fe',
      error: '#ef4444',
      errorLight: '#fee2e2',
      primary: '#0ea5e9',
      primaryLight: '#e0f2fe',
      secondary: '#06b6d4',
      secondaryLight: '#cffafe',
      accent: '#fbbf24',
      accentLight: '#fef3c7',
      backgroundSecondary: '#e0f2fe',
      card: '#ffffff',
      cardBorder: '#bae6fd',
      overlay: 'rgba(0,0,0,0.04)',
      overlayHover: 'rgba(0,0,0,0.06)',
      glassBg: 'rgba(255,255,255,0.75)',
      glassBorder: 'rgba(14, 165, 233, 0.1)',
      divider: '#bae6fd',
      inputBg: '#f0f9ff',
      inputBorder: '#7dd3fc',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
      success: '#10b981',
      successLight: '#d1fae5',
      warning: '#fbbf24',
      warningLight: '#fef3c7',
      info: '#0ea5e9',
      infoLight: '#e0f2fe',
    },
  },

  // ── Rose Gold ───────────────────────────────────────────────
  rose: {
    name: 'Rose Gold',
    dark: {
      text: '#fdf2f4',
      textMuted: '#b8a0a6',
      background: '#1a0a10',
      tint: '#fdf2f4',
      tabIconDefault: '#6b4c55',
      tabIconSelected: '#fdf2f4',
      surface: '#26141c',
      border: 'rgba(184, 160, 166, 0.12)',
      borderLight: 'rgba(184, 160, 166, 0.06)',
      error: '#f87171',
      errorLight: 'rgba(248, 113, 113, 0.15)',
      primary: '#e11d48',
      primaryLight: 'rgba(225, 29, 72, 0.15)',
      secondary: '#f472b6',
      secondaryLight: 'rgba(244, 114, 182, 0.15)',
      accent: '#d4a574',
      accentLight: 'rgba(212, 165, 116, 0.15)',
      backgroundSecondary: '#201018',
      card: '#26141c',
      cardBorder: 'rgba(184, 160, 166, 0.1)',
      overlay: 'rgba(255,255,255,0.03)',
      overlayHover: 'rgba(255,255,255,0.06)',
      glassBg: 'rgba(38, 20, 28, 0.85)',
      glassBorder: 'rgba(184, 160, 166, 0.12)',
      divider: 'rgba(184, 160, 166, 0.08)',
      inputBg: 'rgba(255,255,255,0.05)',
      inputBorder: 'rgba(184, 160, 166, 0.15)',
      badgeBg: 'rgba(212, 165, 116, 0.15)',
      badgeText: '#d4a574',
      success: '#34d399',
      successLight: 'rgba(52, 211, 153, 0.15)',
      warning: '#d4a574',
      warningLight: 'rgba(212, 165, 116, 0.15)',
      info: '#f472b6',
      infoLight: 'rgba(244, 114, 182, 0.15)',
    },
    light: {
      text: '#1a0a10',
      textMuted: '#8a6b73',
      background: '#fef7f8',
      tint: '#e11d48',
      tabIconDefault: '#c9a8ae',
      tabIconSelected: '#e11d48',
      surface: '#ffffff',
      border: '#f5dce0',
      borderLight: '#fef0f2',
      error: '#e11d48',
      errorLight: '#ffe4e6',
      primary: '#e11d48',
      primaryLight: '#ffe4e6',
      secondary: '#f472b6',
      secondaryLight: '#fce7f3',
      accent: '#d4a574',
      accentLight: '#faf0e6',
      backgroundSecondary: '#fef0f2',
      card: '#ffffff',
      cardBorder: '#f5dce0',
      overlay: 'rgba(0,0,0,0.04)',
      overlayHover: 'rgba(0,0,0,0.06)',
      glassBg: 'rgba(255,255,255,0.8)',
      glassBorder: 'rgba(225, 29, 72, 0.08)',
      divider: '#f5dce0',
      inputBg: '#fef7f8',
      inputBorder: '#f9b4be',
      badgeBg: '#faf0e6',
      badgeText: '#8b6914',
      success: '#10b981',
      successLight: '#d1fae5',
      warning: '#d4a574',
      warningLight: '#faf0e6',
      info: '#f472b6',
      infoLight: '#fce7f3',
    },
  },

  // ── Emerald Forest ──────────────────────────────────────────
  emerald: {
    name: 'Emerald Forest',
    dark: {
      text: '#ecfdf5',
      textMuted: '#86b5a0',
      background: '#071a0f',
      tint: '#ecfdf5',
      tabIconDefault: '#3b7a5e',
      tabIconSelected: '#ecfdf5',
      surface: '#0d2a1a',
      border: 'rgba(134, 181, 160, 0.12)',
      borderLight: 'rgba(134, 181, 160, 0.06)',
      error: '#f87171',
      errorLight: 'rgba(248, 113, 113, 0.15)',
      primary: '#10b981',
      primaryLight: 'rgba(16, 185, 129, 0.15)',
      secondary: '#059669',
      secondaryLight: 'rgba(5, 150, 105, 0.15)',
      accent: '#f59e0b',
      accentLight: 'rgba(245, 158, 11, 0.15)',
      backgroundSecondary: '#0a2214',
      card: '#0d2a1a',
      cardBorder: 'rgba(134, 181, 160, 0.1)',
      overlay: 'rgba(255,255,255,0.03)',
      overlayHover: 'rgba(255,255,255,0.06)',
      glassBg: 'rgba(13, 42, 26, 0.85)',
      glassBorder: 'rgba(134, 181, 160, 0.12)',
      divider: 'rgba(134, 181, 160, 0.08)',
      inputBg: 'rgba(255,255,255,0.05)',
      inputBorder: 'rgba(134, 181, 160, 0.15)',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeText: '#fbbf24',
      success: '#34d399',
      successLight: 'rgba(52, 211, 153, 0.15)',
      warning: '#f59e0b',
      warningLight: 'rgba(245, 158, 11, 0.15)',
      info: '#06b6d4',
      infoLight: 'rgba(6, 182, 212, 0.15)',
    },
    light: {
      text: '#064e3b',
      textMuted: '#5b9479',
      background: '#f0fdf4',
      tint: '#059669',
      tabIconDefault: '#86b5a0',
      tabIconSelected: '#059669',
      surface: '#ffffff',
      border: '#bbf7d0',
      borderLight: '#dcfce7',
      error: '#ef4444',
      errorLight: '#fee2e2',
      primary: '#059669',
      primaryLight: '#d1fae5',
      secondary: '#10b981',
      secondaryLight: '#d1fae5',
      accent: '#f59e0b',
      accentLight: '#fef3c7',
      backgroundSecondary: '#dcfce7',
      card: '#ffffff',
      cardBorder: '#bbf7d0',
      overlay: 'rgba(0,0,0,0.04)',
      overlayHover: 'rgba(0,0,0,0.06)',
      glassBg: 'rgba(255,255,255,0.8)',
      glassBorder: 'rgba(5, 150, 105, 0.1)',
      divider: '#bbf7d0',
      inputBg: '#f0fdf4',
      inputBorder: '#86efac',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
      success: '#059669',
      successLight: '#d1fae5',
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      info: '#06b6d4',
      infoLight: '#cffafe',
    },
  },

  // ── Warm Sunset ─────────────────────────────────────────────
  sunset: {
    name: 'Warm Sunset',
    dark: {
      text: '#fef3e2',
      textMuted: '#b89b7a',
      background: '#1a0f08',
      tint: '#fef3e2',
      tabIconDefault: '#7a5c3e',
      tabIconSelected: '#fef3e2',
      surface: '#2a1a0e',
      border: 'rgba(184, 155, 122, 0.12)',
      borderLight: 'rgba(184, 155, 122, 0.06)',
      error: '#f87171',
      errorLight: 'rgba(248, 113, 113, 0.15)',
      primary: '#f97316',
      primaryLight: 'rgba(249, 115, 22, 0.15)',
      secondary: '#fb923c',
      secondaryLight: 'rgba(251, 146, 60, 0.15)',
      accent: '#eab308',
      accentLight: 'rgba(234, 179, 8, 0.15)',
      backgroundSecondary: '#221509',
      card: '#2a1a0e',
      cardBorder: 'rgba(184, 155, 122, 0.1)',
      overlay: 'rgba(255,255,255,0.03)',
      overlayHover: 'rgba(255,255,255,0.06)',
      glassBg: 'rgba(42, 26, 14, 0.85)',
      glassBorder: 'rgba(184, 155, 122, 0.12)',
      divider: 'rgba(184, 155, 122, 0.08)',
      inputBg: 'rgba(255,255,255,0.05)',
      inputBorder: 'rgba(184, 155, 122, 0.15)',
      badgeBg: 'rgba(234, 179, 8, 0.15)',
      badgeText: '#eab308',
      success: '#34d399',
      successLight: 'rgba(52, 211, 153, 0.15)',
      warning: '#eab308',
      warningLight: 'rgba(234, 179, 8, 0.15)',
      info: '#fb923c',
      infoLight: 'rgba(251, 146, 60, 0.15)',
    },
    light: {
      text: '#431407',
      textMuted: '#9a6c4f',
      background: '#fffbeb',
      tint: '#ea580c',
      tabIconDefault: '#c2a882',
      tabIconSelected: '#ea580c',
      surface: '#ffffff',
      border: '#fed7aa',
      borderLight: '#ffedd5',
      error: '#ef4444',
      errorLight: '#fee2e2',
      primary: '#ea580c',
      primaryLight: '#ffedd5',
      secondary: '#f97316',
      secondaryLight: '#fff7ed',
      accent: '#eab308',
      accentLight: '#fef9c3',
      backgroundSecondary: '#ffedd5',
      card: '#ffffff',
      cardBorder: '#fed7aa',
      overlay: 'rgba(0,0,0,0.04)',
      overlayHover: 'rgba(0,0,0,0.06)',
      glassBg: 'rgba(255,255,255,0.8)',
      glassBorder: 'rgba(234, 88, 12, 0.1)',
      divider: '#fed7aa',
      inputBg: '#fffbeb',
      inputBorder: '#fdba74',
      badgeBg: '#fef9c3',
      badgeText: '#854d0e',
      success: '#10b981',
      successLight: '#d1fae5',
      warning: '#eab308',
      warningLight: '#fef9c3',
      info: '#f97316',
      infoLight: '#fff7ed',
    },
  },
};

export function getPalette(name?: string): Palette {
  const key = name || ACTIVE_PALETTE;
  return palettes[key] || palettes.indigo;
}
