/**
 * GettingStartedCard — guía de "primeros pasos" para quien entra con la cuenta vacía.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PawPrint, Stethoscope, Search, Heart, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';

const STEPS = [
    { key: 'pet', icon: PawPrint, title: 'Registra a tu mascota', desc: 'Crea su perfil y su carnet digital de salud.', route: '/mascotas/nuevo' },
    { key: 'vet', icon: Stethoscope, title: 'Agenda con un veterinario', desc: 'Encuentra clínicas cerca de ti y reserva una cita.', route: '/directorio' },
    { key: 'lost', icon: Search, title: 'Mascotas perdidas', desc: 'Reporta o ayuda a encontrar a un michi extraviado.', route: '/perdidas' },
    { key: 'adopt', icon: Heart, title: 'Adopta', desc: 'Conoce michis que buscan un hogar.', route: '/adopciones' },
] as const;

export default function GettingStartedCard() {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]}>👋 ¡Bienvenido a Michicondrias!</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Empieza por aquí:</Text>
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                    <TouchableOpacity
                        key={step.key}
                        accessibilityRole="button"
                        accessibilityLabel={`${step.title}. ${step.desc}`}
                        style={[styles.row, i < STEPS.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
                        onPress={() => router.push(step.route as any)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconBox, { backgroundColor: theme.primary + '18' }]}>
                            <Icon size={20} color={theme.primary} />
                        </View>
                        <View style={styles.rowText}>
                            <Text style={[styles.rowTitle, { color: theme.text }]}>{step.title}</Text>
                            <Text style={[styles.rowDesc, { color: theme.textMuted }]}>{step.desc}</Text>
                        </View>
                        <ChevronRight size={18} color={theme.textMuted} />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { marginHorizontal: 20, marginTop: 16, borderRadius: 20, borderWidth: 1, padding: 16 },
    title: { fontSize: 17, fontWeight: '800' },
    subtitle: { fontSize: 13, marginTop: 4, marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    rowText: { flex: 1 },
    rowTitle: { fontSize: 14, fontWeight: '700' },
    rowDesc: { fontSize: 12, marginTop: 2 },
});
