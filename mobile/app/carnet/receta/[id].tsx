/**
 * Receta médica: documento de solo lectura con folio y estado, quién la emite (clínica y veterinario reales de la
 * consulta), paciente, diagnóstico, cada medicamento con su plan (fechas, tomas, avance) y firma. Sin promesas que la
 * app no cumple (no hay farmacias conectadas: el folio es la referencia). Lógica en `usePrescriptionDetail`.
 */
import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, CalendarDays, FileText, Pill, Share2, Stethoscope } from 'lucide-react-native';
import { usePrescriptionDetail } from '@/src/hooks/carnet/usePrescriptionDetail';
import { STATUS_LABEL, frequencyLabel, type MedicationPlan, type TreatmentStatus } from '@/src/hooks/carnet/prescriptionPlan';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { DetailFooter } from '@/src/components/layout/DetailLayout';
import Button from '@/src/components/Button';
import EmptyState from '@/src/components/EmptyState';
import { Skeleton } from '@/src/components/Skeleton';
import { capitalize, formatDate } from '@/src/utils/formatters';
import { families, layout, radius, shadow, spacing, type } from '@/constants/design';

function StatusPill({ status, onHero }: { status: TreatmentStatus; onHero?: boolean }) {
    const { theme } = useTheme();
    const tone = status === 'en-curso'
        ? { bg: theme.successLight, fg: theme.success }
        : status === 'por-iniciar'
            ? { bg: theme.infoLight, fg: theme.info }
            : onHero ? { bg: theme.heroGlass, fg: theme.onHeroMuted } : { bg: theme.backgroundSecondary, fg: theme.textMuted };
    return (
        <View style={[styles.pill, { backgroundColor: tone.bg }]}>
            <Text style={[type.label, { color: tone.fg }]}>{STATUS_LABEL[status]}</Text>
        </View>
    );
}

