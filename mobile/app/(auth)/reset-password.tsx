/**
 * Reset Password — adopta AuthShell (U3). Pantalla única: con `?token=` (deep link)
 * o con correo + código de 6 dígitos. Validación inline por campo.
 */
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, KeyRound, ShieldCheck, Mail } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePasswordReset } from '@/src/hooks/auth/usePasswordReset';
import AuthShell from '@/src/components/AuthShell';
import AuthField from '@/src/components/AuthField';
import { validateEmail, validateMinLength } from '@/src/utils/validators';
import { spacing, radius, type, layout, shadow } from '@/constants/design';

type FieldKey = 'email' | 'code' | 'newPassword' | 'confirmPassword';

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
    const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

    const { resetPassword, isResetting, resetWithCode, isResettingWithCode } = usePasswordReset();
    const router = useRouter();
    const { theme } = useTheme();
    const isWorking = isResetting || isResettingWithCode;

    const setError = (key: FieldKey, message: string | null) =>
        setErrors((prev) => ({ ...prev, [key]: message ?? undefined }));

    const handleReset = () => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanCode = code.trim();
        const next: Partial<Record<FieldKey, string>> = {};

        if (!withToken) {
            const e1 = validateEmail(cleanEmail);
            if (!e1.valid) next.email = e1.message;
            if (cleanCode.length !== 6) next.code = 'El código tiene 6 dígitos.';
        }
        const e3 = validateMinLength(newPassword, 8, 'La contraseña');
        if (!e3.valid) next.newPassword = e3.message;
        if (confirmPassword !== newPassword) next.confirmPassword = 'Las contraseñas no coinciden.';
        else if (!confirmPassword) next.confirmPassword = 'Confirma tu contraseña.';

        setErrors(next);
        if (Object.keys(next).length > 0) return;

        const onSuccess = () => setSuccess(true);
        const onError = (error: Error) => {
            // El fallo típico es un código vencido/incorrecto: se pinta en ese campo.
            setError(withToken ? 'newPassword' : 'code', error.message || 'No se pudo restablecer. El código puede haber expirado.');
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
                        <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
                            <KeyRound size={28} color={theme.primary} />
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
                                <AuthField
                                    label="Correo electrónico"
                                    icon={Mail}
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setError('email', null); }}
                                    error={errors.email}
                                    placeholder="tu@email.com"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    textContentType="emailAddress"
                                    autoComplete="email"
                                    returnKeyType="next"
                                />

                                <AuthField
                                    label="Código de verificación"
                                    icon={ShieldCheck}
                                    value={code}
                                    onChangeText={(t) => { setCode(t.replace(/[^0-9]/g, '').slice(0, 6)); setError('code', null); }}
                                    error={errors.code}
                                    placeholder="000000"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    textContentType="oneTimeCode"
                                    accessibilityLabel="Código de verificación"
                                />
                            </>
                        )}

                        <AuthField
                            label="Nueva contraseña"
                            icon={Lock}
                            value={newPassword}
                            onChangeText={(t) => { setNewPassword(t); setError('newPassword', null); }}
                            error={errors.newPassword}
                            hint="Mínimo 8 caracteres"
                            placeholder="Mínimo 8 caracteres"
                            secureTextEntry={!showPassword}
                            textContentType="newPassword"
                            autoComplete="new-password"
                            returnKeyType="next"
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                                    {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
                                </TouchableOpacity>
                            }
                        />

                        <AuthField
                            label="Confirmar contraseña"
                            icon={Lock}
                            value={confirmPassword}
                            onChangeText={(t) => { setConfirmPassword(t); setError('confirmPassword', null); }}
                            error={errors.confirmPassword}
                            placeholder="Repite tu contraseña"
                            secureTextEntry={!showPassword}
                            textContentType="newPassword"
                            autoComplete="new-password"
                            returnKeyType="go"
                            onSubmitEditing={handleReset}
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: theme.primary }, isWorking && { opacity: 0.7 }]}
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
                            style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                            onPress={() => router.replace('/login')}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.submitBtnText, { color: theme.onPrimary }]}>Ir al inicio de sesión</Text>
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
    submitBtn: { minHeight: layout.minTouch + 8, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm },
    submitBtnText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
});
