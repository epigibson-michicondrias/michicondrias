/**
 * ScreenHeader — Standardized header for all screens
 * Replaces the repeated header pattern across 100+ screens
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
    /** Screen title */
    title: string;
    /** Optional subtitle below the title */
    subtitle?: string;
    /** Show back button (default: true) */
    showBack?: boolean;
    /** Custom back handler (default: router.back()) */
    onBack?: () => void;
    /** Right-side action icon component (e.g., Plus from lucide) */
    actionIcon?: React.ComponentType<{ size: number; color: string }>;
    /** Handler for action button */
    onAction?: () => void;
    /** Optional custom right element (overrides actionIcon) */
    rightElement?: React.ReactNode;
    /** Optional custom left element (overrides back button) */
    leftElement?: React.ReactNode;
    /** Optional gradient colors for premium headers */
    gradient?: string[];
}

export default function ScreenHeader({
    title,
    subtitle,
    showBack = true,
    onBack,
    actionIcon: ActionIcon,
    onAction,
    rightElement,
    leftElement,
    gradient,
}: ScreenHeaderProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const textColor = gradient ? '#fff' : theme.text;
    const subtitleColor = gradient ? 'rgba(255,255,255,0.8)' : theme.textMuted;
    const backBtnStyle = gradient
        ? { backgroundColor: 'rgba(255,255,255,0.15)' }
        : { backgroundColor: theme.surface, borderColor: theme.cardBorder, borderWidth: 1 };
    const actionBtnStyle = gradient
        ? { backgroundColor: 'rgba(255,255,255,0.15)' }
        : { backgroundColor: theme.primary };

    const headerContent = (
        <View style={[
            styles.header,
            gradient ? { paddingTop: insets.top + 12 } : undefined,
        ]}>
            <View style={styles.headerLeft}>
                {leftElement ? (
                    leftElement
                ) : showBack ? (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={[styles.backBtn, backBtnStyle]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ChevronLeft size={22} color={textColor} />
                    </TouchableOpacity>
                ) : null}
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle ? (
                        <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            </View>

            <View style={styles.headerRight}>
                {rightElement ? (
                    rightElement
                ) : ActionIcon && onAction ? (
                    <TouchableOpacity
                        onPress={onAction}
                        style={[styles.actionBtn, actionBtnStyle]}
                    >
                        <ActionIcon size={24} color="#fff" />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );

    if (gradient) {
        return (
            <LinearGradient
                colors={gradient as any}
                style={styles.gradientWrapper}
            >
                {headerContent}
            </LinearGradient>
        );
    }

    return headerContent;
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    actionBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradientWrapper: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
});
