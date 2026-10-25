/**
 * AuthShell — esqueleto común de las pantallas de `(auth)`: fondo con degradado del tema,
 * círculos decorativos, teclado y scroll centrado. Cada pantalla aporta su contenido.
 * U3 lo adopta en login, register, forgot-password y reset-password (una sola identidad).
 */
import React from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/hooks/useTheme';
import { spacing, radius } from '@/constants/design';

interface AuthShellProps {
    children: React.ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
    const { theme, isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <LinearGradient
                colors={theme.heroGradient}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            <View style={[styles.deco1, { backgroundColor: theme.heroGlass }]} />
            <View style={[styles.deco2, { backgroundColor: theme.heroGlass }]} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    deco1: {
        position: 'absolute',
        top: -80,
        right: -60,
        width: 240,
        height: 240,
        borderRadius: radius.pill,
    },
    deco2: {
        position: 'absolute',
        bottom: 120,
        left: -100,
        width: 200,
        height: 200,
        borderRadius: radius.pill,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: spacing.xxxl,
        paddingVertical: 48,
        justifyContent: 'center',
    },
});
