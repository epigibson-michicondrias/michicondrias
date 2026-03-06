import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { login } from '../src/lib/auth';
import { useAuth } from '../src/contexts/AuthContext';
import Colors from '../constants/Colors';
import { useTheme } from '../src/contexts/ThemeContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Por favor llena todos los campos");
            return;
        }

        setLoading(true);
        try {
            const data = await login(email, password);
            await signIn(data.access_token);
        } catch (error: any) {
            alert(error.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoEmoji}>🐾</Text>
                    <Text style={styles.appName}>Michicondrias</Text>
                    <Text style={styles.tagline}>Todo para tu mejor amigo</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.welcomeText}>¡Hola de nuevo! ✨</Text>
                    <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo Electrónico</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="tu@email.com"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginBtn, loading && styles.disabledBtn]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginBtnText}>
                            {loading ? "Entrando..." : "Iniciar Sesión 🚀"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotBtn}>
                        <Text style={styles.forgotBtnText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>¿No tienes cuenta?</Text>
                    <TouchableOpacity>
                        <Text style={styles.registerText}> Regístrate aquí</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoEmoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 4,
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#cbd5e1',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    loginBtn: {
        backgroundColor: '#7c3aed',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    loginBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    forgotBtn: {
        marginTop: 16,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    forgotBtnText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
        backgroundColor: 'transparent',
    },
    footerText: {
        color: '#94a3b8',
    },
    registerText: {
        color: '#a78bfa',
        fontWeight: '700',
    },
});
