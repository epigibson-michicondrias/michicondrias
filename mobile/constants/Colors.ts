const tintColorLight = '#7c3aed';
const tintColorDark = '#f8fafc';

export default {
  light: {
    text: '#0f0f1a',
    textMuted: '#64748b',
    background: '#f8fafc',
    tint: tintColorLight,
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    surface: '#ffffff',
    border: '#e2e8f0',
    error: '#ef4444',
    primary: '#7c3aed',
    secondary: '#ec4899',
    accent: '#f59e0b',
    backgroundSecondary: '#f1f5f9',
  },
  dark: {
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    background: '#0f0f1a', // Match web bg-primary
    tint: tintColorDark,
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
    surface: '#16213e', // Match web bg-card
    border: 'rgba(148, 163, 184, 0.1)',
    error: '#ef4444',
    primary: '#7c3aed',
    secondary: '#ec4899',
    accent: '#f59e0b',
    backgroundSecondary: '#1a1a2e',
  },
};
