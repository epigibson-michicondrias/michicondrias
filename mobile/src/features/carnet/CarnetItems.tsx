/**
 * Piezas del carnet de salud que se muestran en las pestañas Salud e Historial de la ficha de la mascota.
 * (Antes vivían dentro de app/carnet/[id].tsx.)
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Calendar, ChevronDown, ChevronUp, Weight, Thermometer, FileText, Syringe, Clock, Pill, Check, FlaskConical,
    AlertCircle, Activity, Info, Pencil, Trash2, Sun,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import IconButton from '@/src/components/IconButton';
import Button from '@/src/components/Button';
import { spacing, radius, type, layout } from '@/constants/design';
import type { MedicalRecord, Vaccine } from '@/src/services/carnet';
import type { Treatment, TreatmentDose } from '@/src/services/reminders';

const formatDate = (iso?: string | null) =>
    iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha';

function Tag({ label, color }: { label: string; color: string }) {
    return (
        <View style={[styles.tag, { borderColor: color }]}>
            <Text style={[type.label, styles.tagText, { color }]}>{label}</Text>
        </View>
    );
}

/** Acciones de edición/borrado de un renglón del carnet (solo el dueño o el equipo clínico). */
function ItemActions({ onEdit, onDelete, label }: {
    theme?: unknown;
    onEdit?: () => void;
    onDelete?: () => void;
    label: string;
}) {
    const { theme } = useTheme();
    if (!onEdit && !onDelete) return null;
    return (
        <View style={styles.actionsRow}>
            {onEdit ? <IconButton icon={Pencil} accessibilityLabel={`Editar ${label}`} onPress={onEdit} size="sm" /> : null}
            {onDelete ? <IconButton icon={Trash2} accessibilityLabel={`Eliminar ${label}`} onPress={onDelete} color={theme.error} size="sm" /> : null}
        </View>
    );
}

