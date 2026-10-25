/**
 * Piezas del carnet de salud que se muestran en las pestañas Salud e Historial de la ficha de la mascota.
 * (Antes vivían dentro de app/carnet/[id].tsx.)
 */
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Calendar, ChevronDown, ChevronUp, Weight, Thermometer, FileText, Syringe, Clock, Pill, Check, FlaskConical,
    AlertCircle, Activity, Info, Pencil, Trash2,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import IconButton from '@/src/components/IconButton';
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

// ── Tratamiento: medicamento recetado con interruptor de avisos (Salud) ──
function doseTimeLabel(dose: TreatmentDose) {
    if (dose.sent) return 'Tomado';
    const diffMs = new Date(dose.remind_at).getTime() - Date.now();
    if (diffMs < 0) return 'Atrasado';
    const hours = Math.round(diffMs / 3_600_000);
    if (hours < 1) return 'En menos de 1 h';
    if (hours < 24) return `En ${hours} h`;
    const days = Math.round(diffMs / 86_400_000);
    return days === 1 ? 'Mañana' : `En ${days} días`;
}

export function TreatmentItem({ treatment, onCheck, canCheck, onToggle, canToggle }: {
    treatment: Treatment;
    onCheck: (id: string) => void;
    canCheck: boolean;
    onToggle: (prescriptionId: string, enabled: boolean) => void;
    canToggle: boolean;
}) {
    const { theme } = useTheme();
    const total = treatment.doses.length;
    const taken = treatment.doses.filter((d) => d.sent).length;
    const nextDose = treatment.doses.find((d) => !d.sent);
    const allDone = total > 0 && !nextDose;

    return (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.rowBetween}>
                <View style={styles.row}>
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
                        onPress={() => onToggle(treatment.prescription_id, !treatment.reminders_enabled)}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: treatment.reminders_enabled }}
                        accessibilityLabel={`Avisos de ${treatment.medication_name}`}
                        style={[
                            styles.toggle,
                            { backgroundColor: treatment.reminders_enabled ? theme.primary : theme.overlayHover, borderColor: treatment.reminders_enabled ? theme.primary : theme.border },
                        ]}
                    >
                        <View style={[styles.toggleThumb, { backgroundColor: theme.surface, transform: [{ translateX: treatment.reminders_enabled ? 18 : 2 }] }]} />
                    </TouchableOpacity>
                )}
            </View>

            {total > 0 ? (
                <Text style={[type.caption, styles.mt, { color: theme.textMuted }]}>
                    {taken} de {total} tomas{nextDose ? ` · próxima ${doseTimeLabel(nextDose).toLowerCase()}` : ' · tratamiento terminado'}
                </Text>
            ) : (
                <Text style={[type.caption, styles.mt, { color: theme.textMuted }]}>
                    Sin tomas programadas{treatment.reminders_enabled ? '' : ' · avisos apagados'}
                </Text>
            )}

            {nextDose && canCheck && (
                <TouchableOpacity
                    style={[styles.checkBtn, { backgroundColor: theme.primaryLight }]}
                    onPress={() => onCheck(nextDose.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Marcar ${treatment.medication_name} como tomado`}
                >
                    <Check size={layout.icon.sm} color={theme.primary} />
                    <Text style={[type.bodyStrong, { color: theme.primary }]}>Marcar como tomado</Text>
                </TouchableOpacity>
            )}

            {allDone && (
                <View style={[styles.row, styles.mt]}>
                    <Check size={layout.icon.xs} color={theme.success} />
                    <Text style={[type.caption, { color: theme.success }]}>Todas las tomas registradas</Text>
                </View>
            )}
        </View>
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
    },
    rowCard: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
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
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: radius.pill,
    },
});
