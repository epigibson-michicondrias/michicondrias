import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MessageCircle, Mail, Phone, ExternalLink, ChevronRight, ShieldCheck } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import SectionHeader from '@/src/components/SectionHeader';
import Card from '@/src/components/Card';
import SearchBar from '@/src/components/SearchBar';
import { showAlert } from '@/src/components/AppAlert';
import { useTheme } from '@/src/hooks/useTheme';
import EmptyState from '@/src/components/EmptyState';
import { families, layout, radius, spacing, tint, type } from '@/constants/design';
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_WHATSAPP, TERMS_URL, PRIVACY_URL } from '@/src/constants/support';

// FAQ verídicas: describen lo que la app tiene hoy (el botón de adopción es «¡Quiero Adoptar!» y
// los pagos con tarjeta; nada de transferencias ni tiendas de conveniencia).
const FAQS = [
    { question: '¿Cómo reportar una mascota perdida?', answer: 'Ve a la sección "Mascotas Perdidas", presiona el botón "+" y completa el formulario con fotos y ubicación.' },
    { question: '¿Qué es el Michi-Tracker Pro?', answer: 'Es nuestro sistema premium de rastreo GPS para mascotas: lo activas desde la ficha de tu mascota y puedes gestionar o cancelar la suscripción cuando quieras.' },
    { question: '¿Cómo puedo adoptar?', answer: 'Explora las mascotas en adopción, elige una y presiona «¡Quiero Adoptar!» en su ficha para iniciar el proceso.' },
    { question: 'Métodos de pago aceptados', answer: 'Aceptamos tarjetas de crédito y débito a través de Stripe.' },
];

export default function HelpScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState<number | null>(null);

    const normalized = query.trim().toLowerCase();
    const faqs = normalized
        ? FAQS.filter(f => f.question.toLowerCase().includes(normalized) || f.answer.toLowerCase().includes(normalized))
        : FAQS;

    // Si el sistema no puede abrir el enlace, se avisa: un contacto silencioso no sirve
    const open = (url: string) => {
        Linking.openURL(url).catch(() => {
            showAlert({
                type: 'info',
                title: 'No se pudo abrir el enlace',
                message: 'Inténtalo de nuevo o escríbenos directo a ' + SUPPORT_EMAIL + '.',
            });
        });
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Centro de Ayuda" onBack={() => router.back()} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <SearchBar
                    value={query}
                    onChangeText={(v) => { setQuery(v); setExpanded(null); }}
                    placeholder="Busca una solución…"
                />

                <View style={styles.section}>
                    <SectionHeader title="Preguntas frecuentes" overline />
                    <Card flush>
                        {faqs.length === 0 && (
                            <EmptyState
                                icon={<Search size={layout.icon.xl} color={theme.textMuted} />}
                                title="Sin resultados"
                                subtitle="No encontramos preguntas con esa búsqueda."
                                actionLabel="Limpiar búsqueda"
                                onAction={() => { setQuery(''); setExpanded(null); }}
                            />
                        )}
                        {faqs.map((faq, index) => {
                            const isOpen = expanded === index;
                            return (
                                <View
                                    key={faq.question}
                                    style={index < faqs.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }}
                                >
                                    <TouchableOpacity style={styles.faqItem} onPress={() => setExpanded(isOpen ? null : index)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
                                        <Text style={[type.subtitle, styles.faqQuestion, { color: theme.text }]}>{faq.question}</Text>
                                        <ChevronRight size={layout.icon.md} color={theme.textMuted} style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }} />
                                    </TouchableOpacity>
                                    {isOpen && (
                                        <Text style={[type.body, styles.faqAnswer, { color: theme.textMuted }]}>{faq.answer}</Text>
                                    )}
                                </View>
                            );
                        })}
                    </Card>
                </View>

                <View style={styles.section}>
                    <SectionHeader title="Contacto directo" overline />
                    <View style={styles.contactGrid}>
                        {!!SUPPORT_WHATSAPP && (
                            <ContactBtn icon={MessageCircle} label="WhatsApp" color={theme.success}
                                onPress={() => open(`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, '')}`)} />
                        )}
                        <ContactBtn icon={Mail} label="Correo" color={theme.info}
                            onPress={() => open(`mailto:${SUPPORT_EMAIL}?subject=Ayuda%20Michicondrias`)} />
                        {!!SUPPORT_PHONE && (
                            <ContactBtn icon={Phone} label="Teléfono" color={theme.secondary}
                                onPress={() => open(`tel:${SUPPORT_PHONE}`)} />
                        )}
                    </View>
                </View>

                {!!TERMS_URL && (
                    <TouchableOpacity accessibilityRole="button" style={[styles.footerCard, { borderColor: theme.border }, { backgroundColor: theme.surface }]} onPress={() => open(TERMS_URL)}>
                        <ExternalLink size={layout.icon.md} color={theme.primary} />
                        <Text style={[type.subtitle, styles.footerCardText, { color: theme.text }]}>Términos y Condiciones</Text>
                        <ChevronRight size={layout.icon.md} color={theme.textMuted} />
                    </TouchableOpacity>
                )}
                {!!PRIVACY_URL && (
                    <TouchableOpacity accessibilityRole="button" style={[styles.footerCard, { borderColor: theme.border }, { backgroundColor: theme.surface }]} onPress={() => open(PRIVACY_URL)}>
                        <ShieldCheck size={layout.icon.md} color={theme.primary} />
                        <Text style={[type.subtitle, styles.footerCardText, { color: theme.text }]}>Aviso de Privacidad</Text>
                        <ChevronRight size={layout.icon.md} color={theme.textMuted} />
                    </TouchableOpacity>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

function ContactBtn({ icon: Icon, label, color, onPress }: { icon: typeof MessageCircle; label: string; color: string; onPress: () => void }) {
    const { theme } = useTheme();
    return (
        <TouchableOpacity style={[styles.contactBtn, { borderColor: theme.border }, { backgroundColor: theme.surface }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Contactar por ${label}`}>
            <View style={[styles.iconBox, { backgroundColor: color + tint.soft }]}>
                <Icon size={layout.icon.lg} color={color} />
            </View>
            <Text style={[type.caption, styles.contactLabel, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    scroll: {
        padding: spacing.xl,
        gap: spacing.huge,
    },
    section: {
        gap: spacing.md,
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.xl,
        minHeight: layout.minTouch,
    },
    faqQuestion: {
        flex: 1,
        fontFamily: families.bold,
    },
    faqAnswer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    contactGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    contactBtn: {
        flex: 1,
        padding: spacing.lg,
        borderRadius: radius.xl,
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: layout.minTouch + spacing.xl,
    },
    iconBox: {
        width: layout.iconBox.lg + spacing.md,
        height: layout.iconBox.lg + spacing.md,
        borderRadius: radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontFamily: families.bold,
    },
    footerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xl,
        borderRadius: radius.xl,
        gap: spacing.lg,
        borderWidth: 1,
        minHeight: layout.minTouch + spacing.lg,
    },
    footerCardText: {
        flex: 1,
        fontFamily: families.bold,
    }
});
