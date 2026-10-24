/**
 * Forgot Password — adopta AuthShell (U3). Envío de código de 6 dígitos con validación inline.
 */
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { Mail, ArrowRight, Send, KeyRound, CheckCircle } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import { useRouter } from 'expo-router';
import { usePasswordReset } from '@/src/hooks/auth/usePasswordReset';
import AuthShell from '@/src/components/AuthShell';
import AuthField from '@/src/components/AuthField';
import { validateEmail } from '@/src/utils/validators';
import { spacing, radius, type, layout, shadow } from '@/constants/design';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const { requestReset, isRequesting } = usePasswordReset();
    const router = useRouter();
    const { theme } = useTheme();

    const handleSend = () => {
        const check = validateEmail(email);
        if (!check.valid) {
            setEmailError(check.message!);
            return;
        }
        setEmailError(null);
        requestReset(email.trim().toLowerCase(), {
            onSuccess: () => setSent(true),
            onError: (error) => {
                setEmailError(error.message || 'No se pudo enviar el correo. Inténtalo de nuevo.');
            },
        });
    };

    return (
        <AuthShell>
            <BackButton onPress={() => router.back()} style={styles.backBtn} />

            {!sent ? (
                <>
                    <View style={styles.headerSection}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
                            <KeyRound size={28} color={theme.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.onHero }]}>¿Olvidaste tu contraseña?</Text>
                        <Text style={[styles.subtitle, { color: theme.onHeroMuted }]}>
                            Te enviaremos un código de 6 dígitos para restablecerla
                        </Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight, ...shadow.card }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Restablecer contraseña</Text>
                        <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
                            Ingresa el correo asociado a tu cuenta.
                        </Text>

                        <AuthField
                            label="Correo electrónico"
                            icon={Mail}
                            value={email}
                            onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(null); }}
                            error={emailError}
                            placeholder="tu@email.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            autoComplete="email"
                            returnKeyType="go"
                            onSubmitEditing={handleSend}
                        />

                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: theme.primary }, isRequesting && { opacity: 0.7 }]}
                            onPress={handleSend}
                            disabled={isRequesting}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Enviar código"
                        >
                            <Text style={[styles.sendBtnText, { color: theme.onPrimary }]}>Enviar código</Text>
                            <Send size={18} color={theme.onPrimary} />
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.headerSection}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.success + '15' }]}>
                            <CheckCircle size={32} color={theme.success} />
                        </View>
                        <Text style={[styles.title, { color: theme.onHero }]}>¡Revisa tu correo!</Text>
                        <Text style={[styles.subtitle, { color: theme.onHeroMuted }]}>
                            Si existe una cuenta con <Text style={{ fontWeight: '700' }}>{email}</Text>, recibirás un código de 6 dígitos.
                        </Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <View style={styles.tipsContainer}>
                            <View style={styles.tipItem}>
                                <View style={[styles.tipDot, { backgroundColor: theme.success }]} />
                                <Text style={[styles.tipText, { color: theme.textMuted }]}>Revisa tu carpeta de spam.</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <View style={[styles.tipDot, { backgroundColor: theme.primary }]} />
                                <Text style={[styles.tipText, { color: theme.textMuted }]}>El código expira en 30 minutos.</Text>
                            </View>
                            <View style={styles.tipItem}>
                                <View style={[styles.tipDot, { backgroundColor: theme.info }]} />
                                <Text style={[styles.tipText, { color: theme.textMuted }]}>El código es de un solo uso.</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
                            onPress={() => router.replace('/login')}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.sendBtnText, { color: theme.onPrimary }]}>Volver al inicio de sesión</Text>
                            <ArrowRight size={18} color={theme.onPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryBtn, { borderColor: theme.primary + '40' }]}
                            onPress={() => router.push('/reset-password')}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.secondaryBtnText, { color: theme.primary }]}>¿Ya tienes el código? Restablecer aquí</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <View style={styles.footer}>
                <Text style={[styles.footerLabel, { color: theme.onHeroMuted }]}>¿Recordaste tu contraseña?</Text>
                <TouchableOpacity onPress={() => router.replace('/login')} accessibilityRole="button">
                    <Text style={[styles.footerLink, { color: theme.primary }]}> Inicia sesión</Text>
                </TouchableOpacity>
            </View>
        </AuthShell>
    );
}

const styles = StyleSheet.create({
    backBtn: { marginBottom: spacing.lg },
    headerSection: { alignItems: 'center', marginBottom: spacing.xl },
    iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
    title: { fontSize: type.h1.fontSize, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
    subtitle: { fontSize: type.body.fontSize, fontWeight: '500', marginTop: spacing.sm, textAlign: 'center', lineHeight: 20 },
    card: { borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1 },
    cardTitle: { fontSize: type.h2.fontSize, fontWeight: '800', marginBottom: spacing.xs },
    cardSubtitle: { fontSize: type.caption.fontSize, fontWeight: '500', marginBottom: spacing.lg, lineHeight: 20 },
    sendBtn: { minHeight: layout.minTouch + 8, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm },
    sendBtnText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
    tipsContainer: { gap: spacing.md, marginBottom: spacing.xl },
    tipItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    tipDot: { width: 8, height: 8, borderRadius: 4 },
    tipText: { flex: 1, fontSize: type.caption.fontSize, fontWeight: '500', lineHeight: 18 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    footerLabel: { fontSize: type.body.fontSize, fontWeight: '500' },
    footerLink: { fontSize: type.body.fontSize, fontWeight: '800' },
    secondaryBtn: { minHeight: layout.minTouch, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
    secondaryBtnText: { fontSize: type.body.fontSize, fontWeight: '700' },
});
