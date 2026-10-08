import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, KeyRound, ShieldCheck, Mail } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePasswordReset } from '@/src/hooks/auth/usePasswordReset';
import { showAlert } from '@/src/components/AppAlert';

export default function ResetPasswordScreen() {
    const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();

    // Pantalla única de reset: con `?token=` viene del deep link del correo; sin él se usa el código de 6 dígitos
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
    const { theme, colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const isWorking = isResetting || isResettingWithCode;

    const handleReset = () => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanCode = code.trim();
        if (withToken && !token) {
            showAlert({ type: 'warning', title: 'Token requerido', message: 'Pega el token de recuperación que recibiste por correo' });
            return;
        }
        if (!withToken && (!cleanEmail || cleanCode.length !== 6)) {
            showAlert({ type: 'warning', title: 'Datos requeridos', message: 'Escribe tu correo y el código de 6 dígitos que te enviamos' });
            return;
        }
        if (!newPassword || !confirmPassword) {
            showAlert({ type: 'warning', title: 'Campos requeridos', message: 'Ingresa y confirma tu nueva contraseña' });
            return;
        }
        if (newPassword.length < 8) {
            showAlert({ type: 'warning', title: 'Contraseña débil', message: 'La contraseña debe tener al menos 8 caracteres' });
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert({ type: 'error', title: 'No coinciden', message: 'Las contraseñas no coinciden' });
            return;
        }

        const onSuccess = () => setSuccess(true);
        const onError = (error: Error) => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: error.message || 'No se pudo restablecer la contraseña. El código puede haber expirado.',
            });
        };

        if (withToken) {
            resetPassword({ token, newPassword }, { onSuccess, onError });
        } else {
            resetWithCode({ email: cleanEmail, code: cleanCode, newPassword }, { onSuccess, onError });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <LinearGradient
                colors={isDark
                    ? ['#1c2f6b', '#101c3d', '#0b0e17']
                    : ['#d1fae5', '#ecfdf5', '#f0fdf4']
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            <View style={[styles.decoCircle1, { backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)' }]} />
            <View style={[styles.decoCircle2, { backgroundColor: isDark ? 'rgba(6,182,212,0.06)' : 'rgba(6,182,212,0.05)' }]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <BackButton
                        onPress={() => router.back()}
                        style={styles.backBtn}
                    />

                    {!success ? (
                        <>
                            {/* Header */}
                            <View style={styles.headerSection}>
                                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }]}>
                                    <KeyRound size={28} color="#10b981" />
                                </View>
                                <Text style={[styles.title, { color: isDark ? '#fff' : '#064e3b' }]}>Nueva contraseña</Text>
                                <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.55)' : '#059669' }]}>
                                    {withToken
                                        ? 'Escribe tu nueva contraseña para recuperar el acceso'
                                        : 'Escribe el código de 6 dígitos que te enviamos por correo y tu nueva contraseña'}
                                </Text>
                            </View>

                            {/* Card */}
                            <View style={[styles.card, {
                                backgroundColor: isDark ? 'rgba(15,36,56,0.9)' : 'rgba(255,255,255,0.95)',
                                borderColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
                                shadowColor: isDark ? '#10b981' : '#10b981',
                            }]}>
                                {/* Correo + código (si no se viene del deep link del enlace) */}
                                {!withToken && (
                                    <>
                                        <View style={styles.field}>
                                            <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Email</Text>
                                            <View style={[styles.inputRow, {
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
                                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1fae5',
                                            }]}>
                                                <Mail size={18} color="#10b981" />
                                                <TextInput
                                                    style={[styles.input, { color: isDark ? '#fff' : '#0f172a' }]}
                                                    placeholder="tu@email.com"
                                                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'}
                                                    value={email}
                                                    onChangeText={setEmail}
                                                    autoCapitalize="none"
                                                    keyboardType="email-address"
                                                    textContentType="emailAddress"
                                                />
                                            </View>
                                        </View>

                                        <View style={styles.field}>
                                            <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Código de verificación</Text>
                                            <View style={[styles.inputRow, {
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
                                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1fae5',
                                            }]}>
                                                <ShieldCheck size={18} color="#10b981" />
                                                <TextInput
                                                    style={[styles.input, { color: isDark ? '#fff' : '#0f172a' }]}
                                                    placeholder="000000"
                                                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'}
                                                    value={code}
                                                    onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                                                    keyboardType="number-pad"
                                                    maxLength={6}
                                                    textContentType="oneTimeCode"
                                                />
                                            </View>
                                        </View>
                                    </>
                                )}

                                {/* New Password */}
                                <View style={styles.field}>
                                    <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Nueva contraseña</Text>
                                    <View style={[styles.inputRow, {
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1fae5',
                                    }]}>
                                        <Lock size={18} color="#10b981" />
                                        <TextInput
                                            style={[styles.input, { color: isDark ? '#fff' : '#0f172a', flex: 1 }]}
                                            placeholder="Mínimo 8 caracteres"
                                            placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <EyeOff size={18} color={isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8'} />
                                            ) : (
                                                <Eye size={18} color={isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8'} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm Password */}
                                <View style={styles.field}>
                                    <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Confirmar contraseña</Text>
                                    <View style={[styles.inputRow, {
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1fae5',
                                    }]}>
                                        <Lock size={18} color="#10b981" />
                                        <TextInput
                                            style={[styles.input, { color: isDark ? '#fff' : '#0f172a' }]}
                                            placeholder="Repite tu contraseña"
                                            placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                    </View>
                                </View>

                                {/* Submit button */}
                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: '#10b981' }, isWorking && { opacity: 0.7 }]}
                                    onPress={handleReset}
                                    disabled={isWorking}
                                    activeOpacity={0.85}
                                >
                                    {isWorking ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.submitBtnText}>Restablecer contraseña</Text>
                                            <ArrowRight size={18} color="#fff" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Success state */}
                            <View style={styles.headerSection}>
                                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }]}>
                                    <CheckCircle size={32} color="#10b981" />
                                </View>
                                <Text style={[styles.title, { color: isDark ? '#fff' : '#064e3b' }]}>¡Contraseña actualizada!</Text>
                                <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.55)' : '#059669' }]}>
                                    Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                                </Text>
                            </View>

                            <View style={[styles.card, {
                                backgroundColor: isDark ? 'rgba(15,36,56,0.9)' : 'rgba(255,255,255,0.95)',
                                borderColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
                            }]}>
                                <TouchableOpacity
                                    style={[styles.submitBtn, { backgroundColor: '#10b981' }]}
                                    onPress={() => router.replace('/login')}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.submitBtnText}>Ir al Login</Text>
                                    <ArrowRight size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    decoCircle1: {
        position: 'absolute', top: -60, right: -80,
        width: 220, height: 220, borderRadius: 110,
    },
    decoCircle2: {
        position: 'absolute', bottom: 100, left: -60,
        width: 160, height: 160, borderRadius: 80,
    },
    scroll: {
        flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 48,
    },
    backBtn: {
        marginBottom: 20,
    },
    headerSection: { alignItems: 'center', marginBottom: 28 },
    iconCircle: {
        width: 72, height: 72, borderRadius: 36,
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    title: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
    subtitle: { fontSize: 14, fontWeight: '500', marginTop: 8, textAlign: 'center', lineHeight: 20 },
    card: {
        borderRadius: 28, padding: 28, borderWidth: 1,
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12,
        shadowRadius: 24, elevation: 8,
    },
    field: { marginBottom: 18 },
    fieldLabel: {
        fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 16, paddingHorizontal: 16,
        borderWidth: 1.5, height: 54, gap: 12,
    },
    input: { flex: 1, fontSize: 15, fontWeight: '500' },
    submitBtn: {
        height: 56, borderRadius: 16, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
