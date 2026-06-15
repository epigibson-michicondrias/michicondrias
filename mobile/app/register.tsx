import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { register } from '../src/lib/auth';
import Colors from '../constants/Colors';
import { useTheme } from '../src/contexts/ThemeContext';
import { Mail, Lock, User, UserPlus, ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { showAlert } from '@/src/components/AppAlert';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            showAlert({ type: 'warning', title: 'Campos incompletos', message: 'Por favor llena todos los campos' });
            return;
        }
        setLoading(true);
        try {
            await register(email, password, fullName);
            showAlert({
                type: 'success',
                title: '¡Cuenta creada!',
                message: 'Ahora puedes iniciar sesión con tu nueva cuenta',
                buttonText: 'Ir a Login',
                onButtonPress: () => router.replace('/login'),
            });
        } catch (error: any) {
            showAlert({ type: 'error', title: 'Error de registro', message: error.message || 'No se pudo crear la cuenta' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <LinearGradient
                colors={isDark
                    ? ['#059669', '#081a2e', '#0a1628']
                    : ['#d1fae5', '#ecfdf5', '#f0fdf4']
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            <View style={[styles.decoCircle1, { backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)' }]} />
            <View style={[styles.decoCircle2, { backgroundColor: isDark ? 'rgba(52,211,153,0.06)' : 'rgba(52,211,153,0.05)' }]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* Back button */}
                    <TouchableOpacity
                        style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={22} color={isDark ? '#fff' : '#334155'} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.headerSection}>
                        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)' }]}>
                            <UserPlus size={28} color={theme.primary} />
                        </View>
                        <Text style={[styles.title, { color: isDark ? '#fff' : '#064e3b' }]}>Crear Cuenta</Text>
                        <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.55)' : '#059669' }]}>
                            Únete a la comunidad de mascotas más grande
                        </Text>
                    </View>

                    {/* Card */}
                    <View style={[styles.card, {
                        backgroundColor: isDark ? 'rgba(15,36,56,0.9)' : 'rgba(255,255,255,0.95)',
                        borderColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
                        shadowColor: isDark ? '#10b981' : '#10b981',
                    }]}>
                        {/* Name */}
                        <View style={styles.field}>
                            <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Nombre completo</Text>
                            <View style={[styles.inputRow, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1fae5',
                            }]}>
                                <User size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: isDark ? '#fff' : '#0f172a' }]}
                                    placeholder="Juan Pérez"
                                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    textContentType="name"
                                />
                            </View>
                        </View>

                        {/* Email */}
                        <View style={styles.field}>
                            <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Email</Text>
                            <View style={[styles.inputRow, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1fae5',
                            }]}>
                                <Mail size={18} color={theme.primary} />
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

                        {/* Password */}
                        <View style={styles.field}>
                            <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Contraseña</Text>
                            <View style={[styles.inputRow, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0fdf4',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1fae5',
                            }]}>
                                <Lock size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: isDark ? '#fff' : '#0f172a', flex: 1 }]}
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    textContentType="newPassword"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                                    {showPassword ? (
                                        <EyeOff size={18} color={isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8'} />
                                    ) : (
                                        <Eye size={18} color={isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8'} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Terms */}
                        <View style={styles.termsRow}>
                            <View style={[styles.checkCircle, { backgroundColor: theme.primary + '20' }]}>
                                <Check size={12} color={theme.primary} strokeWidth={3} />
                            </View>
                            <Text style={[styles.termsText, { color: isDark ? 'rgba(255,255,255,0.45)' : '#94a3b8' }]}>
                                Al registrarte aceptas nuestros{' '}
                                <Text style={{ color: theme.primary, fontWeight: '700' }}>Términos</Text>
                                {' '}y{' '}
                                <Text style={{ color: theme.primary, fontWeight: '700' }}>Privacidad</Text>
                            </Text>
                        </View>

                        {/* Register button */}
                        <TouchableOpacity
                            style={[styles.registerBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.registerBtnText}>Crear Cuenta</Text>
                                    <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }]}>
                            ¿Ya tienes cuenta?
                        </Text>
                        <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
                            <Text style={[styles.footerLink, { color: theme.primary }]}> Inicia sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    decoCircle1: {
        position: 'absolute', top: -100, left: -80,
        width: 260, height: 260, borderRadius: 130,
    },
    decoCircle2: {
        position: 'absolute', bottom: 60, right: -60,
        width: 180, height: 180, borderRadius: 90,
    },
    scroll: {
        flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 48,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
    },
    headerSection: { alignItems: 'center', marginBottom: 28 },
    iconCircle: {
        width: 64, height: 64, borderRadius: 32,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, fontWeight: '500', marginTop: 6, textAlign: 'center' },
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
    termsRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, marginTop: -2,
    },
    checkCircle: {
        width: 20, height: 20, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    termsText: { flex: 1, fontSize: 12, fontWeight: '500', lineHeight: 18 },
    registerBtn: {
        height: 56, borderRadius: 16, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    registerBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    footer: {
        flexDirection: 'row', justifyContent: 'center', marginTop: 28,
    },
    footerLabel: { fontSize: 14, fontWeight: '500' },
    footerLink: { fontSize: 14, fontWeight: '800' },
});
