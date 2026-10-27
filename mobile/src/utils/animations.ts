/**
 * animations — Smooth cross-platform layout transitions.
 * Wraps LayoutAnimation with safe fallback for web and older Android.
 */
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental &&
    typeof UIManager.setLayoutAnimationEnabledExperimental === 'function'
) {
    try {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    } catch {
        // Ignore if unsupported
    }
}

export function animateLayout() {
    try {
        if (Platform.OS !== 'web') {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
    } catch {
        // Ignore layout animation errors
    }
}
