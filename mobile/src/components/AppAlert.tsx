/**
 * AppAlert — modal de confirmación/aviso global (`showAlert`). Premium: tokens de diseño,
 * tipografía de marca, botones reales y objetivos táctiles ≥ 44 px.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Text, TouchableOpacity, useWindowDimensions, Modal, Pressable } from 'react-native';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { layout, radius, shadow, spacing, type } from '@/constants/design';
import IconButton from '@/src/components/IconButton';
import Button from '@/src/components/Button';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertConfig {
    type: AlertType;
    title: string;
    message?: string;
    buttonText?: string;
    onButtonPress?: () => void;
    cancelText?: string;
    onCancel?: () => void;
    showCancel?: boolean;
}

interface InternalAlertConfig extends AlertConfig {
    visible: boolean;
}

const ICONS: Record<AlertType, React.ComponentType<{ size?: number; color?: string }>> = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

function getAlertColors(type: AlertType, theme: any) {
    const map: Record<AlertType, { primary: string; light: string }> = {
        success: { primary: theme.success, light: theme.successLight },
        error: { primary: theme.error, light: theme.errorLight },
        warning: { primary: theme.warning, light: theme.warningLight },
        info: { primary: theme.info, light: theme.infoLight },
    };
    return map[type];
}

let globalSetAlert: ((config: InternalAlertConfig) => void) | null = null;

// F23 — «un solo aviso al vencer la sesión»: cuando la sesión expira, AuthContext avisa y lleva al login;
// las acciones en vuelo caen con el mismo error y sus `onError` no deben apilar avisos de error encima.
let sessionExpiredNoticeUntil = 0;

/** Lo llama AuthContext al mostrar el aviso de sesión vencida: silencia los avisos de error de unos segundos. */
export function notifySessionExpired() {
    sessionExpiredNoticeUntil = Date.now() + 5000;
}

export function showAlert(config: AlertConfig) {
    if (config.type === 'error' && Date.now() < sessionExpiredNoticeUntil) return;
    if (globalSetAlert) {
        globalSetAlert({ ...config, visible: true });
    }
}

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
    const [alert, setAlert] = useState<InternalAlertConfig>({
        visible: false, type: 'info', title: '',
    });
    const scale = useRef(new Animated.Value(0.9)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const backdrop = useRef(new Animated.Value(0)).current;
    const { theme } = useTheme();
    const { width } = useWindowDimensions();

    useEffect(() => {
        globalSetAlert = setAlert;
        return () => { globalSetAlert = null; };
    }, []);

    useEffect(() => {
        if (alert.visible) {
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, tension: 65, friction: 9, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
                Animated.timing(backdrop, { toValue: 0, duration: 150, useNativeDriver: true }),
            ]).start();
        }
    }, [alert.visible, scale, opacity, backdrop]);

    const dismiss = () => {
        setAlert(prev => ({ ...prev, visible: false }));
    };

    const Icon = ICONS[alert.type];
    const colors = getAlertColors(alert.type, theme);

    if (!alert.visible) return <>{children}</>;

    return (
        <>
            {children}
            <Modal transparent visible={alert.visible} animationType="none" statusBarTranslucent onRequestClose={dismiss}>
                <Animated.View style={[styles.backdrop, { opacity: backdrop, backgroundColor: theme.overlay }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} accessibilityRole="button" accessibilityLabel="Cerrar aviso" />
                    <Animated.View style={[styles.container, {
                        transform: [{ scale }], opacity,
                        backgroundColor: theme.surface,
                        borderColor: colors.primary + '30',
                        maxWidth: 420,
                        width: width - spacing.huge,
                        ...shadow.floating,
                    }]}>
                        <IconButton
                            icon={X}
                            accessibilityLabel="Cerrar"
                            onPress={dismiss}
                            variant="subtle"
                            size="sm"
                            style={styles.closeBtn}
                        />

                        <View style={[styles.iconCircle, { backgroundColor: colors.light }]}>
                            <Icon size={layout.icon.xl} color={colors.primary} />
                        </View>

                        <Text accessibilityRole="header" style={[type.h2, styles.title, { color: theme.text }]}>{alert.title}</Text>

                        {alert.message && (
                            <Text style={[type.body, styles.message, { color: theme.textMuted }]}>{alert.message}</Text>
                        )}

                        {alert.showCancel && (
                            <Button
                                label={alert.cancelText || 'Cancelar'}
                                variant="secondary"
                                onPress={() => { dismiss(); alert.onCancel?.(); }}
                                style={styles.action}
                            />
                        )}
                        <Button
                            label={alert.buttonText || 'Entendido'}
                            variant={alert.type === 'error' ? 'danger' : alert.type === 'warning' ? 'gold' : 'primary'}
                            onPress={() => { dismiss(); alert.onButtonPress?.(); }}
                            style={styles.action}
                        />
                    </Animated.View>
                </Animated.View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    container: {
        borderRadius: radius.xxl,
        borderWidth: 1,
        padding: spacing.xxl,
        paddingTop: spacing.xxxl,
        alignItems: 'center',
    },
    closeBtn: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
    },
    iconCircle: {
        width: layout.iconBox.lg + spacing.xl,
        height: layout.iconBox.lg + spacing.xl,
        borderRadius: radius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    action: {
        width: '100%',
        marginTop: spacing.sm,
    },
});
