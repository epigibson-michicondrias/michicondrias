/**
 * Pestaña Historial de la ficha: línea de tiempo clínica (consultas con recetas, vacunas y laboratorio) por mes, con
 * búsqueda y filtros por tipo y periodo; resumen del historial (Michi-IA o automático) para compartir; evolución de
 * peso y temperatura. Lógica en `useClinicalHistory` (espejo de la web).
 */
import React from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    ClipboardList,
    FlaskConical,
    RotateCcw,
    SearchX,
    Share2,
    SlidersHorizontal,
    Sparkles,
    Syringe,
    TrendingUp,
} from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import SearchBar from '@/src/components/SearchBar';
import SectionHeader from '@/src/components/SectionHeader';
import EmptyState from '@/src/components/EmptyState';
import Button from '@/src/components/Button';
import SegmentedControl, { type SegmentOption } from '@/src/components/SegmentedControl';
import { Skeleton } from '@/src/components/Skeleton';
import WeightSparkline from '@/src/components/WeightSparkline';
import { showAlert } from '@/src/components/AppAlert';
import { RecordItem, VaccineItem, LabItem } from '@/src/features/carnet/CarnetItems';
import type { usePetHealth } from '@/src/hooks/carnet/usePetHealth';
import { useClinicalHistory, historyReportText } from '@/src/hooks/carnet/useClinicalHistory';
import { KIND_LABEL, type TimelineEvent, type TimelineKind, type TimelinePeriod } from '@/src/hooks/carnet/clinicalTimeline';
import { capitalize, formatDate } from '@/src/utils/formatters';
import { spacing, radius, type, layout, shadow, families, press } from '@/constants/design';

type Health = ReturnType<typeof usePetHealth>;

const KINDS: TimelineKind[] = ['consulta', 'vacuna', 'laboratorio'];

const PERIOD_OPTIONS: SegmentOption<TimelinePeriod>[] = [
    { value: 'todo', label: 'Todo' },
    { value: '30d', label: '30 días' },
    { value: '6m', label: '6 meses' },
    { value: '12m', label: '1 año' },
];

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
    const panel = [styles.panel, shadow.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }];

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

            {/* Contenedor de filtros clínicos unificado y premium */}
            <View
                style={[
                    styles.filtersCard,
                    shadow.card,
                    {
                        backgroundColor: theme.surface,
                        borderColor: theme.borderLight,
                    },
                ]}
            >
                {/* Cabecera de filtros */}
                <View style={styles.filtersHeader}>
                    <View style={styles.filtersHeaderTitle}>
                        <SlidersHorizontal size={15} color={theme.primary} />
                        <Text style={[type.bodyStrong, { color: theme.text }]}>
                            Filtros clínicos
                        </Text>
                        {ch.hasFilters && (
                            <View
                                style={[
                                    styles.activeFilterDot,
                                    { backgroundColor: theme.primary },
                                ]}
                            />
                        )}
                    </View>

                    {ch.hasFilters && (
                        <TouchableOpacity
                            onPress={ch.clearFilters}
                            activeOpacity={press.subtle}
                            style={styles.resetButton}
                            accessibilityRole="button"
                            accessibilityLabel="Restablecer filtros"
                        >
                            <RotateCcw size={12} color={theme.primary} />
                            <Text
                                style={[
                                    type.caption,
                                    { color: theme.primary, fontFamily: families.semibold },
                                ]}
                            >
                                Restablecer
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Buscador integrado */}
                <SearchBar
                    value={ch.query}
                    onChangeText={ch.setQuery}
                    placeholder="Buscar motivo, medicamento o vacuna..."
                />

                {/* Filtro por tipo de registro con chips temáticos */}
                <View style={styles.filterSection}>
                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        Tipo de registro
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.kindsRow}
                    >
                        {KINDS.map((k) => {
                            const active = ch.kinds.includes(k);
                            const count = ch.counts[k] ?? 0;
                            const Icon =
                                k === 'consulta'
                                    ? ClipboardList
                                    : k === 'vacuna'
                                      ? Syringe
                                      : FlaskConical;
                            const isEmpty = count === 0;

                            return (
                                <TouchableOpacity
                                    key={k}
                                    onPress={() => ch.toggleKind(k)}
                                    activeOpacity={press.subtle}
                                    style={[
                                        styles.kindChip,
                                        active
                                            ? {
                                                  backgroundColor: theme.primaryLight,
                                                  borderColor: theme.primary,
                                              }
                                            : {
                                                  backgroundColor: theme.backgroundSecondary,
                                                  borderColor: theme.borderLight,
                                              },
                                        isEmpty && !active && styles.emptyKindChip,
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${KIND_LABEL[k]}, ${count} registros`}
                                    accessibilityState={{ selected: active }}
                                >
                                    <Icon
                                        size={layout.icon.xs}
                                        color={
                                            active
                                                ? theme.primary
                                                : isEmpty
                                                  ? theme.textMuted + '80'
                                                  : theme.textMuted
                                        }
                                    />
                                    <Text
                                        style={[
                                            type.caption,
                                            {
                                                color: active
                                                    ? theme.primary
                                                    : isEmpty
                                                      ? theme.textMuted
                                                      : theme.text,
                                                fontFamily: active
                                                    ? families.semibold
                                                    : families.medium,
                                            },
                                        ]}
                                    >
                                        {KIND_LABEL[k]}
                                    </Text>
                                    <View
                                        style={[
                                            styles.countBadge,
                                            {
                                                backgroundColor: active
                                                    ? theme.primary
                                                    : theme.surface,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.countText,
                                                {
                                                    color: active
                                                        ? theme.onPrimary
                                                        : theme.textMuted,
                                                },
                                            ]}
                                        >
                                            {count}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Selector de período con SegmentedControl (100% responsive, sin scroll roto) */}
                <View style={styles.filterSection}>
                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        Periodo de tiempo
                    </Text>
                    <SegmentedControl
                        value={ch.period}
                        onChange={ch.setPeriod}
                        options={PERIOD_OPTIONS}
                        accessibilityLabel="Filtro de periodo de tiempo"
                    />
                </View>

                {/* Contador de resultados */}
                <View style={[styles.resultsStatusRow, { borderTopColor: theme.borderLight }]}>
                    <Text style={[type.caption, { color: theme.textMuted }]}>
                        {ch.filtered.length === ch.events.length
                            ? `${ch.events.length} ${ch.events.length === 1 ? 'registro clínico' : 'registros clínicos'} en total`
                            : `Mostrando ${ch.filtered.length} de ${ch.events.length} registros`}
                    </Text>
                    {ch.hasFilters && (
                        <TouchableOpacity onPress={ch.clearFilters} activeOpacity={press.subtle}>
                            <Text style={[type.caption, { color: theme.primary }]}>Limpiar</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
    panel: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1 },
    vital: { gap: spacing.xs },
    vitalHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: spacing.sm },
    filtersCard: {
        borderRadius: radius.xl,
        borderWidth: 1,
        padding: spacing.lg,
        gap: spacing.md,
    },
    filtersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    filtersHeaderTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    activeFilterDot: {
        width: 6,
        height: 6,
        borderRadius: radius.pill,
        marginLeft: 2,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs,
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xxs,
    },
    filterSection: {
        gap: spacing.xs,
    },
    kindsRow: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    kindChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    emptyKindChip: {
        opacity: 0.65,
    },
    countBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: radius.pill,
        minWidth: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        fontSize: 10,
        fontFamily: families.semibold,
    },
    resultsStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing.xs,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    group: { gap: spacing.sm },
});