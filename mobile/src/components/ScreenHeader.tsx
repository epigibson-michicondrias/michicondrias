import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackButton from './BackButton';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export default function ScreenHeader({ title, subtitle, onBack, rightAction }: ScreenHeaderProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                {onBack && <BackButton onPress={onBack} />}
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                        {title}
                    </Text>
                </View>
                {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
                {!rightAction && onBack && <View style={styles.spacer} />}
            </View>
            {subtitle && (
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    rightAction: {
        marginLeft: 12,
    },
    spacer: {
        width: 42,
        marginLeft: 12,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 6,
        marginLeft: 54,
    },
});