function MedCard({ plan, index }: { plan: MedicationPlan; index: number }) {
    const { theme } = useTheme();
    const m = plan.med;
    const facts = [
        { label: 'Dosis', value: m.dosage },
        { label: 'Frecuencia', value: frequencyLabel(plan) },
        { label: 'Duración', value: `${m.duration_days} ${m.duration_days === 1 ? 'día' : 'días'}` },
        { label: 'Tomas en total', value: String(plan.totalDoses) },
    ];
    return (
        <View style={[styles.med, { backgroundColor: theme.surface, borderColor: theme.cardBorder, borderLeftColor: theme.accent }]}>
            <View style={styles.medHead}>
                <View style={[styles.medIndex, { backgroundColor: theme.accentLight }]}>
                    <Text style={[type.label, { color: theme.accent }]}>{index + 1}</Text>
                </View>
                <Text style={[type.title, styles.flex, { color: theme.text }]}>{m.medication_name}</Text>
                <StatusPill status={plan.status} />
            </View>
            <View style={styles.facts}>
                {facts.map((f) => (
                    <View key={f.label} style={styles.fact}>
                        <Text style={[type.caption, { color: theme.textMuted }]}>{f.label}</Text>
                        <Text style={[type.bodyStrong, { color: theme.text }]}>{f.value}</Text>
                    </View>
                ))}
            </View>
            <View style={styles.row}>
                <CalendarDays size={layout.icon.xs} color={theme.textMuted} />
                <Text style={[type.caption, { color: theme.textMuted }]}>
                    Del {formatDate(plan.start.toISOString())} al {formatDate(plan.end.toISOString())}
                </Text>
            </View>
            {plan.status === 'en-curso' && (
                <View style={styles.progress}>
                    <View style={[styles.bar, { backgroundColor: theme.backgroundSecondary }]}>
                        <View style={[styles.barFill, { backgroundColor: theme.accent, width: `${Math.round(plan.progress * 100)}%` }]} />
                    </View>
                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        {plan.daysLeft} {plan.daysLeft === 1 ? 'día restante' : 'días restantes'}
                    </Text>
                </View>
            )}
            {m.instructions && (
                <View style={[styles.instructions, { backgroundColor: theme.accentLight }]}>
                    <Text style={[type.body, { color: theme.text }]}>
                        <Text style={{ fontFamily: families.bold }}>Indicaciones: </Text>{m.instructions}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default function PrescriptionDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { pet, record, clinic, vet, plans, status, folio, loading } = usePrescriptionDetail();

    if (loading) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Receta médica" />
                <View style={styles.loading}>
                    <Skeleton height={140} borderRadius={radius.xl} />
                    <Skeleton height={120} borderRadius={radius.lg} />
                    <Skeleton height={180} borderRadius={radius.lg} />
                </View>
            </ScreenContainer>
        );
    }

    if (!record || !pet) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Receta médica" />
                <EmptyState
                    icon={<FileText size={layout.icon.xl} color={theme.textMuted} />}
                    title="Receta no encontrada"
                    subtitle="Puede que la consulta se haya eliminado o que no tengas acceso a ella."
                    actionLabel="Volver"
                    onAction={() => router.back()}
                />
            </ScreenContainer>
        );
    }

    const vetName = vet ? `${vet.first_name} ${vet.last_name}`.trim() : null;
    const species = capitalize(pet.species);
    const cellBorder = { borderBottomColor: theme.divider };

    const handleShare = async () => {
        const lines = [
            `Receta ${folio} · ${pet.name} (${species}${pet.breed ? `, ${pet.breed}` : ''})`,
            `Fecha: ${formatDate(record.date)}${vetName ? ` · ${vetName}` : ''}${clinic ? ` · ${clinic.name}` : ''}`,
            record.diagnosis ? `Diagnóstico: ${record.diagnosis}` : `Motivo: ${record.reason_for_visit}`,
            '',
            ...plans.map((p) => `• ${p.med.medication_name}: ${p.med.dosage}, ${frequencyLabel(p).toLowerCase()} por ${p.med.duration_days} días${p.med.instructions ? ` (${p.med.instructions})` : ''}`),
        ];
        try {
            await Share.share({ message: lines.join('\n'), title: `Receta ${folio}` });
        } catch {
            // El usuario canceló o el sistema no pudo abrir el menú de compartir
        }
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Receta médica" subtitle={pet.name} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={[styles.doc, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                    <LinearGradient colors={theme.heroGradient} style={[styles.docHead, { borderBottomColor: theme.accent }]}>
                        <View style={styles.row}>
                            <View style={[styles.brandMark, { borderColor: theme.accent, backgroundColor: theme.heroGlass }]}>
                                <Stethoscope size={layout.icon.md} color={theme.accent} />
                            </View>
                            <View style={styles.flex}>
                                <Text style={[type.label, { color: theme.accent }]}>RECETA MÉDICA VETERINARIA</Text>
                                <Text style={[type.h1, { color: theme.onHero }]} numberOfLines={2}>{clinic?.name ?? 'Michicondrias'}</Text>
                                {clinic && (clinic.address || clinic.phone) && (
                                    <Text style={[type.caption, { color: theme.onHeroMuted }]}>{[clinic.address, clinic.city, clinic.phone].filter(Boolean).join(' · ')}</Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.folioRow}>
                            <View>
                                <Text style={[type.caption, { color: theme.onHeroMuted }]}>Folio</Text>
                                <Text style={[type.title, styles.mono, { color: theme.onHero }]}>{folio}</Text>
                            </View>
                            <View style={styles.folioEnd}>
                                <Text style={[type.caption, { color: theme.onHeroMuted }]}>{formatDate(record.date)}</Text>
                                <StatusPill status={status} onHero />
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={[styles.cell, cellBorder]}>
                        <Text style={[type.label, { color: theme.textMuted }]}>PACIENTE</Text>
                        <Text style={[type.title, { color: theme.text }]}>{pet.name}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>
                            {[species, pet.breed, record.weight_kg ? `${record.weight_kg} kg` : null].filter(Boolean).join(' · ')}
                        </Text>
                    </View>
                    <View style={[styles.cell, cellBorder]}>
                        <Text style={[type.label, { color: theme.textMuted }]}>MOTIVO DE LA CONSULTA</Text>
                        <Text style={[type.title, { color: theme.text }]}>{record.reason_for_visit}</Text>
                        {!!record.temperature_c && <Text style={[type.caption, { color: theme.textMuted }]}>Temperatura: {record.temperature_c} °C</Text>}
                    </View>
                    {!!record.diagnosis && (
                        <View style={[styles.cell, cellBorder]}>
                            <Text style={[type.label, { color: theme.textMuted }]}>DIAGNÓSTICO</Text>
                            <Text style={[type.bodyStrong, { color: theme.text }]}>{record.diagnosis}</Text>
                        </View>
                    )}
                    {!!record.treatment && (
                        <View style={[styles.cell, cellBorder]}>
                            <Text style={[type.label, { color: theme.textMuted }]}>TRATAMIENTO INDICADO</Text>
                            <Text style={[type.body, { color: theme.text }]}>{record.treatment}</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Pill size={layout.icon.sm} color={theme.accent} />
                            <Text style={[type.label, { color: theme.accent }]}>MEDICAMENTOS ({plans.length})</Text>
                        </View>
                        {plans.length === 0 ? (
                            <Text style={[type.body, { color: theme.textMuted }]}>Esta consulta no incluye medicamentos.</Text>
                        ) : (
                            plans.map((p, i) => <MedCard key={p.med.id ?? i} plan={p} index={i} />)
                        )}
                        {plans.some((p) => p.status === 'en-curso') && (
                            <View style={styles.row}>
                                <Bell size={layout.icon.xs} color={theme.textMuted} />
                                <Text style={[type.caption, styles.flex, { color: theme.textMuted }]}>
                                    Te avisamos cuando toque cada dosis; márcalas como dadas en la pestaña Salud de {pet.name}.
                                </Text>
                            </View>
                        )}
                    </View>

                    {!!record.notes && (
                        <View style={styles.section}>
                            <Text style={[type.label, { color: theme.textMuted }]}>NOTAS DEL VETERINARIO</Text>
                            <Text style={[type.body, { color: theme.text }]}>{record.notes}</Text>
                        </View>
                    )}

                    <View style={[styles.sign, { borderTopColor: theme.border }]}>
                        <View style={[styles.signLine, { backgroundColor: theme.textMuted }]} />
                        <Text style={[type.bodyStrong, { color: theme.text }]}>{vetName ?? 'Médico veterinario'}</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>
                            {[vet?.specialty, vet?.license_number ? `Cédula profesional ${vet.license_number}` : null].filter(Boolean).join(' · ') || 'Firma del veterinario tratante'}
                        </Text>
                        <Text style={[type.caption, styles.legal, { color: theme.textMuted }]}>
                            Emitida en Michicondrias · {folio}. Sigue las indicaciones de tu veterinario y consúltale ante cualquier reacción.
                        </Text>
                    </View>
                </View>
            </ScrollView>
            <DetailFooter>
                <Button label="Compartir receta" icon={<Share2 size={layout.icon.sm} color={theme.onPrimary} />} onPress={handleShare} size="lg" style={styles.flex} />
            </DetailFooter>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    mono: { letterSpacing: 1 },
    loading: { padding: layout.screenPadding, gap: spacing.lg },
    scroll: { padding: layout.screenPadding, paddingBottom: spacing.huge },
    doc: { overflow: 'hidden', borderWidth: 1, borderRadius: radius.xl, ...shadow.raised },
    docHead: { padding: spacing.xl, gap: spacing.lg, borderBottomWidth: 2 },
    brandMark: { width: layout.minTouch, height: layout.minTouch, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    folioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: spacing.md },
    folioEnd: { alignItems: 'flex-end', gap: spacing.xs },
    pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xxs, borderRadius: radius.pill },
    cell: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.xxs, borderBottomWidth: StyleSheet.hairlineWidth },
    section: { padding: spacing.xl, gap: spacing.md },
    med: { padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderLeftWidth: 3, borderRadius: radius.lg },
    medHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    medIndex: { width: layout.iconBox.sm, height: layout.iconBox.sm, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
    facts: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
    fact: { width: '50%', gap: spacing.xxs },
    progress: { gap: spacing.xs },
    bar: { height: spacing.sm, borderRadius: radius.pill, overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: radius.pill },
    instructions: { padding: spacing.md, borderRadius: radius.md },
    sign: { padding: spacing.xl, gap: spacing.xxs, borderTopWidth: 1, borderStyle: 'dashed' },
    signLine: { width: '60%', height: StyleSheet.hairlineWidth, marginBottom: spacing.sm, opacity: 0.6 },
    legal: { marginTop: spacing.md },
});
