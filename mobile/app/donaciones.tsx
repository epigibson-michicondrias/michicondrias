import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { createDonation } from '../src/services/ecommerce';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Heart, DollarSign, MessageCircle, ShieldCheck, HeartPulse } from 'lucide-react-native';

const AMOUNTS = [50, 100, 200, 500];

export default function DonacionesScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [amount, setAmount] = useState<string>('100');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDonation = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert("Error", "Por favor ingresa un monto válido");
            return;
        }

        setLoading(true);
        try {
            await createDonation(numAmount, message);
            Alert.alert(
                "¡Gracias!",
                "Tu donación ha sido procesada con éxito. Cada peso cuenta para ayudar a un michi.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error("Donation Error:", error);
            Alert.alert("Error", "No pudimos procesar tu donación. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.hero, { backgroundColor: theme.primary + '15' }]}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>

                    <View style={styles.heroContent}>
                        <View style={[styles.heartIcon, { backgroundColor: theme.primary }]}>
                            <Heart size={40} color="#fff" fill="#fff" />
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>Huellas de Amor</Text>
                        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                            Ayúdanos a seguir rescatando y cuidando a los michis que más lo necesitan.
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>¿Cuánto deseas donar?</Text>

                    <View style={styles.amountsGrid}>
                        {AMOUNTS.map((amt) => (
                            <TouchableOpacity
                                key={amt}
                                style={[
                                    styles.amountBtn,
                                    { backgroundColor: theme.surface },
                                    amount === amt.toString() && { borderColor: theme.primary, borderWidth: 2 }
                                ]}
                                onPress={() => setAmount(amt.toString())}
                            >
                                <Text style={[styles.amountText, { color: amount === amt.toString() ? theme.primary : theme.text }]}>
                                    ${amt}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Monto personalizado (MXN)</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
                            <DollarSign size={20} color={theme.primary} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Mensaje de aliento (Opcional)</Text>
                        <View style={[styles.textAreaContainer, { backgroundColor: theme.surface }]}>
                            <MessageCircle size={20} color={theme.primary} style={{ marginTop: 12 }} />
                            <TextInput
                                style={[styles.textArea, { color: theme.text }]}
                                multiline
                                numberOfLines={4}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Deja un mensaje para el equipo de rescate..."
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>
                    </View>

                    <View style={[styles.trustBox, { backgroundColor: 'rgba(16, 185, 129, 0.05)' }]}>
                        <ShieldCheck size={20} color="#10b981" />
                        <Text style={[styles.trustText, { color: theme.textMuted }]}>
                            Tus donaciones son seguras y van directamente al fondo de rescate Michicondrias.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                        onPress={handleDonation}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <HeartPulse size={24} color="#fff" />
                                <Text style={styles.submitBtnText}>Donar Ahora</Text>
                            </>
                        )}
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
    hero: {
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20,
        marginBottom: 20,
    },
    heroContent: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    heartIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    content: {
        padding: 24,
        gap: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: -12,
    },
    amountsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amountBtn: {
        flex: 1,
        minWidth: '45%',
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    amountText: {
        fontSize: 18,
        fontWeight: '800',
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 60,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
    },
    textAreaContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    textArea: {
        flex: 1,
        height: 120,
        paddingVertical: 16,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    trustBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
    },
    trustText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    submitBtn: {
        height: 64,
        borderRadius: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
        marginBottom: 40,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }
});