// ── Consulta (Historial) ────────────────────────────────────────────
export function RecordItem({ record, petId, onEdit, onDelete }: {
    record: MedicalRecord;
    petId: string;
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const { theme } = useTheme();
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const hasPrescription = !!record.prescriptions?.length;

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity
                onPress={() => setExpanded((v) => !v)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityLabel={`Consulta del ${formatDate(record.date)}: ${record.reason_for_visit}`}
                activeOpacity={0.75}
            >
                <View style={styles.rowBetween}>
                    <View style={styles.row}>
                        <Calendar size={layout.icon.xs} color={theme.primary} />
                        <Text style={[type.caption, { color: theme.primary }]}>{formatDate(record.date)}</Text>
                    </View>
                    {expanded ? <ChevronUp size={layout.icon.sm} color={theme.textMuted} /> : <ChevronDown size={layout.icon.sm} color={theme.textMuted} />}
                </View>
                <Text style={[type.subtitle, styles.mt, { color: theme.text }]} numberOfLines={expanded ? undefined : 2}>
                    {record.reason_for_visit}
                </Text>
                <View style={[styles.row, styles.wrap, styles.mt]}>
                    {!!record.weight_kg && <Tag label={`${record.weight_kg} kg`} color={theme.info} />}
                    {!!record.temperature_c && <Tag label={`${record.temperature_c} °C`} color={theme.error} />}
                    {hasPrescription && <Tag label="Receta" color={theme.success} />}
                </View>
            </TouchableOpacity>

            {expanded && (
                <View style={[styles.expanded, { borderTopColor: theme.border }]}>
                    {!!record.weight_kg && (
                        <View style={styles.row}><Weight size={layout.icon.xs} color={theme.info} /><Text style={[type.body, { color: theme.text }]}>Peso: {record.weight_kg} kg</Text></View>
                    )}
                    {!!record.temperature_c && (
                        <View style={styles.row}><Thermometer size={layout.icon.xs} color={theme.error} /><Text style={[type.body, { color: theme.text }]}>Temperatura: {record.temperature_c} °C</Text></View>
                    )}
                    {!!record.diagnosis && (
                        <View>
                            <Text style={[type.label, { color: theme.primary }]}>Diagnóstico</Text>
                            <Text style={[type.body, { color: theme.text }]}>{record.diagnosis}</Text>
                        </View>
                    )}
                    {!!record.treatment && (
                        <View>
                            <Text style={[type.label, { color: theme.info }]}>Tratamiento</Text>
                            <Text style={[type.body, { color: theme.text }]}>{record.treatment}</Text>
                        </View>
                    )}
                    {!!record.notes && (
                        <View>
                            <Text style={[type.label, { color: theme.textMuted }]}>Notas</Text>
                            <Text style={[type.body, { color: theme.textMuted }]}>{record.notes}</Text>
                        </View>
                    )}
                    {hasPrescription && (
                        <TouchableOpacity
                            style={[styles.prescription, { borderColor: theme.success, backgroundColor: theme.successLight }]}
                            onPress={() => router.push({ pathname: '/carnet/receta/[id]', params: { id: record.id, petId } } as any)}
                            accessibilityRole="button"
                            accessibilityLabel="Ver receta"
                        >
                            <FileText size={layout.icon.sm} color={theme.success} />
                            <View style={styles.flex}>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>Ver receta</Text>
                                <Text style={[type.caption, { color: theme.textMuted }]} numberOfLines={2}>
                                    {record.prescriptions!.map((p) => p.medication_name).join(', ')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            )}
            <ItemActions onEdit={onEdit} onDelete={onDelete} label={`consulta ${record.reason_for_visit}`} />
        </View>
    );
}

// ── Vacuna (Salud) ──────────────────────────────────────────────────
export function VaccineItem({ vaccine, onEdit, onDelete }: {
    vaccine: Vaccine;
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const { theme } = useTheme();
    const overdue = !!vaccine.next_due_date && new Date(vaccine.next_due_date) < new Date();
    const color = overdue ? theme.error : theme.success;
    return (
        <View style={[styles.card, styles.rowCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: overdue ? theme.errorLight : theme.successLight }]}>
                <Syringe size={layout.icon.md} color={color} />
            </View>
            <View style={styles.flex}>
                <View style={styles.rowBetween}>
                    <Text style={[type.subtitle, styles.flex, { color: theme.text }]}>{vaccine.name}</Text>
                    <Tag label={overdue ? 'Refuerzo vencido' : 'Vigente'} color={color} />
                </View>
                <View style={styles.rowBetween}>
                    <View style={styles.flex}>
                        <Text style={[type.caption, { color: theme.textMuted }]}>Aplicada: {formatDate(vaccine.date_administered)}</Text>
                        {!!vaccine.next_due_date && (
                            <View style={styles.row}>
                                <Clock size={layout.icon.xs} color={overdue ? theme.error : theme.primary} />
                                <Text style={[type.caption, { color: overdue ? theme.error : theme.primary }]}>Refuerzo: {formatDate(vaccine.next_due_date)}</Text>
                            </View>
                        )}
                    </View>
                    <ItemActions onEdit={onEdit} onDelete={onDelete} label={`vacuna ${vaccine.name}`} />
                </View>
            </View>
        </View>
    );
}

// ── Tratamiento: medicamento recetado con interruptor, historial y fecha de inicio ──
const formatDateTime = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`;
};

// ── Panel «Lo que toca hoy» — checklist premium ──
export function TodayDoses({ treatments, onCheck, isChecking, canCheck }: {
    treatments: Treatment[];
    onCheck: (id: string) => void;
    isChecking: boolean;
    canCheck: boolean;
}) {
    const { theme } = useTheme();
    const items: { dose: TreatmentDose; treatment: Treatment; overdue: boolean; label: string }[] = [];
    for (const t of treatments) {
        for (const d of t.doses) {
            if (d.sent) continue;
            if (d.isOverdue || d.isToday) {
                const when = new Date(d.remind_at);
                const time = when.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                items.push({ dose: d, treatment: t, overdue: !!d.isOverdue, label: d.isOverdue ? `${time} · atrasada` : time });
            }
        }
    }
    items.sort((a, b) => new Date(a.dose.remind_at).getTime() - new Date(b.dose.remind_at).getTime());

    // Próxima toma futura para el estado vacío
    let nextFuture: { t: Treatment; d: TreatmentDose } | null = null;
    for (const t of treatments) {
        for (const d of t.doses) {
            if (!d.sent && !d.isOverdue && !d.isToday) { nextFuture = { t, d }; break; }
        }
        if (nextFuture) break;
    }

    const pending = items.filter((i) => !i.dose.sent);

    return (
        <View style={[todayStyles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={todayStyles.header}>
                <View style={todayStyles.headerLeft}>
                    <Text style={[type.label, { color: theme.primary }]}>LO QUE TOCA HOY</Text>
                    <Text style={[type.h2, todayStyles.headerTitle, { color: theme.text }]}>
                        {items.length === 0 ? 'Todo al día' : `${pending.length} ${pending.length === 1 ? 'toma por dar' : 'tomas por dar'}`}
                    </Text>
                </View>
                <View style={todayStyles.headerRight}>
                    <Sun size={16} color={theme.accent} />
                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Text>
                </View>
            </View>

            {items.length === 0 ? (
                <View style={[todayStyles.emptyOk, { backgroundColor: theme.successLight }]}>
                    <View style={[todayStyles.emptyCheck, { backgroundColor: theme.success }]}>
                        <Check size={18} color="#fff" />
                    </View>
                    <View style={todayStyles.flex}>
                        <Text style={[type.subtitle, { color: theme.text }]}>Sin tomas pendientes hoy</Text>
                        {nextFuture ? (
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                Próxima: {nextFuture.t.medication_name} · {formatDateTime(nextFuture.d.remind_at)}
                            </Text>
                        ) : (
                            <Text style={[type.caption, { color: theme.textMuted }]}>No hay más tomas programadas.</Text>
                        )}
                    </View>
                </View>
            ) : (
                <>
                    <View style={todayStyles.list}>
                        {items.map(({ dose, treatment, overdue, label }) => (
                            <TouchableOpacity
                                key={dose.id}
                                disabled={isChecking || !canCheck}
                                onPress={() => onCheck(dose.id)}
                                accessibilityRole="button"
                                accessibilityLabel={`Marcar ${treatment.medication_name} como tomado`}
                                style={[
                                    todayStyles.row,
                                    { backgroundColor: overdue ? theme.accentLight : theme.overlayHover, borderColor: overdue ? theme.accent : theme.border },
                                ]}
                            >
                                <View style={[todayStyles.checkbox, { borderColor: overdue ? theme.accent : theme.border }]}>
                                    {isChecking ? <ActivityIndicator size="small" color={theme.primary} /> : null}
                                </View>
                                <View style={todayStyles.flex}>
                                    <Text style={[type.subtitle, { color: theme.text }]}>{treatment.medication_name}</Text>
                                    <Text style={[type.caption, { color: theme.textMuted }]}>{treatment.dosage} · {label}</Text>
                                </View>
                                {overdue && (
                                    <View style={[todayStyles.badge, { backgroundColor: theme.primary }]}>
                                        <Text style={[type.label, { color: theme.surface }]}>ATRASADA</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    {pending.length > 1 && canCheck && (
                        <Button
                            label={`Marcar las ${pending.length} tomas`}
                            variant="secondary"
                            onPress={() => pending.forEach((i) => onCheck(i.dose.id))}
                            disabled={isChecking}
                            fullWidth
                        />
                    )}
                </>
            )}
        </View>
    );
}

const todayStyles = StyleSheet.create({
    panel: {
        borderRadius: radius.xl,
        borderWidth: 1,
        padding: spacing.xl,
        gap: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    headerLeft: { flex: 1, gap: 2 },
    headerTitle: { marginTop: 2 },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        flexShrink: 0,
    },
    list: { gap: spacing.sm },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    flex: { flex: 1, gap: 1 },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.pill,
        flexShrink: 0,
    },
    emptyOk: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
    },
    emptyCheck: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
});

export function TreatmentItem({ treatment, onCheck, canCheck, isChecking, onToggle, canToggle, isToggling, onSetStartDate, canSetStart, isSettingStart }: {
    treatment: Treatment;
    onCheck: (id: string) => void;
    canCheck: boolean;
    isChecking: boolean;
    onToggle: (prescriptionId: string, enabled: boolean) => void;
    canToggle: boolean;
    isToggling: boolean;
    onSetStartDate: (prescriptionId: string, startDate: string) => void;
    canSetStart: boolean;
    isSettingStart: boolean;
}) {
    const { theme } = useTheme();
    const router = useRouter();
    const [showHistory, setShowHistory] = useState(false);
    const [editingStart, setEditingStart] = useState(false);
    const [startInput, setStartInput] = useState(treatment.start_date?.slice(0, 10) ?? '');
    const total = treatment.doses.length;
    const taken = treatment.doses.filter((d) => d.sent).length;
    const nextDose = treatment.doses.find((d) => !d.sent);
    const allDone = total > 0 && !nextDose;
    const takenDoses = treatment.doses.filter((d) => d.sent);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/carnet/tratamiento/[id]', params: { id: treatment.prescription_id } } as any)}
            accessibilityRole="button"
            accessibilityLabel={`Ver ficha de ${treatment.medication_name}`}
        >
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.rowBetween}>
                <View style={[styles.row, { flex: 1, minWidth: 0 }]}>
                    <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
                        <Pill size={layout.icon.md} color={theme.primary} />
                    </View>
                    <View style={styles.flex}>
                        <Text style={[type.subtitle, { color: theme.text }]}>{treatment.medication_name}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>
                            {treatment.dosage} · cada {treatment.frequency_hours} h · {treatment.duration_days} días
                        </Text>
                    </View>
                </View>
                {canToggle && (
                    <TouchableOpacity
                        disabled={isToggling}
                        onPress={() => onToggle(treatment.prescription_id, !treatment.reminders_enabled)}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: treatment.reminders_enabled, disabled: isToggling }}
                        accessibilityLabel={`Avisos de ${treatment.medication_name}`}
                        style={[
                            styles.toggle,
                            { backgroundColor: treatment.reminders_enabled ? theme.primary : theme.overlayHover, borderColor: treatment.reminders_enabled ? theme.primary : theme.border, opacity: isToggling ? 0.5 : 1 },
                        ]}
                    >
                        <View style={[styles.toggleThumb, { backgroundColor: theme.surface, transform: [{ translateX: treatment.reminders_enabled ? 18 : 2 }] }]} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Fecha de inicio */}
            <View style={[styles.row, styles.mt]}>
                <Calendar size={layout.icon.xs} color={theme.textMuted} />
                <Text style={[type.caption, { color: theme.textMuted }]}>
                    Inicio: {treatment.start_date ? formatDate(treatment.start_date) : formatDate(treatment.record_date)}
                </Text>
                {canSetStart && treatment.status !== 'terminado' && !editingStart && (
                    <TouchableOpacity onPress={() => setEditingStart(true)} accessibilityRole="button" accessibilityLabel="Cambiar fecha de inicio">
                        <Text style={[type.caption, { color: theme.primary }]}>Cambiar</Text>
                    </TouchableOpacity>
                )}
            </View>

            {editingStart && (
                <View style={[styles.row, styles.mt]}>
                    <TextInput
                        style={[styles.dateInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.overlayHover }]}
                        value={startInput}
                        onChangeText={setStartInput}
                        placeholder="AAAA-MM-DD"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="numbers-and-punctuation"
                        accessibilityLabel="Fecha de inicio del tratamiento"
                    />
                    <TouchableOpacity
                        disabled={isSettingStart || !startInput}
                        onPress={() => { onSetStartDate(treatment.prescription_id, startInput); setEditingStart(false); }}
                        style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: isSettingStart || !startInput ? 0.5 : 1 }]}
                        accessibilityRole="button"
                    >
                        <Text style={[type.bodyStrong, { color: theme.surface }]}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingStart(false)} accessibilityRole="button">
                        <Text style={[type.caption, { color: theme.textMuted }]}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Avance y próxima toma */}
            {total > 0 ? (
                <Text style={[type.caption, styles.mt, { color: theme.textMuted }]}>
                    {taken} de {total} tomas{nextDose ? ` · próxima ${formatDateTime(nextDose.remind_at)}` : ' · tratamiento terminado'}
                </Text>
            ) : (
                <Text style={[type.caption, styles.mt, { color: theme.textMuted }]}>
                    Sin tomas programadas{treatment.reminders_enabled ? '' : ' · avisos apagados'}
                </Text>
            )}

            {nextDose && canCheck && nextDose.isDue && (
                <TouchableOpacity
                    disabled={isChecking}
                    style={[styles.checkBtn, { backgroundColor: theme.primaryLight, opacity: isChecking ? 0.5 : 1 }]}
                    onPress={() => onCheck(nextDose.id)}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isChecking }}
                    accessibilityLabel={`Marcar ${treatment.medication_name} como tomado`}
                >
                    <Check size={layout.icon.sm} color={theme.primary} />
                    <Text style={[type.bodyStrong, { color: theme.primary }]}>{isChecking ? 'Marcando…' : 'Marcar como tomado'}</Text>
                </TouchableOpacity>
            )}

            {nextDose && canCheck && !nextDose.isDue && (
                <Text style={[type.caption, styles.mt, { color: theme.textMuted }]}>
                    Podrás marcarla cuando toque la dosis
                </Text>
            )}

            {allDone && (
                <View style={[styles.row, styles.mt]}>
                    <Check size={layout.icon.xs} color={theme.success} />
                    <Text style={[type.caption, { color: theme.success }]}>Todas las tomas registradas</Text>
                </View>
            )}

            {/* Historial de tomas */}
            {takenDoses.length > 0 && (
                <TouchableOpacity
                    onPress={() => setShowHistory((v) => !v)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showHistory }}
                    accessibilityLabel="Ver historial de tomas"
                    style={[styles.row, styles.mt, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: spacing.sm }]}
                >
                    <Text style={[type.caption, { color: theme.primary }]}>
                        {showHistory ? 'Ocultar historial' : `Ver historial (${takenDoses.length} ${takenDoses.length === 1 ? 'toma' : 'tomas'})`}
                    </Text>
                    {showHistory ? <ChevronUp size={layout.icon.xs} color={theme.primary} /> : <ChevronDown size={layout.icon.xs} color={theme.primary} />}
                </TouchableOpacity>
            )}
            {showHistory && takenDoses.length > 0 && (
                <View style={styles.historyList}>
                    {takenDoses.map((d) => (
                        <View key={d.id} style={styles.historyRow}>
                            <Check size={layout.icon.xs} color={theme.success} />
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                {formatDateTime(d.taken_at || d.remind_at)} — Tomado
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
        </TouchableOpacity>
    );
}

// ── Resultado de laboratorio (Salud) ────────────────────────────────
export interface LabResult {
    parameter_name: string;
    measured_value: string | number;
    unit?: string | null;
    reference_range?: string | null;
    is_anomaly?: boolean;
    created_at?: string | null;
}

export function LabItem({ result }: { result: LabResult }) {
    const { theme } = useTheme();
    const anomaly = !!result.is_anomaly;
    return (
        <View style={[styles.card, styles.rowCard, { backgroundColor: theme.surface, borderColor: anomaly ? theme.error : theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: anomaly ? theme.errorLight : theme.primaryLight }]}>
                <FlaskConical size={layout.icon.md} color={anomaly ? theme.error : theme.primary} />
            </View>
            <View style={styles.flex}>
                <View style={styles.rowBetween}>
                    <Text style={[type.subtitle, styles.flex, { color: theme.text }]}>{result.parameter_name}</Text>
                    {anomaly && (
                        <View style={styles.row}>
                            <AlertCircle size={layout.icon.xs} color={theme.error} />
                            <Text style={[type.caption, { color: theme.error }]}>Fuera de rango</Text>
                        </View>
                    )}
                </View>
                <View style={styles.row}>
                    <Activity size={layout.icon.xs} color={theme.textMuted} />
                    <Text style={[type.bodyStrong, { color: theme.text }]}>{result.measured_value} {result.unit || ''}</Text>
                </View>
                {!!result.reference_range && (
                    <View style={styles.row}>
                        <Info size={layout.icon.xs} color={theme.textMuted} />
                        <Text style={[type.caption, { color: theme.textMuted }]}>Rango normal: {result.reference_range} {result.unit || ''}</Text>
                    </View>
                )}
                <Text style={[type.caption, { color: theme.textMuted }]}>{formatDate(result.created_at)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: radius.lg,
        padding: spacing.lg,
        overflow: 'hidden',
    },
    rowCard: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        flexShrink: 1,
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    wrap: {
        flexWrap: 'wrap',
    },
    mt: {
        marginTop: spacing.sm,
    },
    flex: {
        flex: 1,
        gap: spacing.xxs,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.xs,
    },
    iconBox: {
        width: layout.iconBox.md,
        height: layout.iconBox.md,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tag: {
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xxs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagText: {
        letterSpacing: 0.4,
    },
    expanded: {
        borderTopWidth: 1,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        gap: spacing.md,
    },
    prescription: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1,
        borderRadius: radius.md,
        padding: spacing.md,
        minHeight: layout.minTouch,
    },
    checkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        minHeight: layout.minTouch,
        borderRadius: radius.md,
        marginTop: spacing.sm,
    },
    toggle: {
        width: 44,
        height: 26,
        borderRadius: radius.pill,
        borderWidth: 1,
        justifyContent: 'center',
        padding: 2,
        flexShrink: 0,
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: radius.pill,
    },
    dateInput: {
        borderWidth: 1,
        borderRadius: radius.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minWidth: 110,
        fontSize: 14,
    },
    saveBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        minHeight: 32,
        justifyContent: 'center',
    },
    historyList: {
        marginTop: spacing.xs,
        gap: spacing.xxs,
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
});
