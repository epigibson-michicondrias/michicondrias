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
                <Text style={{ color: theme.textMuted, fontSize: 13 }}>
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
                                    <PawPrint size={14} color={sel ? '#fff' : theme.textMuted} />
                                    <Text style={{ color: sel ? '#fff' : theme.text, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>
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
    label: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16 },
    search: { height: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, marginBottom: 8 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, maxWidth: '100%' },
});
