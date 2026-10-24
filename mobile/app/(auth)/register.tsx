/**
 * Register — adopta AuthShell (U3). Formulario con AuthField y validación inline.
 */
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, ActivityIndicator, Linking } from 'react-native';
import { useRegister } from '@/src/hooks/auth/useRegister';
import { useTheme } from '@/src/hooks/useTheme';
import { Mail, Lock, User, UserPlus, ArrowRight, Eye, EyeOff, Check, Square } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import { useRouter } from 'expo-router';
import AuthShell from '@/src/components/AuthShell';
import AuthField from '@/src/components/AuthField';
import { validateEmail, validateMinLength, validateRequired } from '@/src/utils/validators';
import { TERMS_URL, PRIVACY_URL } from '@/src/constants/support';
import { spacing, radius, type, layout, shadow } from '@/constants/design';

type FieldKey = 'fullName' | 'email' | 'password' | 'terms';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

    const { register, isRegistering } = useRegister();
    const router = useRouter();
    const { theme } = useTheme();

    const setError = (key: FieldKey, message: string | null) =>
        setErrors((prev) => ({ ...prev, [key]: message ?? undefined }));

    const handleRegister = () => {
        const cleanName = fullName.trim();
        const cleanEmail = email.trim().toLowerCase();
        const e1 = validateMinLength(cleanName, 2, 'El nombre');
        const e2 = validateEmail(cleanEmail);
        const e3 = validateMinLength(password, 8, 'La contraseña');
        const next: Partial<Record<FieldKey, string>> = {};
        if (!e1.valid) next.fullName = e1.message;
        if (!e2.valid) next.email = e2.message;
        if (!e3.valid) next.password = e3.message;
        if (!acceptedTerms) next.terms = 'Debes aceptar los Términos y la Privacidad para continuar.';
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        register({ email: cleanEmail, password, fullName: cleanName }, {
            onError: (error) => {
                // El backend suele rechazar por correo ya registrado: se pinta en ese campo.
                setError('email', error.message || 'No se pudo crear la cuenta.');
            },
        });
    };

    return (
        <AuthShell>
            <BackButton onPress={() => router.back()} style={styles.backBtn} />

            <View style={styles.headerSection}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
                    <UserPlus size={28} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.onHero }]}>Crear cuenta</Text>
                <Text style={[styles.subtitle, { color: theme.onHeroMuted }]}>
                    Únete a la comunidad de mascotas más grande
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight, ...shadow.card }]}>
                <AuthField
                    label="Nombre completo"
                    icon={User}
                    value={fullName}
                    onChangeText={(t) => { setFullName(t); setError('fullName', null); }}
                    error={errors.fullName}
                    placeholder="Juan Pérez"
                    textContentType="name"
                    autoComplete="name"
                    returnKeyType="next"
                />

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
                    label="Contraseña"
                    icon={Lock}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError('password', null); }}
                    error={errors.password}
                    hint="Mínimo 8 caracteres"
                    placeholder="Mínimo 8 caracteres"
                    secureTextEntry={!showPassword}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    returnKeyType="go"
                    onSubmitEditing={handleRegister}
                    rightElement={
                        <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                            {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
                        </TouchableOpacity>
                    }
                />

                <TouchableOpacity
                    style={styles.termsRow}
                    onPress={() => { setAcceptedTerms((v) => !v); setError('terms', null); }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: acceptedTerms }}
                    accessibilityLabel="Aceptar Términos y Privacidad"
                    activeOpacity={0.7}
                >
                    <View
                        style={[
                            styles.checkBox,
                            {
                                backgroundColor: acceptedTerms ? theme.primary : 'transparent',
                                borderColor: errors.terms ? theme.error : acceptedTerms ? theme.primary : theme.border,
                            },
                        ]}
                    >
                        {acceptedTerms && <Check size={14} color={theme.onPrimary} strokeWidth={3} />}
                    </View>
                    <Text style={[styles.termsText, { color: theme.textMuted }]}>
                        Acepto nuestros{' '}
                        <Text
                            accessibilityRole={TERMS_URL ? 'link' : undefined}
                            onPress={TERMS_URL ? () => Linking.openURL(TERMS_URL).catch(() => {}) : undefined}
                            style={{ color: TERMS_URL ? theme.primary : theme.text, fontWeight: '700', textDecorationLine: TERMS_URL ? 'underline' : 'none' }}
                        >Términos</Text>
                        {' '}y{' '}
                        <Text
                            accessibilityRole={PRIVACY_URL ? 'link' : undefined}
                            onPress={PRIVACY_URL ? () => Linking.openURL(PRIVACY_URL).catch(() => {}) : undefined}
                            style={{ color: PRIVACY_URL ? theme.primary : theme.text, fontWeight: '700', textDecorationLine: PRIVACY_URL ? 'underline' : 'none' }}
                        >Privacidad</Text>
                    </Text>
                </TouchableOpacity>
                {errors.terms ? (
                    <Text style={[styles.termsError, { color: theme.error }]} accessibilityLiveRegion="polite">{errors.terms}</Text>
                ) : null}

                <TouchableOpacity
                    style={[styles.registerBtn, { backgroundColor: theme.primary }, isRegistering && { opacity: 0.7 }]}
                    onPress={handleRegister}
                    disabled={isRegistering}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Crear cuenta"
                >
                    {isRegistering ? (
                        <ActivityIndicator color={theme.onPrimary} size="small" />
                    ) : (
                        <>
                            <Text style={[styles.registerBtnText, { color: theme.onPrimary }]}>Crear cuenta</Text>
                            <ArrowRight size={20} color={theme.onPrimary} strokeWidth={2.5} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <Text style={[styles.proLine, { color: theme.onHeroMuted }]}>
                ¿Ofreces servicios para mascotas? Podrás activar tu{' '}
                <Text style={{ color: theme.primary, fontWeight: '700' }}>cuenta profesional</Text> desde Perfil.
            </Text>

            <View style={styles.footer}>
                <Text style={[styles.footerLabel, { color: theme.onHeroMuted }]}>¿Ya tienes cuenta?</Text>
                <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7} accessibilityRole="button">
                    <Text style={[styles.footerLink, { color: theme.primary }]}> Inicia sesión</Text>
                </TouchableOpacity>
            </View>
        </AuthShell>
    );
}

