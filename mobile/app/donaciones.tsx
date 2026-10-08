import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, AppState } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { createDonationCheckout, getDonation } from '../src/services/ecommerce';
import { openStripeUrl } from '@/src/utils/payments';
import { useTheme } from '@/src/hooks/useTheme';
import { Heart, DollarSign, MessageCircle, ShieldCheck, HeartPulse } from 'lucide-react-native';
import BackButton from '../src/components/BackButton';

const AMOUNTS = [50, 100, 200, 500];

export default function DonacionesScreen() {
    const router = useRouter();
    const { theme, isDark } = useTheme();

    const [amount, setAmount] = useState<string>('100');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    // Estado del cobro: pending = esperando confirmación de Stripe, paid, cancelled (el usuario no pagó) o expired/failed
    const [donationId, setDonationId] = useState<string | null>(null);
    const [payState, setPayState] = useState<'idle' | 'checking' | 'pending' | 'paid' | 'cancelled' | 'expired'>('idle');
    const params = useLocalSearchParams<{ result?: string; donationId?: string }>();
    const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Consulta el estado real (el backend verifica con Stripe) y reintenta unos segundos mientras siga pendiente. */
    const verifyDonation = useCallback(async (id: string, attempt = 0) => {
        try {
            const d = await getDonation(`${id}?t=${Date.now()}`);
            if (d.status === 'paid' || d.status === 'completed') { setPayState('paid'); return; }
            if (d.status === 'expired' || d.status === 'failed') { setPayState('expired'); return; }
            setPayState('pending');
            if (attempt < 6) pollTimer.current = setTimeout(() => verifyDonation(id, attempt + 1), 2500);
        } catch {
            setPayState('pending');
        }
    }, []);

    useEffect(() => () => { if (pollTimer.current) clearTimeout(pollTimer.current); }, []);

    // Retorno desde Stripe por deep link: michicondrias://donaciones?result=success|cancel&donationId=...
    useEffect(() => {
        const id = typeof params.donationId === 'string' ? params.donationId : null;
        if (!id) return;
        setDonationId(id);
        if (params.result === 'cancel') { setPayState('cancelled'); return; }
        setPayState('checking');
        verifyDonation(id);
    }, [params.donationId, params.result, verifyDonation]);

    // Si el usuario vuelve manualmente desde el navegador, se reconsulta el estado
    useEffect(() => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active' && donationId && (payState === 'pending' || payState === 'checking')) verifyDonation(donationId);
        });
        return () => sub.remove();
    }, [donationId, payState, verifyDonation]);

    const handleDonation = async () => {
        const numAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numAmount) || numAmount < 10 || numAmount > 100000) {
            showAlert({ type: 'error', title: 'Monto inválido', message: 'Ingresa un monto entre $10 y $100,000 MXN.' });
            return;
        }

        setLoading(true);
        try {
            const session = await createDonationCheckout(numAmount, message);
            setDonationId(session.donation_id);
            setPayState('pending');
            await openStripeUrl(session.url);
        } catch (error: any) {
            const detail = String(error?.message || '');
            const unavailable = /no est[aá]n disponibles/i.test(detail);
            showAlert({
                type: 'error',
                title: unavailable ? 'Donaciones no disponibles' : 'No se pudo iniciar el pago',
                message: unavailable
                    ? 'Las donaciones con tarjeta no están disponibles por el momento. Inténtalo más tarde.'
                    : (detail || 'No pudimos iniciar tu donación. Inténtalo de nuevo.'),
            });
            setPayState('idle');
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
                    <View style={styles.heroHeader}>
                        <BackButton onPress={() => router.back()} style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />
                    </View>

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
                    {payState !== 'idle' && (
                        <View
                            style={[styles.statusBox, {
                                backgroundColor: payState === 'paid' ? theme.successLight : payState === 'cancelled' || payState === 'expired' ? theme.errorLight : theme.surface,
                                borderColor: theme.borderLight,
                            }]}
                            accessibilityLiveRegion="polite"
                        >
                            {payState === 'checking' || payState === 'pending' ? <ActivityIndicator color={theme.primary} /> : null}
                            <Text style={[styles.statusTitle, { color: theme.text }]}>
                                {payState === 'paid' ? '¡Gracias por tu donación!'
                                    : payState === 'cancelled' ? 'Pago no completado'
                                    : payState === 'expired' ? 'El pago expiró'
                                    : 'Confirmando tu pago…'}
                            </Text>
                            <Text style={[styles.statusText, { color: theme.textMuted }]}>
                                {payState === 'paid' ? 'Recibimos tu pago. Cada peso ayuda a un michi.'
                                    : payState === 'cancelled' ? 'No se hizo ningún cargo. Puedes intentarlo de nuevo cuando quieras.'
                                    : payState === 'expired' ? 'No se hizo ningún cargo. Inicia una nueva donación si deseas continuar.'
                                    : 'Completa el pago en Stripe. Cuando regreses a la app verificaremos tu donación.'}
                            </Text>
                            {payState === 'paid' && (
                                <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cerrar">
                                    <Text style={[styles.statusLink, { color: theme.primary }]}>Cerrar</Text>
                                </TouchableOpacity>
                            )}
                            {payState === 'pending' && donationId && (
                                <TouchableOpacity onPress={() => { setPayState('checking'); verifyDonation(donationId); }} accessibilityRole="button" accessibilityLabel="Ya pagué, verificar">
                                    <Text style={[styles.statusLink, { color: theme.primary }]}>Ya pagué, verificar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>¿Cuánto deseas donar?</Text>

                    <View style={styles.amountsGrid}>
                        {AMOUNTS.map((amt) => (
                            <TouchableOpacity
                                key={amt}
                                style={[
                                    styles.amountBtn,
                                    { backgroundColor: theme.surface, borderColor: theme.borderLight },
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
                        <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <DollarSign size={20} color={theme.primary} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                                placeholder="0.00"
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.textMuted }]}>Mensaje de aliento (Opcional)</Text>
                        <View style={[styles.textAreaContainer, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
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
                            El pago se hace de forma segura con Stripe. Tu donación va al fondo de rescate Michicondrias y se confirma cuando el cobro se completa.
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
                                <Text style={styles.submitBtnText}>Donar con tarjeta</Text>
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
    heroHeader: {
        paddingHorizontal: 24,
        marginBottom: 8,
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
    statusBox: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 8,
        alignItems: 'center',
    },
    statusTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
    statusText: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
    statusLink: { fontSize: 14, fontWeight: '800', marginTop: 4 },
    submitBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }
});
