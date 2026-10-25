/**
 * PatientPicker — selector de paciente de la clínica (reemplaza los campos "ID del paciente").
 * Lista las mascotas que ya tienen citas en la clínica del veterinario/hospital.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { PawPrint } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { getMyClinics } from '@/src/services/directorio';
import { getClinicPatients } from '@/src/services/patients';
import { families, font, spacing } from '@/constants/design';

interface Props {
    value: string;
    onChange: (petId: string) => void;
    label?: string;
}

export default function PatientPicker({ value, onChange, label = 'Paciente *' }: Props) {
    const { theme } = useTheme();
    const [q, setQ] = useState('');
    const { data: clinics = [] } = useQuery({ queryKey: ['my-clinics'], queryFn: getMyClinics });
    const clinicId = clinics[0]?.id;
    const { data: patients = [], isLoading } = useQuery({
        queryKey: ['clinic-patients', clinicId],
        queryFn: () => getClinicPatients(clinicId!),
        enabled: !!clinicId,
    });
    const list = patients.filter((p) => `${p.name} ${p.owner}`.toLowerCase().includes(q.toLowerCase()));

    return (
        <View>
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
            {isLoading ? (
                <ActivityIndicator color={theme.primary} style={{ alignSelf: 'flex-start' }} />
            ) : patients.length === 0 ? (
                <Text style={{ color: theme.textMuted, fontSize: font.base }}>
                    Aún no tienes pacientes: aparecen cuando una mascota agenda una cita en tu clínica.
                </Text>
            ) : (
                <>
                    {patients.length > 6 && (
                        <TextInput
                            style={[styles.search, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                            placeholder="Buscar paciente o dueño"
                            placeholderTextColor={theme.textMuted}
                            value={q}
                            onChangeText={setQ}
                        />
                    )}
                    <View style={styles.row}>
                        {list.map((p) => {
                            const sel = p.id === value;
                            return (
                                <TouchableOpacity
                                    key={p.id}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: sel }}
                                    accessibilityLabel={`Paciente ${p.name}, dueño ${p.owner}`}
                                    onPress={() => onChange(p.id)}
                                    style={[styles.chip, { backgroundColor: sel ? theme.primary : theme.surface, borderColor: sel ? theme.primary : theme.border }]}
                                >
                                    <PawPrint size={14} color={sel ? theme.onPrimary : theme.textMuted} />
                                    <Text style={{ color: sel ? theme.onPrimary : theme.text, fontFamily: families.bold, fontSize: font.base }} numberOfLines={1}>
                                        {p.name} · {p.owner}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    label: { fontSize: font.md, fontFamily: families.bold, marginBottom: spacing.sm, marginTop: spacing.lg },
    search: { height: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 999, borderWidth: 1, maxWidth: '100%', justifyContent: 'center' },
});
