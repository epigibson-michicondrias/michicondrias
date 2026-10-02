import { apiFetch } from "../lib/api";

export interface Appointment {
    id: string;
    clinic_id: string;
    pet_id: string;
    service_id: string | null;
    appointment_date: string;
    reason: string;
    status: string; // scheduled, confirmed, completed, cancelled
    is_emergency: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
    
    // Enrichment fields
    clinic_name?: string;
    pet_name?: string;
    service_name?: string;
}

export interface AppointmentCreate {
    clinic_id: string;
    pet_id: string;
    /** El backend exige el servicio: de él se calcula la duración y el horario disponible */
    service_id: string;
    /** "YYYY-MM-DD" y "HH:MM" (un horario devuelto por /slots) */
    date: string;
    start_time: string;
    reason: string;
    is_emergency?: boolean;
}

// Authenticated
export async function createAppointment(data: AppointmentCreate): Promise<Appointment> {
    return apiFetch<Appointment>("directorio", "/appointments/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getUserAppointments(): Promise<Appointment[]> {
    return apiFetch<Appointment[]>("directorio", "/appointments/me");
}

export async function cancelAppointment(id: string, cancellationReason?: string): Promise<Appointment> {
    return apiFetch<Appointment>("directorio", `/appointments/${id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ cancellation_reason: cancellationReason ?? null }),
    });
}

export async function getAppointment(id: string): Promise<Appointment> {
    return apiFetch<Appointment>("directorio", `/appointments/${id}`);
}
