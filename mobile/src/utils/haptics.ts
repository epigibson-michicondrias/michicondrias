/**
 * haptics — Safe cross-platform haptic feedback utilities.
 * Gracefully no-ops or uses navigator.vibrate on web.
 */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const haptic = {
    /** Light tap: chips, toggles, subtle button presses */
    selection: () => {
        try {
            if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
            } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(8);
            }
        } catch {
            // Ignore if device doesn't support haptics
        }
    },

    /** Light impact: opening modals, expanding panels */
    light: () => {
        try {
            if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(12);
            }
        } catch {}
    },

    /** Medium impact: primary actions, submit, toggling switch */
    medium: () => {
        try {
            if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(20);
            }
        } catch {}
    },

    /** Success notification: saved, published, refreshed */
    success: () => {
        try {
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate([15, 50, 15]);
            }
        } catch {}
    },

    /** Warning/Error notification: validations, errors, delete */
    warning: () => {
        try {
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate([25, 40, 25]);
            }
        } catch {}
    },
};
