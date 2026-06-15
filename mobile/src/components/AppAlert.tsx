import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Text, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useTheme } from '../../src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

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

const ICONS: Record<AlertType, any> = {
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

export function showAlert(config: AlertConfig) {
    if (globalSetAlert) {
        globalSetAlert({ ...config, visible: true });
    }
}

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
    const [alert, setAlert] = useState<InternalAlertConfig>({
        visible: false, type: 'info', title: '',
    });
    const scale = useRef(new Animated.Value(0.8)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const backdrop = useRef(new Animated.Value(0)).current;
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

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
                Animated.timing(scale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
                Animated.timing(backdrop, { toValue: 0, duration: 150, useNativeDriver: true }),
            ]).start();
        }
    }, [alert.visible]);

    const dismiss = () => {
        setAlert(prev => ({ ...prev, visible: false }));
    };

    const Icon = ICONS[alert.type];
    const colors = getAlertColors(alert.type, theme);

    if (!alert.visible && opacity._value === 0) return <>{children}</>;

    return (
        <>
            {children}
            <Modal transparent visible={alert.visible} animationType="none" statusBarTranslucent>
                <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={dismiss} />
                    <Animated.View style={[styles.container, {
                        transform: [{ scale }], opacity,
                        backgroundColor: theme.surface,
                        borderColor: colors.primary + '30',
                        shadowColor: colors.primary,
                    }]}>
                        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.overlay }]} onPress={dismiss}>
                            <X size={18} color={theme.textMuted} />
                        </TouchableOpacity>

                        <View style={[styles.iconCircle, { backgroundColor: colors.light }]}>
                            <Icon size={32} color={colors.primary} />
                        </View>

                        <Text style={[styles.title, { color: theme.text }]}>{alert.title}</Text>

                        {alert.message && (
                            <Text style={[styles.message, { color: theme.textMuted }]}>{alert.message}</Text>
                        )}

                        {alert.showCancel && (
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: theme.border }]}
                                onPress={() => { dismiss(); alert.onCancel?.(); }}
                                activeOpacity={0.85}
                            >
                                <Text style={[styles.cancelButtonText, { color: theme.textMuted }]}>
                                    {alert.cancelText || 'Cancelar'}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary }]}
                            onPress={() => { dismiss(); alert.onButtonPress?.(); }}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.buttonText}>{alert.buttonText || 'Entendido'}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    container: {
        width: width - 64,
        borderRadius: 28,
        borderWidth: 1,
        padding: 32,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.25,
        shadowRadius: 32,
        elevation: 16,
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    cancelButton: {
        width: '100%',
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        marginBottom: 10,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    button: {
        width: '100%',
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
