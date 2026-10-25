/**
 * Pestaña Historial de la ficha: línea de tiempo clínica (consultas con recetas, vacunas y laboratorio) por mes, con
 * búsqueda y filtros por tipo y periodo; resumen del historial (Michi-IA o automático) para compartir; evolución de
 * peso y temperatura. Lógica en `useClinicalHistory` (espejo de la web).
 */
import React from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { ClipboardList, FlaskConical, SearchX, Share2, Sparkles, Syringe, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import SearchBar from '@/src/components/SearchBar';
import FilterChip from '@/src/components/FilterChip';
import SectionHeader from '@/src/components/SectionHeader';
import EmptyState from '@/src/components/EmptyState';
import Button from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import WeightSparkline from '@/src/components/WeightSparkline';
import { showAlert } from '@/src/components/AppAlert';
import { RecordItem, VaccineItem, LabItem } from '@/src/features/carnet/CarnetItems';
import type { usePetHealth } from '@/src/hooks/carnet/usePetHealth';
import { useClinicalHistory, historyReportText } from '@/src/hooks/carnet/useClinicalHistory';
import { KIND_LABEL, PERIOD_LABEL, type TimelineEvent, type TimelineKind, type TimelinePeriod } from '@/src/hooks/carnet/clinicalTimeline';
import { capitalize, formatDate } from '@/src/utils/formatters';
import { spacing, radius, type, layout } from '@/constants/design';

type Health = ReturnType<typeof usePetHealth>;

const KINDS: TimelineKind[] = ['consulta', 'vacuna', 'laboratorio'];
const PERIODS = Object.keys(PERIOD_LABEL) as TimelinePeriod[];

function EventItem({ event, health, petId }: { event: TimelineEvent; health: Health; petId: string }) {
    if (event.record) {
        const r = event.record;
        return (
            <RecordItem
                record={r}
                petId={petId}
                onEdit={health.canEdit ? () => health.editRecord(r.id) : undefined}
                onDelete={health.canEdit ? () => health.confirmDeleteRecord(r.id, r.reason_for_visit) : undefined}
            />
        );
    }
    if (event.vaccine) {
        const v = event.vaccine;
        return (
            <VaccineItem
                vaccine={v}
                onEdit={health.canEdit ? () => health.editVaccine(v.id) : undefined}
                onDelete={health.canEdit ? () => health.confirmDeleteVaccine(v.id, v.name) : undefined}
            />
        );
    }
    return event.lab ? <LabItem result={event.lab as any} /> : null;
}

function Vital({ label, unit, points, color }: { label: string; unit: string; points: { date: string; value: number }[]; color: string }) {
    const { theme } = useTheme();
    if (points.length === 0) return null;
    const last = points[points.length - 1];
    const change = points.length > 1 ? +(last.value - points[0].value).toFixed(2) : 0;
    return (
        <View style={styles.vital}>
            <View style={styles.vitalHead}>
                <Text style={[type.caption, { color: theme.textMuted }]}>{label}</Text>
                <Text style={[type.bodyStrong, { color: theme.text }]}>{last.value} {unit}</Text>
                {change !== 0 && (
                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        {change > 0 ? '+' : ''}{change} {unit} desde {formatDate(points[0].date)}
                    </Text>
                )}
            </View>
            {points.length >= 2 ? (
                <WeightSparkline data={points.map((p) => ({ date: p.date, weight: p.value }))} color={color} height={48} />
            ) : (
                <Text style={[type.caption, { color: theme.textMuted }]}>Una medición, el {formatDate(last.date)}.</Text>
            )}
        </View>
    );
}

export function PetHistoryTab({ health, petId, petName }: { health: Health; petId: string; petName: string }) {
    const { theme } = useTheme();
    const ch = useClinicalHistory(petId, health);
    const panel = [styles.panel, { backgroundColor: theme.surface, borderColor: theme.cardBorder }];

    const share = async () => {
        if (!ch.summary) return;
        try {
            await Share.share({ title: `Resumen clínico de ${petName}`, message: historyReportText(petName, ch.summary) });
        } catch {
            showAlert({ type: 'error', title: 'No se pudo compartir', message: 'Inténtalo de nuevo.' });
        }
    };

    if (ch.isLoading) {
        return (
            <View style={styles.tab}>
                {[0, 1, 2].map((i) => <Skeleton key={i} height={84} borderRadius={radius.lg} />)}
            </View>
        );
    }

    if (ch.events.length === 0) {
        return (
            <EmptyState
                icon={<ClipboardList size={layout.icon.xl} color={theme.textMuted} />}
                title="Sin historial todavía"
                subtitle={health.canEdit
                    ? 'Las consultas, vacunas y resultados aparecerán aquí.'
                    : `Cuando un veterinario atienda a ${petName}, sus registros aparecerán aquí.`}
                actionLabel={health.canEdit ? 'Registrar consulta' : health.isOwner ? 'Buscar veterinario' : undefined}
                onAction={health.canEdit ? health.addRecord : health.isOwner ? health.findVet : undefined}
            />
        );
    }

    return (
        <View style={styles.tab}>
            {/* Resumen: el superpoder principal, arriba */}
            <View style={panel}>
                <SectionHeader title="Resumen del historial" icon={<Sparkles size={layout.icon.sm} color={theme.accent} />} />
                {ch.summary ? (
                    <>
                        <Text style={[type.body, { color: theme.text }]}>{ch.summary.summary}</Text>
                        {ch.summary.highlights.map((x) => (
                            <Text key={x} style={[type.body, { color: theme.text }]}>• {x}</Text>
                        ))}
                        <Text style={[type.caption, { color: theme.textMuted }]}>{ch.summary.analysis_source} · {ch.summary.disclaimer}</Text>
                        <View style={styles.row}>
                            <Button label="Compartir" icon={<Share2 size={layout.icon.sm} color={theme.onPrimary} />} onPress={share} style={styles.flex} />
                            <Button label="Actualizar" variant="ghost" onPress={ch.generateSummary} loading={ch.isSummarizing} />
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={[type.body, { color: theme.textMuted }]}>
                            Michi-IA junta consultas, recetas, vacunas y laboratorio en un resumen para compartir con otro veterinario.
                        </Text>
                        {ch.summaryError && <Text style={[type.caption, { color: theme.error }]}>No se pudo generar el resumen. Inténtalo de nuevo.</Text>}
                        <Button
                            label="Resumir historial"
                            icon={<Sparkles size={layout.icon.sm} color={theme.onPrimary} />}
                            onPress={ch.generateSummary}
                            loading={ch.isSummarizing}
                            fullWidth
                        />
                    </>
                )}
            </View>

            {(ch.vitals.weight.length > 0 || ch.vitals.temperature.length > 0) && (
                <View style={panel}>
                    <SectionHeader title="Evolución" icon={<TrendingUp size={layout.icon.sm} color={theme.primary} />} />
                    <Vital label="Peso" unit="kg" points={ch.vitals.weight} color={theme.accent} />
                    <Vital label="Temperatura" unit="°C" points={ch.vitals.temperature} color={theme.info} />
                </View>
            )}

            <View style={styles.filters}>
                <SearchBar value={ch.query} onChangeText={ch.setQuery} placeholder="Buscar motivo, medicamento o vacuna" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    {KINDS.map((k) => (
                        <FilterChip
                            key={k}
                            label={KIND_LABEL[k]}
                            active={ch.kinds.includes(k)}
                            onPress={() => ch.toggleKind(k)}
                            count={ch.counts[k]}
                            icon={k === 'consulta'
                                ? <ClipboardList size={layout.icon.xs} color={theme.textMuted} />
                                : k === 'vacuna'
                                    ? <Syringe size={layout.icon.xs} color={theme.textMuted} />
                                    : <FlaskConical size={layout.icon.xs} color={theme.textMuted} />}
                        />
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    {PERIODS.map((p) => (
                        <FilterChip key={p} label={PERIOD_LABEL[p]} active={ch.period === p} onPress={() => ch.setPeriod(p)} />
                    ))}
                </ScrollView>
            </View>

            {health.canEdit && <Button label="Registrar consulta" onPress={health.addRecord} variant="secondary" fullWidth />}

            {ch.filtered.length === 0 ? (
                <EmptyState
                    icon={<SearchX size={layout.icon.xl} color={theme.textMuted} />}
                    title="Sin resultados"
                    subtitle="Ningún registro coincide con la búsqueda o los filtros."
                    actionLabel="Quitar filtros"
                    onAction={ch.clearFilters}
                />
            ) : (
                ch.groups.map((g) => (
                    <View key={g.key} style={styles.group}>
                        <Text style={[type.label, { color: theme.textMuted }]}>{capitalize(g.label)}</Text>
                        {g.events.map((e) => <EventItem key={e.id} event={e} health={health} petId={petId} />)}
                    </View>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    tab: { gap: spacing.lg },
    flex: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    panel: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
    vital: { gap: spacing.xs },
    vitalHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: spacing.sm },
    filters: { gap: spacing.sm },
    chips: { gap: spacing.xs },
    group: { gap: spacing.sm },
});