const styles = StyleSheet.create({
    backBtn: { marginBottom: spacing.lg },
    headerSection: { alignItems: 'center', marginBottom: spacing.xl },
    iconCircle: {
        width: 64, height: 64, borderRadius: 32,
        justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
    },
    title: { fontSize: type.h1.fontSize, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { fontSize: type.body.fontSize, fontWeight: '500', marginTop: spacing.xs, textAlign: 'center' },
    card: { borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1 },
    termsRow: {
        flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
        marginBottom: spacing.xs, marginTop: -spacing.xs, minHeight: layout.minTouch,
        paddingVertical: spacing.sm,
    },
    checkBox: {
        width: 22, height: 22, borderRadius: radius.sm, borderWidth: 2,
        justifyContent: 'center', alignItems: 'center', marginTop: 1,
    },
    termsText: { flex: 1, fontSize: type.caption.fontSize, fontWeight: '500', lineHeight: 18 },
    termsError: { fontSize: type.caption.fontSize, marginLeft: spacing.xs, marginBottom: spacing.md },
    registerBtn: {
        minHeight: layout.minTouch + 8, borderRadius: radius.lg, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md,
    },
    registerBtnText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
    proLine: { fontSize: type.caption.fontSize, fontWeight: '500', textAlign: 'center', marginTop: spacing.lg, marginHorizontal: spacing.md, lineHeight: 18 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    footerLabel: { fontSize: type.body.fontSize, fontWeight: '500' },
    footerLink: { fontSize: type.body.fontSize, fontWeight: '800' },
});
