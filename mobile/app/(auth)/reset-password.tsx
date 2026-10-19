/**
 * Reset Password — adopta AuthShell (U3). Pantalla única: con `?token=` (deep link)
 * o con correo + código de 6 dígitos.
 */
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, KeyRound, ShieldCheck, Mail } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePasswordReset } from '@/src/hooks/auth/usePasswordReset';
import { showAlert } from '@/src/components/AppAlert';
import AuthShell from '@/src/components/AuthShell';
import { spacing, radius, type, layout, shadow } from '@/constants/design';

export default function ResetPasswordScreen() {
    const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
    const withToken = !!tokenParam;
    const token = tokenParam || '';
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    const { resetPassword, isResetting, resetWithCode, isResettingWithCode } = usePasswordReset();
    const router = useRouter();
    const { theme } = useTheme();
    const isWorking = isResetting || isResettingWithCode;

    const handleReset = () => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanCode = code.trim();
        if (withToken && !token) {
            showAlert({ type: 'warning', title: 'Token requerido', message: 'Pega el token de recuperación.' });
            return;
        }
        if (!withToken && (!cleanEmail || cleanCode.length !== 6)) {
            showAlert({ type: 'warning', title: 'Datos requeridos', message: 'Escribe tu correo y el código de 6 dígitos.' });
            return;
        }
        if (!newPassword || !confirmPassword) {
            showAlert({ type: 'warning', title: 'Campos requeridos', message: 'Ingresa y confirma tu nueva contraseña.' });
            return;
        }
        if (newPassword.length < 8) {
            showAlert({ type: 'warning', title: 'Contraseña débil', message: 'Debe tener al menos 8 caracteres.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert({ type: 'error', title: 'No coinciden', message: 'Las contraseñas no coinciden.' });
            return;
        }
        const onSuccess = () => setSuccess(true);
        const onError = (error: Error) => {
            showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo restablecer. El código puede haber expirado.' });
        };
        if (withToken) {
            resetPassword({ token, newPassword }, { onSuccess, onError });
        } else {
            resetWithCode({ email: cleanEmail, code: cleanCode, newPassword }, { onSuccess, onError });
        }
    };

    return (
        <AuthShell>
            <BackButton onPress={() => router.back()} style={styles.backBtn} />

            {!success ? (
                <>
                    <View style={styles.headerSection}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.success + '15' }]}>
                            <KeyRound size={28} color={theme.success} />
                        </View>
                        <Text style={[styles.title, { color: theme.onHero }]}>Nueva contraseña</Text>
                        <Text style={[styles.subtitle, { color: theme.onHeroMuted }]}>
                            {withToken
                                ? 'Escribe tu nueva contraseña para recuperar el acceso'
                                : 'Escribe el código de 6 dígitos y tu nueva contraseña'}
                        </Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight, ...shadow.card }]}>
                        {!withToken && (
                            <>
                                <View style={styles.field}>
                                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Email</Text>
                                    <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        <Mail size={18} color={theme.success} />
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
                                        />
                                    </View>
                                </View>

                                <View style={styles.field}>
                                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Código de verificación</Text>
                                    <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                        <ShieldCheck size={18} color={theme.success} />
                                        <TextInput
                                            style={[styles.input, { color: theme.text }]}
                                            placeholder="000000"
                                            placeholderTextColor={theme.textMuted}
                                            value={code}
                                            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            textContentType="oneTimeCode"
                                            accessibilityLabel="Código de verificación"
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        <View style={styles.field}>
                            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Nueva contraseña</Text>
                            <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Lock size={18} color={theme.success} />
                                <TextInput
                                    style={[styles.input, { color: theme.text, flex: 1 }]}
                                    placeholder="Mínimo 8 caracteres"
                                    placeholderTextColor={theme.textMuted}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showPassword}
                                    textContentType="newPassword"
                                    autoComplete="new-password"
                                />
                                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                                    {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Confirmar contraseña</Text>
                            <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Lock size={18} color={theme.success} />
                                <TextInput
                                    style={[styles.input, { color: theme.text }]}
                                    placeholder="Repite tu contraseña"
                                    placeholderTextColor={theme.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                    textContentType="newPassword"
                                    autoComplete="new-password"
                                    returnKeyType="go"
                                    onSubmitEditing={handleReset}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: theme.success }, isWorking && { opacity: 0.7 }]}
                            onPress={handleReset}
                            disabled={isWorking}
                            accessibilityRole="button"
                            accessibilityLabel="Restablecer contraseña"
                        >
                            {isWorking ? (
                                <ActivityIndicator color={theme.onPrimary} size="small" />
                            ) : (
                                <>
                                    <Text style={[styles.submitBtnText, { color: theme.onPrimary }]}>Restablecer contraseña</Text>
                                    <ArrowRight size={18} color={theme.onPrimary} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.headerSection}>
                        <View style={[styles.iconCircle, { backgroundColor: theme.success + '15' }]}>
                            <CheckCircle size={32} color={theme.success} />
                        </View>
                        <Text style={[styles.title, { color: theme.onHero }]}>¡Contraseña actualizada!</Text>
                        <Text style={[styles.subtitle, { color: theme.onHeroMuted }]}>
                            Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.
                        </Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: theme.success }]}
                            onPress={() => router.replace('/login')}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.submitBtnText, { color: theme.onPrimary }]}>Ir al Login</Text>
                            <ArrowRight size={18} color={theme.onPrimary} />
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
    field: { marginBottom: spacing.lg },
    fieldLabel: { fontSize: type.label.fontSize, fontWeight: '700', marginBottom: spacing.sm, marginLeft: spacing.xs },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.lg, paddingHorizontal: spacing.lg, borderWidth: 1, minHeight: layout.minTouch + 4, gap: spacing.sm },
    input: { flex: 1, fontSize: type.body.fontSize, fontWeight: '500' },
    submitBtn: { minHeight: layout.minTouch + 8, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
    submitBtnText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
});
