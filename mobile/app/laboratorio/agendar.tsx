import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, FlaskConical } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useLabOrders } from '@/src/hooks/laboratorio';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import DatePicker from '@/src/components/DatePicker';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import PetPicker from '@/src/features/salud/PetPicker';
import { toISODate } from '@/src/features/salud/format';
import { showAlert } from '@/src/components/AppAlert';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '16:00', '17:00'];

export default function AgendarLaboratorioScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { test_id } = useLocalSearchParams<{ test_id?: string }>();
    const { tests, isLoadingTests, createAppointment } = useLabOrders();
    const test = tests.find((t) => t.id === test_id);

    const [petId, setPetId] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('09:00');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    if (isLoadingTests) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Agendar estudio" />
                <LoadingOverlay message="Cargando estudio..." />
            </ScreenContainer>
        );
    }

    const submit = async () => {
        if (!test) return;
        if (!petId) {
            showAlert({ type: 'error', title: 'Falta la mascota', message: 'Selecciona a tu mascota.' });
            return;
        }
        if (toISODate(date) < toISODate(new Date())) {
            showAlert({ type: 'error', title: 'Fecha inválida', message: 'La fecha no puede estar en el pasado.' });
            return;
        }
        setSaving(true);
        try {
            await createAppointment({
                pet_id: petId,
                lab_id: test.lab_id,
                test_id: test.id,
                scheduled_date: toISODate(date),
                scheduled_time: `${time}:00`,
                notes: notes.trim() || undefined,
            });
            showAlert({
                type: 'success',
                title: 'Cita solicitada',
                message: 'El laboratorio confirmará tu cita y te avisaremos por notificación.',
                onButtonPress: () => router.replace('/laboratorio' as any),
            });
        } catch {
            // el error ya se muestra desde el hook
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Agendar estudio" subtitle={test?.name || 'Laboratorio'} />
            <KeyboardScreen contentContainerStyle={styles.content}>
                {!test ? (
                    <Text style={{ color: theme.textMuted }}>No encontramos ese estudio. Vuelve al catálogo y elige otro.</Text>
                ) : (
                    <>
                        <View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <FlaskConical size={22} color={theme.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.title, { color: theme.text }]}>{test.name}</Text>
                                {!!test.description && <Text style={{ color: theme.textMuted, fontSize: 13 }}>{test.description}</Text>}
                            </View>
                            <Text style={[styles.title, { color: theme.primary }]}>${Number(test.price).toFixed(2)}</Text>
                        </View>

                        <PetPicker value={petId} onChange={setPetId} />

                        <DatePicker label="Fecha *" value={date} minimumDate={new Date()} onChange={setDate} />

                        <View>
                            <Text style={[styles.label, { color: theme.text }]}>Hora *</Text>
                            <View style={styles.slots}>
                                {TIME_SLOTS.map((t) => {
                                    const sel = t === time;
                                    return (
                                        <TouchableOpacity
                                            key={t}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: sel }}
                                            onPress={() => setTime(t)}
                                            style={[styles.slot, { backgroundColor: sel ? theme.primary : theme.surface, borderColor: sel ? theme.primary : theme.border }]}
                                        >
                                            <Text style={{ color: sel ? '#fff' : theme.text, fontWeight: '700' }}>{t}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View>
                            <Text style={[styles.label, { color: theme.text }]}>Notas (opcional)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                                placeholder="Ayuno, medicamentos actuales, indicaciones del veterinario..."
                                placeholderTextColor={theme.textMuted}
                                multiline
                                textAlignVertical="top"
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>

                        <TouchableOpacity
                            accessibilityRole="button"
                            disabled={saving}
                            onPress={submit}
                            style={[styles.submit, { backgroundColor: theme.primary }, saving && { opacity: 0.7 }]}
                        >
                            <Check size={20} color="#fff" />
                            <Text style={styles.submitText}>{saving ? 'Enviando...' : 'Solicitar cita'}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { padding: 24, gap: 20, paddingBottom: 60 },
    summary: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
    title: { fontSize: 16, fontWeight: '800' },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    slot: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
    input: { minHeight: 90, borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 14 },
    submit: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
