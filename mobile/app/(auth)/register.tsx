/**
 * Register — adopta AuthShell (U3). Formulario con tokens del design system.
 */
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Text, ActivityIndicator, Linking } from 'react-native';
import { useRegister } from '@/src/hooks/auth/useRegister';
import { useTheme } from '@/src/hooks/useTheme';
import { Mail, Lock, User, UserPlus, ArrowRight, Eye, EyeOff, Check } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import AuthShell from '@/src/components/AuthShell';
import { TERMS_URL, PRIVACY_URL } from '@/src/constants/support';
import { spacing, radius, type, layout, shadow } from '@/constants/design';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { register, isRegistering } = useRegister();
    const router = useRouter();
    const { theme } = useTheme();

    const handleRegister = () => {
        const cleanName = fullName.trim();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail || !password || !cleanName) {
            showAlert({ type: 'warning', title: 'Campos incompletos', message: 'Por favor llena todos los campos.' });
            return;
        }
        if (cleanName.length < 2) {
            showAlert({ type: 'warning', title: 'Nombre muy corto', message: 'Escribe tu nombre completo.' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
            showAlert({ type: 'warning', title: 'Correo inválido', message: 'Revisa que tu correo esté bien escrito.' });
            return;
        }
        if (password.length < 8) {
            showAlert({ type: 'warning', title: 'Contraseña muy corta', message: 'Tu contraseña debe tener al menos 8 caracteres.' });
            return;
        }
        register({ email: cleanEmail, password, fullName: cleanName }, {
            onError: (error) => {
                showAlert({ type: 'error', title: 'Error de registro', message: error.message || 'No se pudo crear la cuenta.' });
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
                <Text style={[styles.title, { color: theme.onHero }]}>Crear Cuenta</Text>
                <Text style={[styles.subtitle, { color: theme.onHeroMuted }]}>
                    Únete a la comunidad de mascotas más grande
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.borderLight, ...shadow.card }]}>
                <View style={styles.field}>
                    <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Nombre completo</Text>
                    <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <User size={18} color={theme.primary} />
                        <TextInput
                            style={[styles.input, { color: theme.text }]}
                            placeholder="Juan Pérez"
                            placeholderTextColor={theme.textMuted}
                            value={fullName}
                            onChangeText={setFullName}
                            textContentType="name"
                            autoComplete="name"
                            returnKeyType="next"
                        />
                    </View>
                </View>

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
                            placeholder="Mínimo 8 caracteres"
                            placeholderTextColor={theme.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            textContentType="newPassword"
                            autoComplete="new-password"
                            returnKeyType="go"
                            onSubmitEditing={handleRegister}
                        />
                        <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                            {showPassword ? <EyeOff size={18} color={theme.textMuted} /> : <Eye size={18} color={theme.textMuted} />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.termsRow}>
                    <View style={[styles.checkCircle, { backgroundColor: theme.primary + '20' }]}>
                        <Check size={12} color={theme.primary} strokeWidth={3} />
                    </View>
                    <Text style={[styles.termsText, { color: theme.textMuted }]}>
                        Al registrarte aceptas nuestros{' '}
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
                </View>

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
                            <Text style={[styles.registerBtnText, { color: theme.onPrimary }]}>Crear Cuenta</Text>
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
    field: { marginBottom: spacing.lg },
    fieldLabel: { fontSize: type.label.fontSize, fontWeight: '700', marginBottom: spacing.sm, marginLeft: spacing.xs },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: radius.lg, paddingHorizontal: spacing.lg,
        borderWidth: 1, minHeight: layout.minTouch + 4, gap: spacing.sm,
    },
    input: { flex: 1, fontSize: type.body.fontSize, fontWeight: '500' },
    termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl, marginTop: -spacing.xs },
    checkCircle: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    termsText: { flex: 1, fontSize: type.caption.fontSize, fontWeight: '500', lineHeight: 18 },
    registerBtn: {
        minHeight: layout.minTouch + 8, borderRadius: radius.lg, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    },
    registerBtnText: { fontSize: type.subtitle.fontSize, fontWeight: '800' },
    proLine: { fontSize: type.caption.fontSize, fontWeight: '500', textAlign: 'center', marginTop: spacing.lg, marginHorizontal: spacing.md, lineHeight: 18 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    footerLabel: { fontSize: type.body.fontSize, fontWeight: '500' },
    footerLink: { fontSize: type.body.fontSize, fontWeight: '800' },
});
