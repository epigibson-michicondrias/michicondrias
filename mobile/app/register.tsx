import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, View, Text, Image } from 'react-native';
import { register } from '../src/lib/auth';
import { useAuth } from '../src/contexts/AuthContext';
import Colors from '../constants/Colors';
import { useTheme } from '../src/contexts/ThemeContext';
import { Mail, Lock, User, UserPlus, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            Alert.alert("Campos incompletos", "Por favor llena todos los campos requeridos.");
            return;
        }

        setLoading(true);
        try {
            await register(email, password, fullName);
            Alert.alert(
                "¡Cuenta creada!",
                "Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.",
                [{ text: "OK", onPress: () => router.replace('/login') }]
            );
        } catch (error: any) {
            Alert.alert("Error de registro", error.message || "No se pudo crear la cuenta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={['#10b981', theme.background]} // Emerald for register
                style={[StyleSheet.absoluteFillObject, { opacity: 0.6 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: 'transparent' }}
            >
                <ScrollView 
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    contentContainerStyle={[styles.scrollContent, { backgroundColor: 'transparent' }]}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity 
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <View style={styles.logoIconBox}>
                            <Image 
                                source={require('../assets/images/logo.jpg')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.appName}>Únete a Michicondrias</Text>
                        <Text style={styles.tagline}>Sé parte de nuestra comunidad michi</Text>
                    </View>

                    <LinearGradient
                        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                        style={styles.glassCard}
                    >
                        <Text style={styles.welcomeText}>Crea tu cuenta ✨</Text>
                        <Text style={styles.subtitle}>Es rápido y sencillo</Text>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nombre Completo</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <User size={18} color="rgba(255,255,255,0.6)" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tu Nombre"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={fullName}
                                        onChangeText={setFullName}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Correo Electrónico</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <Mail size={18} color="rgba(255,255,255,0.6)" />
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
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Contraseña</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                                    <Lock size={18} color="rgba(255,255,255,0.6)" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="••••••••"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.registerBtn, loading && styles.disabledBtn]}
                                onPress={handleRegister}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.2)', 'transparent']}
                                    style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
                                />
                                {loading ? (
                                    <Text style={styles.registerBtnText}>Creando cuenta...</Text>
                                ) : (
                                    <>
                                        <Text style={styles.registerBtnText}>Registrarme</Text>
                                        <UserPlus size={20} color="#fff" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
                        <TouchableOpacity 
                            style={styles.loginLink}
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={styles.loginLinkText}>Inicia sesión aquí</Text>
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
        backgroundColor: 'transparent',
    },
    keyboardView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 60,
        backgroundColor: 'transparent',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
        backgroundColor: 'transparent',
    },
    logoIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
        textAlign: 'center',
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
        fontWeight: '600',
        textAlign: 'center',
    },
    glassCard: {
        padding: 28,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 28,
        fontWeight: '500',
    },
    form: {
        gap: 18,
        backgroundColor: 'transparent',
    },
    inputGroup: {
        gap: 8,
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 11,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 4,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        height: 56,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#fff',
        fontWeight: '600',
    },
    registerBtn: {
        backgroundColor: '#10b981',
        borderRadius: 24,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 10,
        overflow: 'hidden',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    registerBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '900',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
        gap: 8,
        paddingBottom: 40,
        backgroundColor: 'transparent',
    },
    footerText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontWeight: '600',
    },
    loginLink: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    loginLinkText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
    },
});
