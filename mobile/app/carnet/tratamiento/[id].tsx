/**
 * Ficha de tratamiento (medicamento recetado) en la app. Documento premium: hero con progreso,
 * datos del medicamento, línea de tiempo de cada toma y acciones (avisos, marcar, inicio).
 */
import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft, Pill, Clock, Timer, CalendarDays, Check, CheckCircle2,
    Bell, BellOff, TrendingUp, Printer,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import { Skeleton } from '@/src/components/Skeleton';
import FormSwitch from '@/src/components/forms/FormSwitch';
import EmptyState from '@/src/components/EmptyState';
import { useTreatmentDetail } from '@/src/hooks/carnet/useTreatmentDetail';
import { spacing, radius, type, layout } from '@/constants/design';

const STATUS_LABEL: Record<string, string> = {
    'en-curso': 'En curso',
    terminado: 'Terminado',
    'por-iniciar': 'Por iniciar',
};

const fmtDateTime = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })} · ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
};

const fmtDate = (iso?: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function TreatmentDetailScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { treatment, pet, isLoading, error, checkReminder, isChecking, toggleReminders, setStartDate, isSettingStart } = useTreatmentDetail();
    const [editingStart, setEditingStart] = useState(false);
    const [startInput, setStartInput] = useState('');

    if (isLoading) {
        return (
            <ScreenContainer noPadding>
                <ScreenHeader title="Tratamiento" showBack />
                <View style={styles.body}>
                    <Skeleton height={120} borderRadius={radius.xl} />
                    <Skeleton height={200} borderRadius={radius.lg} />
                    <Skeleton height={300} borderRadius={radius.lg} />
                </View>
            </ScreenContainer>
        );
    }

    if (error || !treatment) {
        return (
            <ScreenContainer noPadding>
                <ScreenHeader title="Tratamiento" showBack />
                <EmptyState
                    icon={<Pill size={28} color={theme.accent} />}
                    title="No pudimos cargar el tratamiento"
                    subtitle="Puede que ya no exista. Revisa tu conexión e inténtalo de nuevo."
                    actionLabel="Volver"
                    onAction={() => router.back()}
                />
            </ScreenContainer>
        );
    }

    const t = treatment;
    const total = t.doses.length;
    const taken = t.doses.filter((d: any) => d.sent).length;
    const nextDose = t.doses.find((d: any) => !d.sent);
    const progress = total ? taken / total : 0;
    const startDate = t.start_date || t.record_date;

    return (
        <ScreenContainer noPadding>
            <ScreenHeader title="Tratamiento" showBack />
            <ScrollView contentContainerStyle={styles.body}>
                {/* Hero */}
                <View style={[styles.hero, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <View style={styles.heroTop}>
                        <View style={[styles.heroIcon, { backgroundColor: theme.primaryLight }]}>
                            <Pill size={28} color={theme.primary} />
                        </View>
                        <View style={styles.flex}>
                            <Text style={[type.h2, { color: theme.text }]}>{t.medication_name}</Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                {t.dosage} · cada {t.frequency_hours} h · {t.duration_days} días
                            </Text>
                        </View>
                    </View>
                    {/* Barra de progreso */}
                    <View style={[styles.progressTrack, { backgroundColor: theme.overlayHover }]}>
                        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.accent }]} />
                    </View>
                    <View style={styles.heroStats}>
                        <Text style={[type.caption, { color: theme.textMuted }]}>{taken} de {total} tomas</Text>
                        <View style={[styles.badge, { backgroundColor: t.status === 'terminado' ? theme.successLight : t.status === 'en-curso' ? theme.accentLight : theme.overlayHover }]}>
                            <Text style={[type.label, { color: t.status === 'terminado' ? theme.success : t.status === 'en-curso' ? theme.accent : theme.textMuted }]}>
                                {STATUS_LABEL[t.status] || t.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Datos */}
                <Card>
                    <Text style={[type.subtitle, styles.cardTitle, { color: theme.text }]}>Datos del tratamiento</Text>
                    <View style={styles.grid}>
                        {[
                            { icon: <Clock size={14} color={theme.textMuted} />, label: 'Dosis', value: t.dosage },
                            { icon: <Timer size={14} color={theme.textMuted} />, label: 'Frecuencia', value: `Cada ${t.frequency_hours} h` },
                            { icon: <CalendarDays size={14} color={theme.textMuted} />, label: 'Duración', value: `${t.duration_days} días` },
                            { icon: <CalendarDays size={14} color={theme.textMuted} />, label: 'Inicio', value: fmtDate(startDate) },
                        ].map((c) => (
                            <View key={c.label} style={styles.cell}>
                                <View style={styles.cellLabel}>{c.icon}<Text style={[type.label, { color: theme.textMuted }]}>{c.label}</Text></View>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>{c.value}</Text>
                            </View>
                        ))}
                    </View>
                    {t.instructions ? (
                        <View style={[styles.note, { borderTopColor: theme.border }]}>
                            <Text style={[type.label, { color: theme.textMuted }]}>Indicaciones</Text>
                            <Text style={[type.body, { color: theme.text }]}>{t.instructions}</Text>
                        </View>
                    ) : null}
                    {t.diagnosis ? (
                        <View style={[styles.note, { borderTopColor: theme.border }]}>
                            <Text style={[type.label, { color: theme.textMuted }]}>Diagnóstico</Text>
                            <Text style={[type.body, { color: theme.text }]}>{t.diagnosis}</Text>
                        </View>
                    ) : null}
                </Card>

                {/* Próxima toma */}
                {nextDose && (
                    <Card>
                        <Text style={[type.label, { color: theme.primary }]}>PRÓXIMA TOMA</Text>
                        <Text style={[type.h2, { color: theme.text, fontSize: 18 }]}>{fmtDateTime(nextDose.remind_at)}</Text>
                        {nextDose.isDue ? (
                            <Button
                                label={isChecking ? 'Marcando…' : 'Marcar como tomado'}
                                onPress={() => checkReminder(nextDose.id)}
                                disabled={isChecking}
                                loading={isChecking}
                                fullWidth
                            />
                        ) : (
                            <Text style={[type.caption, { color: theme.textMuted }]}>Podrás marcarla cuando toque</Text>
                        )}
                    </Card>
                )}

                {/* Línea de tiempo */}
                <Card>
                    <Text style={[type.subtitle, styles.cardTitle, { color: theme.text }]}>Cada toma</Text>
                    {t.doses.map((d: any, i: number) => (
                        <View key={d.id} style={styles.tlRow}>
                            <View style={styles.tlRail}>
                                <View style={[styles.tlDot, { backgroundColor: d.sent ? theme.successLight : d.isDue ? theme.accentLight : theme.overlayHover }]}>
                                    {d.sent ? <Check size={11} color={theme.success} /> : <Text style={[type.label, { color: theme.textMuted }]}>{i + 1}</Text>}
                                </View>
                                {i < t.doses.length - 1 && <View style={[styles.tlLine, { backgroundColor: theme.border }]} />}
                            </View>
                            <View style={styles.tlBody}>
                                <Text style={[type.body, { color: theme.text }]}>{fmtDateTime(d.remind_at)}</Text>
                                <Text style={[type.caption, { color: d.sent ? theme.success : d.isOverdue ? theme.error : d.isDue ? theme.accent : theme.textMuted }]}>
                                    {d.sent ? `Tomado${d.taken_at ? ` ${fmtDateTime(d.taken_at)}` : ''}` : d.isOverdue ? 'Atrasada' : d.isDue ? 'Ya toca' : 'Pendiente'}
                                </Text>
                            </View>
                            {!d.sent && d.isDue && (
                                <Button
                                    label={isChecking ? '…' : 'Marcar'}
                                    size="sm"
                                    variant="secondary"
                                    fullWidth={false}
                                    disabled={isChecking}
                                    onPress={() => checkReminder(d.id)}
                                />
                            )}
                        </View>
                    ))}
                </Card>

                {/* Acciones */}
                <Card>
                    <Text style={[type.subtitle, styles.cardTitle, { color: theme.text }]}>Acciones</Text>
                    <FormSwitch
                        label="Avisos"
                        description="Notificaciones cuando toca cada dosis"
                        value={t.reminders_enabled}
                        onChange={(v) => toggleReminders(v)}
                    />
                    {editingStart ? (
                        <View style={styles.startEdit}>
                            <TextInput
                                style={[styles.dateInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.overlayHover }]}
                                value={startInput || (startDate || '').slice(0, 10)}
                                onChangeText={setStartInput}
                                placeholder="AAAA-MM-DD"
                                placeholderTextColor={theme.textMuted}
                            />
                            <View style={styles.row}>
                                <Button
                                    label={isSettingStart ? 'Guardando…' : 'Guardar'}
                                    size="sm"
                                    disabled={isSettingStart || !startInput}
                                    onPress={() => { setStartDate(startInput); setEditingStart(false); }}
                                />
                                <Button label="Cancelar" size="sm" variant="secondary" onPress={() => setEditingStart(false)} />
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.row, styles.spaceBetween]}>
                            <Text style={[type.body, { color: theme.text }]}>Inicio: {fmtDate(startDate)}</Text>
                            {t.status !== 'terminado' && (
                                <Button
                                    label="Cambiar"
                                    size="sm"
                                    variant="secondary"
                                    fullWidth={false}
                                    onPress={() => { setStartInput((startDate || '').slice(0, 10)); setEditingStart(true); }}
                                />
                            )}
                        </View>
                    )}
                </Card>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    body: { padding: spacing.lg, gap: spacing.md },
    flex: { flex: 1, gap: 2 },
    hero: {
        borderRadius: radius.xl,
        borderWidth: 1,
        padding: spacing.xl,
        gap: spacing.md,
    },
    heroTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    heroIcon: {
        width: 52, height: 52, borderRadius: radius.lg,
        alignItems: 'center', justifyContent: 'center',
    },
    heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    progressTrack: { height: 6, borderRadius: radius.pill, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: radius.pill },
    badge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 2,
        borderRadius: radius.pill,
    },
    cardTitle: { marginBottom: spacing.md },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    cell: { minWidth: '45%', gap: 2 },
    cellLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    note: {
        borderTopWidth: 1,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        gap: spacing.xs,
    },
    tlRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    tlRail: { alignItems: 'center', flexShrink: 0 },
    tlDot: {
        width: 26, height: 26, borderRadius: 13,
        alignItems: 'center', justifyContent: 'center',
    },
    tlLine: { width: 2, flex: 1, minHeight: 16 },
    tlBody: { flex: 1, paddingBottom: spacing.md, gap: 1 },
    row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
    spaceBetween: { justifyContent: 'space-between' },
    startEdit: { gap: spacing.sm },
    dateInput: {
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing.sm,
        fontSize: 16,
    },
});
