import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { login } from '../src/lib/auth';
import { useAuth } from '../src/contexts/AuthContext';
import Colors from '../constants/Colors';
import { useTheme } from '../src/contexts/ThemeContext';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { showAlert } from '@/src/components/AppAlert';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert({ type: 'warning', title: 'Campos vacíos', message: 'Por favor ingresa tu email y contraseña' });
            return;
        }
        setLoading(true);
        try {
            const data = await login(email, password);
            await signIn(data.access_token);
        } catch (error: any) {
            showAlert({ type: 'error', title: 'Error al iniciar sesión', message: error.message || 'Credenciales incorrectas' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <LinearGradient
                colors={isDark
                    ? ['#0ea5e9', '#081a2e', '#0a1628']
                    : ['#bae6fd', '#e0f2fe', '#f0f9ff']
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* Decorative circles */}
            <View style={[styles.decoCircle1, { backgroundColor: isDark ? 'rgba(14,165,233,0.08)' : 'rgba(14,165,233,0.06)' }]} />
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
                    {/* Logo */}
                    <View style={styles.logoSection}>
                        <View style={[styles.logoRing, { borderColor: isDark ? 'rgba(14,165,233,0.3)' : 'rgba(14,165,233,0.2)' }]}>
                            <Image
                                source={require('../assets/images/logo.jpg')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[styles.appName, { color: isDark ? '#fff' : '#0c4a6e' }]}>Michicondrias</Text>
                        <View style={styles.taglineRow}>
                            <Sparkles size={14} color={theme.primary} />
                            <Text style={[styles.tagline, { color: isDark ? 'rgba(255,255,255,0.6)' : '#0369a1' }]}>Cuidado integral para tus mascotas</Text>
                        </View>
                    </View>

                    {/* Card */}
                    <View style={[styles.card, {
                        backgroundColor: isDark ? 'rgba(15,36,56,0.9)' : 'rgba(255,255,255,0.95)',
                        borderColor: isDark ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.12)',
                        shadowColor: isDark ? '#0ea5e9' : '#0ea5e9',
                    }]}>
                        <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#0c4a6e' }]}>Bienvenido</Text>
                        <Text style={[styles.cardSubtitle, { color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }]}>Inicia sesión en tu cuenta</Text>

                        {/* Email */}
                        <View style={styles.field}>
                            <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Email</Text>
                            <View style={[styles.inputRow, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
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
                                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                            }]}>
                                <Lock size={18} color={theme.primary} />
                                <TextInput
                                    style={[styles.input, { color: isDark ? '#fff' : '#0f172a', flex: 1 }]}
                                    placeholder="Tu contraseña"
                                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8'}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    textContentType="password"
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

                        {/* Forgot password */}
                        <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotRow}>
                            <Text style={[styles.forgotText, { color: theme.primary }]}>¿Olvidaste tu contraseña?</Text>
                        </TouchableOpacity>

                        {/* Login button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.loginBtnText}>Entrar</Text>
                                    <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }]}>
                            ¿No tienes cuenta?
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
                            <Text style={[styles.footerLink, { color: theme.primary }]}> Regístrate aquí</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    decoCircle1: {
        position: 'absolute',
        top: -80,
        right: -60,
        width: 240,
        height: 240,
        borderRadius: 120,
    },
    decoCircle2: {
        position: 'absolute',
        bottom: 120,
        left: -100,
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingTop: 80,
        paddingBottom: 48,
        justifyContent: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoRing: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        padding: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 46,
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    tagline: {
        fontSize: 14,
        fontWeight: '500',
    },
    card: {
        borderRadius: 28,
        padding: 28,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 28,
    },
    field: {
        marginBottom: 18,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        height: 54,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    forgotRow: {
        alignItems: 'flex-end',
        marginBottom: 24,
        marginTop: -4,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: '700',
    },
    loginBtn: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '800',
    },
});
