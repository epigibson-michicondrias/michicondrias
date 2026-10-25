/**
 * PetPicker — selector de mascota del usuario (reemplaza los campos "ID de mascota" escritos a mano).
 * Muestra las mascotas propias como tarjetas seleccionables, con estados de carga, vacío y error.
 */
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PawPrint } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { usePets } from '@/src/hooks/mascotas/usePets';
import { families, font, spacing } from '@/constants/design';

interface PetPickerProps {
    value: string;
    onChange: (petId: string) => void;
    label?: string;
}

export default function PetPicker({ value, onChange, label = 'Mascota *' }: PetPickerProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const { pets, isLoading, isEmpty, refetch } = usePets();

    return (
        <View>
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            {isLoading ? (
                <ActivityIndicator color={theme.primary} style={{ alignSelf: 'flex-start', marginVertical: spacing.sm }} />
            ) : isEmpty ? (
                <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                        Aún no tienes mascotas registradas.
                    </Text>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Registrar una mascota"
                        onPress={() => router.push('/mascotas/nuevo' as any)}
                        style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                    >
                        <Text style={[styles.emptyBtnText, { color: theme.onPrimary }, { color: theme.onPrimary }]}>Registrar mascota</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => refetch()} accessibilityRole="button" accessibilityLabel="Actualizar lista">
                        <Text style={[styles.link, { color: theme.primary }]}>Actualizar lista</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.row}>
                    {pets.map((pet) => {
                        const selected = pet.id === value;
                        return (
                            <TouchableOpacity
                                key={pet.id}
                                accessibilityRole="button"
                                accessibilityLabel={`Mascota ${pet.name}`}
                                accessibilityState={{ selected }}
                                onPress={() => onChange(pet.id)}
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor: selected ? theme.primary : theme.surface,
                                        borderColor: selected ? theme.primary : theme.border,
                                    },
                                ]}
                            >
                                <PawPrint size={14} color={selected ? theme.onPrimary : theme.textMuted} />
                                <Text style={[styles.chipText, { color: selected ? theme.onPrimary : theme.text }]} numberOfLines={1}>
                                    {pet.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    label: { fontSize: font.base, fontFamily: families.bold, marginBottom: spacing.sm },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
        paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 999, borderWidth: 1, maxWidth: '100%',
        justifyContent: 'center',
    },
    chipText: { fontSize: font.base, fontFamily: families.bold, flexShrink: 1 },
    empty: { padding: spacing.lg, borderRadius: 14, borderWidth: 1, gap: spacing.md, alignItems: 'flex-start' },
    emptyText: { fontSize: font.base },
    emptyBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    emptyBtnText: { fontFamily: families.bold, fontSize: font.base },
    link: { fontSize: font.base, fontFamily: families.bold },
});
