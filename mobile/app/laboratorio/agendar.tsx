import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Check, FlaskConical } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useLabOrders } from '@/src/hooks/laboratorio/useLabOrders';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import EmptyState from '@/src/components/EmptyState';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import DatePicker from '@/src/components/DatePicker';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import PetPicker from '@/src/features/salud/PetPicker';
import { toISODate } from '@/src/features/salud/format';
import { showAlert } from '@/src/components/AppAlert';
import { font, spacing, layout } from '@/constants/design';

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
                    <EmptyState
                        icon={<FlaskConical size={layout.icon.xl} color={theme.textMuted} />}
                        title="No encontramos ese estudio"
                        subtitle="Puede que ya no esté disponible. Elige otro en el catálogo."
                        actionLabel="Ver estudios"
                        onAction={() => router.replace('/laboratorio')}
                    />
                ) : (
                    <>
                        <View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <FlaskConical size={22} color={theme.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.title, { color: theme.text }]}>{test.name}</Text>
                                {!!test.description && <Text style={{ color: theme.textMuted, fontSize: font.base }}>{test.description}</Text>}
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
                                            <Text style={{ color: sel ? theme.onPrimary : theme.text, fontWeight: '700' }}>{t}</Text>
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
                            <Check size={20} color={theme.onPrimary} />
                            <Text style={[styles.submitText, { color: theme.onPrimary }]}>{saving ? 'Enviando...' : 'Solicitar cita'}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { padding: spacing.xxl, gap: spacing.xl, paddingBottom: 60 },
    summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: 16, borderWidth: 1 },
    title: { fontSize: font.xl, fontWeight: '800' },
    label: { fontSize: font.base, fontWeight: '700', marginBottom: spacing.sm },
    slots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    slot: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 12, borderWidth: 1 },
    input: { minHeight: 90, borderRadius: 14, borderWidth: 1, padding: spacing.lg, fontSize: font.base },
    submit: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg, borderRadius: 14 },
    submitText: { fontSize: font.xl, fontWeight: '800' },
});
