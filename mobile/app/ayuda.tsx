import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, HelpCircle, MessageCircle, Mail, Phone, ExternalLink, ChevronRight } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const FAQS = [
    { question: '¿Cómo reportar una mascota perdida?', answer: 'Ve a la sección "Mascotas Perdidas", presiona el botón "+" y completa el formulario con fotos y ubicación.' },
    { question: '¿Qué es el Michi-Tracker Pro?', answer: 'Es nuestro sistema premium de rastreo en tiempo real para mascotas mediante dispositivos GPS compatibles.' },
    { question: '¿Cómo puedo adoptar?', answer: 'Explora el módulo de "Adopciones", elige un michi y presiona "Solicitar Adopción" para iniciar el proceso.' },
    { question: 'Métodos de pago aceptados', answer: 'Aceptamos todas las tarjetas de crédito/débito, transferencias y pagos en tiendas de conveniencia.' },
];

export default function HelpScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Centro de Ayuda</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput
                        placeholder="Busca una solución..."
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>PREGUNTAS FRECUENTES</Text>
                    <View style={[styles.card, { backgroundColor: theme.surface }]}>
                        {FAQS.map((faq, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.faqItem, index < FAQS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                            >
                                <Text style={[styles.faqQuestion, { color: theme.text }]}>{faq.question}</Text>
                                <ChevronRight size={18} color={theme.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>CONTACTO DIRECTO</Text>
                    <View style={styles.contactGrid}>
                        <ContactBtn icon={MessageCircle} label="Chat en vivo" color="#22c55e" theme={theme} />
                        <ContactBtn icon={Mail} label="Email" color="#3b82f6" theme={theme} />
                        <ContactBtn icon={Phone} label="Teléfono" color="#8b5cf6" theme={theme} />
                    </View>
                </View>

                <TouchableOpacity style={[styles.footerCard, { backgroundColor: theme.surface }]}>
                    <ExternalLink size={20} color={theme.primary} />
                    <Text style={[styles.footerCardText, { color: theme.text }]}>Términos y Condiciones</Text>
                    <ChevronRight size={18} color={theme.textMuted} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function ContactBtn({ icon: Icon, label, color, theme }: any) {
    return (
        <TouchableOpacity style={[styles.contactBtn, { backgroundColor: theme.surface }]}>
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
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '900',
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        borderColor: 'rgba(255,255,255,0.05)',
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
        borderColor: 'rgba(255,255,255,0.05)',
    },
    footerCardText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
    }
});
