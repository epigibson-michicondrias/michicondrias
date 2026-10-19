/**
 * Login — adopta AuthShell (U3). Fondo con heroGradient del tema, círculos decorativos,
 * teclado y scroll centrado. Formulario con tokens del design system.
 */
import React, { useState, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, View, Text, ActivityIndicator, Animated } from 'react-native';
import { useLogin } from '@/src/hooks/auth/useLogin';
import { useTheme } from '@/src/hooks/useTheme';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import AuthShell from '@/src/components/AuthShell';
import { spacing, radius, type, layout, shadow } from '@/constants/design';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    const { login, verify2FA, isLoggingIn, isVerifying2FA } = useLogin();
    const router = useRouter();
    const { theme, isDark } = useTheme();

    const animateTo2FA = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    };
    const animateToLogin = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            showAlert({ type: 'warning', title: 'Campos incompletos', message: 'Ingresa tu correo y contraseña.' });
            return;
        }
        login({ email: email.trim().toLowerCase(), password });
    };

    const handleVerify2FA = async () => {
        if (!otpCode.trim() || otpCode.trim().length < 6) {
            showAlert({ type: 'warning', title: 'Código inválido', message: 'Ingresa el código de 6 dígitos.' });
            return;
        }
        await verify2FA({ tempToken, code: otpCode.trim() });
    };

    const handleBack2FA = () => {
        setShow2FA(false);
        setTempToken('');
        setOtpCode('');
        animateToLogin();
    };

    return (
        <AuthShell>
            {/* Logo */}
            <View style={styles.logoSection}>
                <View style={[styles.logoRing, { borderColor: theme.heroGlass }]}>
                    <Image source={require('@/assets/images/logo.jpg')} style={styles.logoImage} resizeMode="contain" />
                </View>
                <Text style={[styles.appName, { color: theme.onHero }]}>Michicondrias</Text>
                <View style={styles.taglineRow}>
                    <Sparkles size={14} color={theme.primary} />
                    <Text style={[styles.tagline, { color: theme.onHeroMuted }]}>Cuidado integral para tus mascotas</Text>
                </View>
            </View>

            {/* Login Card */}
            {!show2FA && (
                <Animated.View style={[styles.card, {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderLight,
                    ...shadow.card,
                    opacity: fadeAnim,
                }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Bienvenido</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>Inicia sesión en tu cuenta</Text>

                    <View style={styles.field}>
                        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Email</Text>
                        <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Mail size={18} color={theme.primary} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="tu@email.com"
                                placeholderTextColor={theme.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                autoComplete="email"
                                returnKeyType="next"
                            />
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Contraseña</Text>
                        <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Lock size={18} color={theme.primary} />
                            <TextInput
                                style={[styles.input, { color: theme.text, flex: 1 }]}
                                placeholder="Tu contraseña"
                                placeholderTextColor={theme.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                textContentType="password"
                                autoComplete="password"
                                returnKeyType="go"
                                onSubmitEditing={handleLogin}
                            />
                            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                                {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotRow} accessibilityRole="button">
                        <Text style={[styles.forgotText, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.loginBtn, { backgroundColor: theme.primary }, isLoggingIn && { opacity: 0.7 }]}
                        onPress={handleLogin}
                        disabled={isLoggingIn}
                        accessibilityRole="button"
                        accessibilityLabel="Entrar"
                    >
                        {isLoggingIn ? (
                            <ActivityIndicator color={theme.onPrimary} size="small" />
                        ) : (
                            <>
                                <Text style={[styles.loginBtnText, { color: theme.onPrimary }]}>Entrar</Text>
                                <ArrowRight size={20} color={theme.onPrimary} strokeWidth={2.5} />
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* 2FA Card */}
            {show2FA && (
                <Animated.View style={[styles.card, {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderLight,
                    ...shadow.card,
                    transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                }]}>
                    <TouchableOpacity onPress={handleBack2FA} style={styles.backRow} accessibilityRole="button">
                        <ArrowLeft size={18} color={theme.textMuted} />
                        <Text style={[styles.backText, { color: theme.textMuted }]}>Volver</Text>
                    </TouchableOpacity>

                    <View style={styles.twoFAHeader}>
                        <View style={[styles.twoFAIcon, { backgroundColor: theme.success + '15' }]}>
                            <ShieldCheck size={28} color={theme.success} />
                        </View>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Verificación 2FA</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.textMuted, marginBottom: spacing.lg }]}>
                            Ingresa el código de 6 dígitos de tu app de autenticación.
                        </Text>
                    </View>

                    <TextInput
                        style={[styles.otpInput, {
                            backgroundColor: theme.background,
                            borderColor: theme.success + '40',
                            color: theme.text,
                        }]}
                        placeholder="000000"
                        placeholderTextColor={theme.textMuted}
                        value={otpCode}
                        onChangeText={setOtpCode}
                        keyboardType="number-pad"
                        maxLength={6}
                        textContentType="oneTimeCode"
                        accessibilityLabel="Código de verificación"
                    />

                    <TouchableOpacity
                        style={[styles.loginBtn, { backgroundColor: theme.success }, isVerifying2FA && { opacity: 0.7 }]}
                        onPress={handleVerify2FA}
                        disabled={isVerifying2FA}
                        accessibilityRole="button"
                        accessibilityLabel="Verificar código"
                    >
                        {isVerifying2FA ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <Text style={[styles.loginBtnText, { color: '#fff' }]}>Verificar</Text>
                                <ShieldCheck size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Footer */}
            {!show2FA && (
                <View style={styles.footer}>
                    <Text style={[styles.footerLabel, { color: theme.onHeroMuted }]}>¿No tienes cuenta?</Text>
                    <TouchableOpacity onPress={() => router.push('/register')} accessibilityRole="button">
                        <Text style={[styles.footerLink, { color: theme.primary }]}> Regístrate aquí</Text>
                    </TouchableOpacity>
                </View>
            )}
        </AuthShell>
    );
}

const styles = StyleSheet.create({
    logoSection: { alignItems: 'center', marginBottom: spacing.xl },
    logoRing: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logoImage: { width: 72, height: 72, borderRadius: 36 },
    appName: { fontSize: type.title.fontSize, fontWeight: '800', letterSpacing: -0.5 },
    taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xs },
    tagline: { fontSize: type.body.fontSize, fontWeight: '500' },
    card: {
        borderRadius: radius.xl,
        borderWidth: 1,
        padding: spacing.xl,
    },
    cardTitle: { fontSize: type.h1.fontSize, fontWeight: '800', marginBottom: spacing.xs },
    cardSubtitle: { fontSize: type.body.fontSize, marginBottom: spacing.xl },
    field: { marginBottom: spacing.lg },
    fieldLabel: { fontSize: type.label.fontSize, fontWeight: '700', marginBottom: spacing.sm },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.lg,
        borderWidth: 1,
        paddingHorizontal: spacing.lg,
        minHeight: layout.minTouch + 4,
        gap: spacing.sm,
    },
    input: { flex: 1, fontSize: type.body.fontSize, paddingVertical: spacing.md },
    forgotRow: { alignSelf: 'flex-end', marginBottom: spacing.xl },
    forgotText: { fontSize: type.caption.fontSize, fontWeight: '600' },
    loginBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.lg,
        minHeight: layout.minTouch + 8,
        gap: spacing.sm,
    },
    loginBtnText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
    backText: { fontSize: type.body.fontSize, fontWeight: '600' },
    twoFAHeader: { alignItems: 'center', marginBottom: spacing.lg },
    twoFAIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    otpInput: {
        borderRadius: radius.lg,
        borderWidth: 2,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        fontSize: type.h1.fontSize,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 8,
        marginBottom: spacing.xl,
    },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    footerLabel: { fontSize: type.body.fontSize },
    footerLink: { fontSize: type.body.fontSize, fontWeight: '700' },
});
