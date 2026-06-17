import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, View, Text } from 'react-native';
import Colors from '../constants/Colors';
import { useTheme } from '../src/contexts/ThemeContext';
import { Mail, ArrowRight, Send, KeyRound, CheckCircle } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { apiFetch } from '../src/lib/api';
import { showAlert } from '@/src/components/AppAlert';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];
    const isDark = colorScheme === 'dark';

    const handleSend = async () => {
        if (!email) {
            showAlert({ type: 'warning', title: 'Campo requerido', message: 'Ingresa tu correo electrónico' });
            return;
        }
        setLoading(true);
        try {
            await apiFetch('core', '/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
            setSent(true);
        } catch (error: any) {
            showAlert({
                type: 'error',
                title: 'Error de envío',
                message: error.message || 'No se pudo enviar el correo de recuperación. Inténtalo de nuevo.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#081a2e' : '#f0f9ff' }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <LinearGradient
                colors={isDark
                    ? ['#f59e0b', '#081a2e', '#0a1628']
                    : ['#fef3c7', '#fffbeb', '#fffdf5']
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            <View style={[styles.decoCircle1, { backgroundColor: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)' }]} />
            <View style={[styles.decoCircle2, { backgroundColor: isDark ? 'rgba(234,179,8,0.06)' : 'rgba(234,179,8,0.05)' }]} />

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
                    <BackButton
                        onPress={() => router.back()}
                        style={styles.backBtn}
                    />

                    {!sent ? (
                        <>
                            {/* Header */}
                            <View style={styles.headerSection}>
                                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)' }]}>
                                    <KeyRound size={28} color={theme.accent} />
                                </View>
                                <Text style={[styles.title, { color: isDark ? '#fff' : '#78350f' }]}>¿Olvidaste tu contraseña?</Text>
                                <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.55)' : '#92400e' }]}>
                                    No te preocupes, te enviaremos un enlace para restablecerla
                                </Text>
                            </View>

                            {/* Card */}
                            <View style={[styles.card, {
                                backgroundColor: isDark ? 'rgba(15,36,56,0.9)' : 'rgba(255,255,255,0.95)',
                                borderColor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)',
                                shadowColor: isDark ? '#f59e0b' : '#f59e0b',
                            }]}>
                                <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#78350f' }]}>Restablecer contraseña</Text>
                                <Text style={[styles.cardSubtitle, { color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }]}>
                                    Ingresa el email asociado a tu cuenta y te enviaremos las instrucciones
                                </Text>

                                {/* Email */}
                                <View style={styles.field}>
                                    <Text style={[styles.fieldLabel, { color: isDark ? 'rgba(255,255,255,0.7)' : '#475569' }]}>Email</Text>
                                    <View style={[styles.inputRow, {
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fffbeb',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#fef3c7',
                                    }]}>
                                        <Mail size={18} color={theme.accent} />
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

                                {/* Send button */}
                                <TouchableOpacity
                                    style={[styles.sendBtn, { backgroundColor: theme.accent }, loading && { opacity: 0.7 }]}
                                    onPress={handleSend}
                                    disabled={loading}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.sendBtnText}>Enviar enlace</Text>
                                    <Send size={18} color="#fff" />
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
                                <Text style={[styles.title, { color: isDark ? '#fff' : '#064e3b' }]}>¡Revisa tu correo!</Text>
                                <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.55)' : '#059669' }]}>
                                    Si existe una cuenta con <Text style={{ fontWeight: '700', color: isDark ? '#fff' : '#064e3b' }}>{email}</Text>, recibirás un enlace para restablecer tu contraseña.
                                </Text>
                            </View>

                            <View style={[styles.card, {
                                backgroundColor: isDark ? 'rgba(15,36,56,0.9)' : 'rgba(255,255,255,0.95)',
                                borderColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
                            }]}>
                                <View style={styles.tipsContainer}>
                                    <View style={styles.tipItem}>
                                        <View style={[styles.tipDot, { backgroundColor: '#10b981' }]} />
                                        <Text style={[styles.tipText, { color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }]}>
                                            Revisa tu carpeta de spam o correo no deseado
                                        </Text>
                                    </View>
                                    <View style={styles.tipItem}>
                                        <View style={[styles.tipDot, { backgroundColor: '#f59e0b' }]} />
                                        <Text style={[styles.tipText, { color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }]}>
                                            El enlace expira en 24 horas
                                        </Text>
                                    </View>
                                    <View style={styles.tipItem}>
                                        <View style={[styles.tipDot, { backgroundColor: '#0ea5e9' }]} />
                                        <Text style={[styles.tipText, { color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }]}>
                                            Puedes reintentar si no lo recibes
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.sendBtn, { backgroundColor: theme.accent }]}
                                    onPress={() => router.replace('/login')}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.sendBtnText}>Volver al Login</Text>
                                    <ArrowRight size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }]}>
                            ¿Recordaste tu contraseña?
                        </Text>
                        <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
                            <Text style={[styles.footerLink, { color: theme.accent }]}> Inicia sesión</Text>
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
    cardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
    cardSubtitle: { fontSize: 13, fontWeight: '500', marginBottom: 24, lineHeight: 20 },
    field: { marginBottom: 24 },
    fieldLabel: {
        fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4,
    },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 16, paddingHorizontal: 16,
        borderWidth: 1.5, height: 54, gap: 12,
    },
    input: { flex: 1, fontSize: 15, fontWeight: '500' },
    sendBtn: {
        height: 56, borderRadius: 16, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    sendBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    tipsContainer: { gap: 14, marginBottom: 28 },
    tipItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    tipDot: { width: 8, height: 8, borderRadius: 4 },
    tipText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
    footer: {
        flexDirection: 'row', justifyContent: 'center', marginTop: 28,
    },
    footerLabel: { fontSize: 14, fontWeight: '500' },
    footerLink: { fontSize: 14, fontWeight: '800' },
});
