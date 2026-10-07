import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MessageCircle, Mail, Phone, ExternalLink, ChevronRight } from 'lucide-react-native';
import BackButton from '../src/components/BackButton';
import { useTheme } from '@/src/hooks/useTheme';
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_WHATSAPP, TERMS_URL } from '@/src/constants/support';

const FAQS = [
    { question: '¿Cómo reportar una mascota perdida?', answer: 'Ve a la sección "Mascotas Perdidas", presiona el botón "+" y completa el formulario con fotos y ubicación.' },
    { question: '¿Qué es el Michi-Tracker Pro?', answer: 'Es nuestro sistema premium de rastreo en tiempo real para mascotas mediante dispositivos GPS compatibles.' },
    { question: '¿Cómo puedo adoptar?', answer: 'Explora el módulo de "Adopciones", elige un michi y presiona "Solicitar Adopción" para iniciar el proceso.' },
    { question: 'Métodos de pago aceptados', answer: 'Aceptamos todas las tarjetas de crédito/débito, transferencias y pagos en tiendas de conveniencia.' },
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

    const open = (url: string) => Linking.openURL(url).catch(() => {});

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <BackButton onPress={() => router.back()} />
                <Text style={[styles.title, { color: theme.text }]}>Centro de Ayuda</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={[styles.searchBar, { borderColor: theme.border }, { backgroundColor: theme.surface }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput
                        placeholder="Busca una solución..."
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={query}
                        onChangeText={(v) => { setQuery(v); setExpanded(null); }}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>PREGUNTAS FRECUENTES</Text>
                    <View style={[styles.card, { borderColor: theme.border }, { backgroundColor: theme.surface }]}>
                        {faqs.length === 0 && (
                            <Text style={{ color: theme.textMuted, padding: 16 }}>No encontramos preguntas con esa búsqueda.</Text>
                        )}
                        {faqs.map((faq, index) => {
                            const isOpen = expanded === index;
                            return (
                                <View
                                    key={faq.question}
                                    style={index < faqs.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }}
                                >
                                    <TouchableOpacity style={styles.faqItem} onPress={() => setExpanded(isOpen ? null : index)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
                                        <Text style={[styles.faqQuestion, { color: theme.text }]}>{faq.question}</Text>
                                        <ChevronRight size={18} color={theme.textMuted} style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }} />
                                    </TouchableOpacity>
                                    {isOpen && (
                                        <Text style={{ color: theme.textMuted, paddingHorizontal: 16, paddingBottom: 16, lineHeight: 20 }}>{faq.answer}</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>CONTACTO DIRECTO</Text>
                    <View style={styles.contactGrid}>
                        {!!SUPPORT_WHATSAPP && (
                            <ContactBtn icon={MessageCircle} label="WhatsApp" color={theme.success} theme={theme}
                                onPress={() => open(`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, '')}`)} />
                        )}
                        <ContactBtn icon={Mail} label="Email" color={theme.info} theme={theme}
                            onPress={() => open(`mailto:${SUPPORT_EMAIL}?subject=Ayuda%20Michicondrias`)} />
                        {!!SUPPORT_PHONE && (
                            <ContactBtn icon={Phone} label="Teléfono" color={theme.secondary} theme={theme}
                                onPress={() => open(`tel:${SUPPORT_PHONE}`)} />
                        )}
                    </View>
                </View>

                {!!TERMS_URL && (
                    <TouchableOpacity accessibilityRole="button" style={[styles.footerCard, { borderColor: theme.border }, { backgroundColor: theme.surface }]} onPress={() => open(TERMS_URL)}>
                        <ExternalLink size={20} color={theme.primary} />
                        <Text style={[styles.footerCardText, { color: theme.text }]}>Términos y Condiciones</Text>
                        <ChevronRight size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

function ContactBtn({ icon: Icon, label, color, theme, onPress }: any) {
    return (
        <TouchableOpacity style={[styles.contactBtn, { borderColor: theme.border }, { backgroundColor: theme.surface }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`Contactar por ${label}`}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Icon size={24} color={color} />
            </View>
            <Text style={[styles.contactLabel, { color: theme.text }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    scroll: {
        padding: 20,
        gap: 32,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        paddingHorizontal: 16,
        borderRadius: 18,
        gap: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        marginLeft: 4,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    },
    contactGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    contactBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
    },
    iconBox: {
        width: 54,
        height: 54,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    footerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        gap: 16,
        borderWidth: 1,
    },
    footerCardText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    }
});
