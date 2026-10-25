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
}

/** Medicamento recetado con sus tomas programadas y el interruptor de avisos del dueño. */
export interface Treatment {
    prescription_id: string;
    medication_name: string;
    dosage: string;
    frequency_hours: number;
    duration_days: number;
    instructions: string | null;
    reminders_enabled: boolean;
    record_id: string;
    record_date: string;
    doses: TreatmentDose[];
}

export async function getTreatments(petId: string): Promise<Treatment[]> {
    return apiFetch<Treatment[]>("carnet", `/reminders/pet/${petId}/treatments`);
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
