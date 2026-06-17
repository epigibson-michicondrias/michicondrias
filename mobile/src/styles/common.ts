/**
 * Shared themeable styles factory
 * Usage: const styles = createCommonStyles(theme);
 */
import { StyleSheet } from 'react-native';

type Theme = Record<string, string>;

/**
 * Create common styles using the current theme tokens.
 * Call inside your component: const common = createCommonStyles(theme);
 */
export function createCommonStyles(theme: Theme) {
    return StyleSheet.create({
        // ── Screen ──────────────────────────────
        screenContainer: {
            flex: 1,
            backgroundColor: theme.background,
        },

        // ── Header ──────────────────────────────
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 60,
            paddingHorizontal: 24,
            paddingBottom: 20,
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: '900',
            color: theme.text,
        },
        headerSubtitle: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.textMuted,
            marginTop: 2,
        },

        // ── Cards ───────────────────────────────
        card: {
            backgroundColor: theme.surface,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            padding: 20,
            marginBottom: 16,
        },
        cardCompact: {
            backgroundColor: theme.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            padding: 16,
            marginBottom: 12,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: '800',
            color: theme.text,
            marginBottom: 4,
        },
        cardSubtitle: {
            fontSize: 13,
            color: theme.textMuted,
            fontWeight: '500',
        },

        // ── Lists ───────────────────────────────
        listContent: {
            paddingHorizontal: 24,
            paddingBottom: 40,
        },
        listSeparator: {
            height: 1,
            backgroundColor: theme.divider,
            marginVertical: 8,
        },

        // ── Form ────────────────────────────────
        formContainer: {
            paddingHorizontal: 24,
            paddingBottom: 40,
        },
        formSection: {
            marginBottom: 24,
        },
        formSectionTitle: {
            fontSize: 16,
            fontWeight: '800',
            color: theme.text,
            marginBottom: 16,
        },
        formField: {
            marginBottom: 18,
        },
        formLabel: {
            fontSize: 13,
            fontWeight: '700',
            color: theme.textMuted,
            marginBottom: 8,
            marginLeft: 4,
        },
        formInput: {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 16,
            height: 54,
            fontSize: 15,
            fontWeight: '500',
            color: theme.text,
        },
        formInputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 16,
            height: 54,
            gap: 12,
        },
        formTextArea: {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 14,
            fontSize: 15,
            fontWeight: '500',
            color: theme.text,
            minHeight: 100,
            textAlignVertical: 'top',
        },

        // ── Buttons ─────────────────────────────
        buttonPrimary: {
            height: 56,
            borderRadius: 16,
            backgroundColor: theme.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
        },
        buttonPrimaryText: {
            color: '#fff',
            fontSize: 17,
            fontWeight: '800',
        },
        buttonSecondary: {
            height: 56,
            borderRadius: 16,
            backgroundColor: theme.primaryLight,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
        },
        buttonSecondaryText: {
            color: theme.primary,
            fontSize: 17,
            fontWeight: '800',
        },
        buttonIcon: {
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: theme.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },

        // ── Badges ──────────────────────────────
        badge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            backgroundColor: theme.primaryLight,
        },
        badgeText: {
            fontSize: 12,
            fontWeight: '700',
            color: theme.primary,
        },

        // ── Chips / Filters ─────────────────────
        chipRow: {
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 24,
            marginBottom: 16,
        },
        chip: {
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 14,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.cardBorder,
        },
        chipActive: {
            backgroundColor: theme.primaryLight,
            borderColor: theme.primary,
        },
        chipText: {
            fontSize: 13,
            fontWeight: '700',
            color: theme.textMuted,
        },
        chipTextActive: {
            color: theme.primary,
        },

        // ── Stats Row ───────────────────────────
        statsRow: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 20,
        },
        statCard: {
            flex: 1,
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            alignItems: 'center',
        },
        statValue: {
            fontSize: 24,
            fontWeight: '900',
            color: theme.text,
        },
        statLabel: {
            fontSize: 11,
            fontWeight: '700',
            color: theme.textMuted,
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },

        // ── Misc ────────────────────────────────
        row: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        rowBetween: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        divider: {
            height: 1,
            backgroundColor: theme.divider,
            marginVertical: 16,
        },
        avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.primaryLight,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarLarge: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.primaryLight,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
}
