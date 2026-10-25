/**
 * useClinicalHistory — pestaña Historial de la ficha: línea de tiempo clínica con búsqueda y filtros, series de
 * peso y temperatura, y el resumen del historial (Michi-IA o automático) para compartir o llevar a otro veterinario.
 * Espejo literal entre la app y la web (imports relativos).
 */
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getHistorySummary } from '../../services/mascotas';
import type { HistorySummary } from '../../types/mascotas';
import type { usePetHealth } from './usePetHealth';
import {
    buildTimeline, countByKind, filterTimeline, groupByMonth, vitalSeries,
    type LabHistoryItem, type TimelineKind, type TimelinePeriod,
} from './clinicalTimeline';

type Health = ReturnType<typeof usePetHealth>;

export function useClinicalHistory(petId: string | undefined, health: Health) {
    const events = useMemo(
        () => buildTimeline(health.records, health.vaccines, health.labResults as LabHistoryItem[]),
        [health.records, health.vaccines, health.labResults],
    );

    const [kinds, setKinds] = useState<TimelineKind[]>([]);
    const [query, setQuery] = useState('');
    const [period, setPeriod] = useState<TimelinePeriod>('todo');

    const filtered = useMemo(() => filterTimeline(events, { kinds, query, period }), [events, kinds, query, period]);
    const groups = useMemo(() => groupByMonth(filtered), [filtered]);
    const counts = useMemo(() => countByKind(events, { query, period }), [events, query, period]);
    const vitals = useMemo(() => vitalSeries(health.records), [health.records]);

    /** Tocar un tipo lo activa o lo quita; sin ninguno activo se ven todos. */
    const toggleKind = (kind: TimelineKind) =>
        setKinds((prev) => (prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]));

    const clearFilters = () => {
        setKinds([]);
        setQuery('');
        setPeriod('todo');
    };

    const summaryMutation = useMutation({ mutationFn: () => getHistorySummary(petId!) });

    return {
        events,
        filtered,
        groups,
        counts,
        vitals,
        kinds,
        toggleKind,
        query,
        setQuery,
        period,
        setPeriod,
        hasFilters: kinds.length > 0 || !!query.trim() || period !== 'todo',
        clearFilters,
        isLoading: health.loadingRecords || health.loadingVaccines || health.loadingLabs,
        summary: summaryMutation.data,
        generateSummary: () => summaryMutation.mutate(),
        isSummarizing: summaryMutation.isPending,
        summaryError: summaryMutation.isError,
    };
}

/** Texto plano del resumen para compartir o copiar. */
export function historyReportText(petName: string, summary: HistorySummary): string {
    return [
        `Resumen clínico de ${petName}`,
        '',
        summary.summary,
        ...(summary.highlights.length ? ['', ...summary.highlights.map((h) => `• ${h}`)] : []),
        '',
        `${summary.analysis_source} · Michicondrias`,
        summary.disclaimer,
    ].join('\n');
}
