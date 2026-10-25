/**
 * Línea de tiempo clínica de una mascota: une consultas (con sus recetas), vacunas y resultados de laboratorio
 * en eventos ordenados por fecha, con búsqueda, filtros por tipo y periodo, agrupado por mes y series de signos
 * vitales. Lógica pura: la usan `useClinicalHistory` en la app y en la web (espejo literal).
 */
import type { MedicalRecord, Vaccine } from '../../types/carnet';
import { formatDate } from '../../utils/formatters';

export type TimelineKind = 'consulta' | 'vacuna' | 'laboratorio';
export type TimelinePeriod = 'todo' | '12m' | '6m' | '30d';

/** Resultado de laboratorio tal como lo devuelve `getPetLabHistory` (sin tipo en el servicio). */
export interface LabHistoryItem {
    id?: string;
    parameter_name: string;
    measured_value: string | number;
    unit?: string | null;
    reference_range?: string | null;
    is_anomaly?: boolean;
    created_at?: string;
}

export interface TimelineEvent {
    id: string;
    kind: TimelineKind;
    date: string;
    title: string;
    subtitle: string | null;
    /** Líneas de detalle (diagnóstico, tratamiento, recetas, signos…). */
    details: string[];
    /** `warn`: refuerzo vencido o resultado fuera de rango. */
    flag: 'warn' | null;
    record?: MedicalRecord;
    vaccine?: Vaccine;
    lab?: LabHistoryItem;
    /** Texto en minúsculas y sin acentos para la búsqueda. */
    haystack: string;
}

export interface TimelineGroup {
    key: string;
    label: string;
    events: TimelineEvent[];
}

export const KIND_LABEL: Record<TimelineKind, string> = {
    consulta: 'Consultas',
    vacuna: 'Vacunas',
    laboratorio: 'Laboratorio',
};

export const PERIOD_LABEL: Record<TimelinePeriod, string> = {
    todo: 'Todo',
    '12m': 'Último año',
    '6m': 'Últimos 6 meses',
    '30d': 'Últimos 30 días',
};

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Minúsculas y sin acentos: «Vómito» y «vomito» coinciden. */
export function normalize(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const todayIso = () => new Date().toISOString().slice(0, 10);

function recordEvent(r: MedicalRecord): TimelineEvent {
    const vitals = [r.weight_kg ? `${r.weight_kg} kg` : null, r.temperature_c ? `${r.temperature_c} °C` : null].filter(Boolean).join(' · ');
    const meds = r.prescriptions.map((p) => `${p.medication_name} ${p.dosage} cada ${p.frequency_hours} h por ${p.duration_days} días`);
    const details = [
        r.diagnosis ? `Diagnóstico: ${r.diagnosis}` : null,
        r.treatment ? `Tratamiento: ${r.treatment}` : null,
        ...meds.map((m) => `Receta: ${m}`),
        vitals ? `Signos: ${vitals}` : null,
        r.notes ? `Notas: ${r.notes}` : null,
    ].filter((d): d is string => !!d);
    return {
        id: `c-${r.id}`,
        kind: 'consulta',
        date: r.date,
        title: r.reason_for_visit,
        subtitle: r.diagnosis,
        details,
        flag: null,
        record: r,
        haystack: normalize([r.reason_for_visit, r.diagnosis, r.treatment, r.notes, ...r.prescriptions.map((p) => p.medication_name)].filter(Boolean).join(' ')),
    };
}

function vaccineEvent(v: Vaccine): TimelineEvent {
    const overdue = !!v.next_due_date && v.next_due_date.slice(0, 10) < todayIso();
    return {
        id: `v-${v.id}`,
        kind: 'vacuna',
        date: v.date_administered,
        title: v.name,
        subtitle: v.next_due_date ? `${overdue ? 'Refuerzo vencido' : 'Próximo refuerzo'}: ${formatDate(v.next_due_date)}` : null,
        details: [v.batch_number ? `Lote: ${v.batch_number}` : null, v.notes].filter((d): d is string => !!d),
        flag: overdue ? 'warn' : null,
        vaccine: v,
        haystack: normalize([v.name, v.notes].filter(Boolean).join(' ')),
    };
}

function labEvent(l: LabHistoryItem, i: number): TimelineEvent {
    return {
        id: `l-${l.id ?? i}`,
        kind: 'laboratorio',
        date: l.created_at ?? '',
        title: `${l.parameter_name}: ${l.measured_value} ${l.unit ?? ''}`.trim(),
        subtitle: l.reference_range ? `Rango normal: ${l.reference_range} ${l.unit ?? ''}`.trim() : null,
        details: [],
        flag: l.is_anomaly ? 'warn' : null,
        lab: l,
        haystack: normalize(l.parameter_name),
    };
}

/** Todos los eventos, del más reciente al más antiguo. */
export function buildTimeline(records: MedicalRecord[], vaccines: Vaccine[], labs: LabHistoryItem[]): TimelineEvent[] {
    return [...records.map(recordEvent), ...vaccines.map(vaccineEvent), ...labs.map(labEvent)]
        .filter((e) => !!e.date)
        .sort((a, b) => b.date.localeCompare(a.date));
}

function periodStart(period: TimelinePeriod): string | null {
    if (period === 'todo') return null;
    const d = new Date();
    if (period === '30d') d.setDate(d.getDate() - 30);
    else d.setMonth(d.getMonth() - (period === '6m' ? 6 : 12));
    return d.toISOString().slice(0, 10);
}

export interface TimelineFilters {
    kinds: TimelineKind[];
    query: string;
    period: TimelinePeriod;
}

export function filterTimeline(events: TimelineEvent[], { kinds, query, period }: TimelineFilters): TimelineEvent[] {
    const from = periodStart(period);
    const q = normalize(query.trim());
    return events.filter((e) =>
        (kinds.length === 0 || kinds.includes(e.kind))
        && (!from || e.date.slice(0, 10) >= from)
        && (!q || e.haystack.includes(q)),
    );
}

/** Cuántos eventos hay de cada tipo (con búsqueda y periodo aplicados, sin el filtro de tipo). */
export function countByKind(events: TimelineEvent[], filters: Omit<TimelineFilters, 'kinds'>): Record<TimelineKind, number> {
    const base = filterTimeline(events, { ...filters, kinds: [] });
    return {
        consulta: base.filter((e) => e.kind === 'consulta').length,
        vacuna: base.filter((e) => e.kind === 'vacuna').length,
        laboratorio: base.filter((e) => e.kind === 'laboratorio').length,
    };
}

export function groupByMonth(events: TimelineEvent[]): TimelineGroup[] {
    const groups: TimelineGroup[] = [];
    for (const e of events) {
        const key = e.date.slice(0, 7);
        let g = groups[groups.length - 1];
        if (!g || g.key !== key) {
            const [y, m] = key.split('-').map(Number);
            g = { key, label: `${MONTHS[m - 1]} ${y}`, events: [] };
            groups.push(g);
        }
        g.events.push(e);
    }
    return groups;
}

export interface VitalPoint {
    date: string;
    value: number;
    reason: string;
}

/** Peso y temperatura registrados en las consultas, del más antiguo al más reciente. */
export function vitalSeries(records: MedicalRecord[]): { weight: VitalPoint[]; temperature: VitalPoint[] } {
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    return {
        weight: sorted.filter((r) => r.weight_kg).map((r) => ({ date: r.date, value: r.weight_kg!, reason: r.reason_for_visit })),
        temperature: sorted.filter((r) => r.temperature_c).map((r) => ({ date: r.date, value: r.temperature_c!, reason: r.reason_for_visit })),
    };
}
