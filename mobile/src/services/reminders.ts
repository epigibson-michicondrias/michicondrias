import { apiFetch } from "../lib/api";
import { MedicalRecord, getRecordsByPet } from "./carnet";

export interface MedicationReminder {
    id: string;
    prescription_id: string;
    pet_id: string;
    remind_at: string;
    sent: boolean;
}

export interface ReminderWithDetails extends MedicationReminder {
    medication_name: string;
    dosage: string;
    frequency_hours: number;
    duration_days: number;
    instructions: string | null;
}

export async function getRemindersByPet(petId: string): Promise<MedicationReminder[]> {
    return apiFetch<MedicationReminder[]>("carnet", `/reminders/pet/${petId}`);
}

export async function checkReminder(reminderId: string): Promise<MedicationReminder> {
    return apiFetch<MedicationReminder>("carnet", `/reminders/${reminderId}/check`, {
        method: "POST",
    });
}

/** Toma programada de un medicamento recetado. */
export interface TreatmentDose {
    id: string;
    remind_at: string;
    sent: boolean;
    /** ISO datetime cuando el dueño marcó la toma. */
    taken_at?: string | null;
    /** Calculado en el hook (`select`): la dosis ya toca si es pasada o cae dentro de la próxima hora. */
    isDue?: boolean;
    /** Calculado en el hook (`select`): la dosis ya pasó. */
    isOverdue?: boolean;
    /** Calculado en el hook (`select`): la dosis cae en el día de hoy. */
    isToday?: boolean;
}

export type TreatmentStatus = 'por-iniciar' | 'en-curso' | 'terminado';

/** Medicamento recetado con sus tomas programadas y el interruptor de avisos del dueño. */
export interface Treatment {
    prescription_id: string;
    medication_name: string;
    dosage: string;
    frequency_hours: number;
    duration_days: number;
    instructions: string | null;
    reminders_enabled: boolean;
    /** Fecha en que el dueño empieza el tratamiento (ISO). Si es null, se usa la fecha de la consulta. */
    start_date: string | null;
    record_id: string;
    record_date: string;
    status: TreatmentStatus;
    doses: TreatmentDose[];
}

export async function getTreatments(petId: string): Promise<Treatment[]> {
    return apiFetch<Treatment[]>("carnet", `/reminders/pet/${petId}/treatments`);
}

/** Detalle de un solo tratamiento (para la página de ficha). */
export async function getTreatmentDetail(prescriptionId: string): Promise<Treatment & { pet_id: string; diagnosis: string | null; reason_for_visit: string | null }> {
    return apiFetch("carnet", `/reminders/treatments/${prescriptionId}`);
}

export async function setPrescriptionReminders(
    prescriptionId: string,
    enabled: boolean,
): Promise<{ prescription_id: string; reminders_enabled: boolean; doses_created: number }> {
    return apiFetch("carnet", `/reminders/prescriptions/${prescriptionId}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
    });
}

/** El dueño fija cuándo empieza el tratamiento; las tomas se reprograman desde esa fecha. */
export async function setPrescriptionStartDate(
    prescriptionId: string,
    startDate: string,
): Promise<{ prescription_id: string; doses_created: number; start_date: string }> {
    return apiFetch("carnet", `/reminders/prescriptions/${prescriptionId}`, {
        method: "PATCH",
        body: JSON.stringify({ start_date: startDate }),
    });
}

export async function getRemindersWithDetails(petId: string): Promise<ReminderWithDetails[]> {
    const [reminders, records] = await Promise.all([
        getRemindersByPet(petId),
        getRecordsByPet(petId),
    ]);

    const prescriptionMap = new Map<string, MedicalRecord["prescriptions"][0]>();
    for (const record of records) {
        for (const rx of record.prescriptions) {
            prescriptionMap.set(rx.id, rx);
        }
    }

    return reminders.map((reminder) => {
        const rx = prescriptionMap.get(reminder.prescription_id);
        return {
            ...reminder,
            medication_name: rx?.medication_name ?? "Medicamento desconocido",
            dosage: rx?.dosage ?? "",
            frequency_hours: rx?.frequency_hours ?? 0,
            duration_days: rx?.duration_days ?? 0,
            instructions: rx?.instructions ?? null,
        };
    });
}
