/**
 * Plan de cada medicamento de una receta: fechas de inicio y fin, número de tomas y avance del tratamiento.
 * Lógica pura, espejo literal entre la app y la web.
 */
import type { MedicalRecord, Prescription } from '../../types/carnet';

export type TreatmentStatus = 'en-curso' | 'terminado' | 'por-iniciar';

export interface MedicationPlan {
    med: Prescription;
    start: Date;
    end: Date;
    totalDoses: number;
    dosesPerDay: number;
    /** 0 a 1 según los días transcurridos. */
    progress: number;
    daysLeft: number;
    status: TreatmentStatus;
}

const DAY = 24 * 60 * 60 * 1000;

/** Folio corto y legible de la receta (los primeros 8 caracteres del id de la consulta). */
export const prescriptionFolio = (recordId: string) => `RX-${recordId.slice(0, 8).toUpperCase()}`;

export function medicationPlan(recordDate: string, med: Prescription, now = new Date()): MedicationPlan {
    const start = new Date(recordDate);
    const end = new Date(start.getTime() + med.duration_days * DAY);
    const freq = med.frequency_hours > 0 ? med.frequency_hours : 24;
    // Mismo cálculo que el backend al programar los recordatorios (carnet `create_medical_record`):
    // una toma al recetar y luego cada `frequency_hours`, mientras caiga dentro de los días indicados
    const totalDoses = Math.min(Math.floor((med.duration_days * 24) / freq), 400);
    const dosesPerDay = 24 / freq;
    const elapsed = now.getTime() - start.getTime();
    const total = end.getTime() - start.getTime() || 1;
    const progress = Math.min(1, Math.max(0, elapsed / total));
    const status: TreatmentStatus = elapsed < 0 ? 'por-iniciar' : progress >= 1 ? 'terminado' : 'en-curso';
    return {
        med,
        start,
        end,
        dosesPerDay,
        totalDoses,
        progress,
        daysLeft: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY)),
        status,
    };
}

export function prescriptionPlans(record: MedicalRecord, now = new Date()): MedicationPlan[] {
    return (record.prescriptions ?? []).map((m) => medicationPlan(record.date, m, now));
}

export const STATUS_LABEL: Record<TreatmentStatus, string> = {
    'en-curso': 'En curso',
    terminado: 'Terminado',
    'por-iniciar': 'Por iniciar',
};

/** Estado de la receta completa: en curso si algún medicamento sigue activo. */
export function prescriptionStatus(plans: MedicationPlan[]): TreatmentStatus {
    if (plans.some((p) => p.status === 'en-curso')) return 'en-curso';
    if (plans.every((p) => p.status === 'por-iniciar')) return 'por-iniciar';
    return 'terminado';
}

/** «Cada 8 h (3 al día)»; el «al día» solo cuando es un número entero mayor a 1. */
export const frequencyLabel = (p: MedicationPlan) =>
    `Cada ${p.med.frequency_hours} h${p.dosesPerDay > 1 && Number.isInteger(p.dosesPerDay) ? ` (${p.dosesPerDay} al día)` : ''}`;
