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
    service_id?: string | null;
    appointment_date: string;
    reason: string;
    is_emergency?: boolean;
    status?: string;
}

// Authenticated
export async function createAppointment(data: AppointmentCreate): Promise<Appointment> {
    return apiFetch<Appointment>("core", "/appointments/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getUserAppointments(): Promise<Appointment[]> {
    return apiFetch<Appointment[]>("core", "/appointments/me");
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return apiFetch<Appointment>("core", `/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function cancelAppointment(id: string): Promise<Appointment> {
    return apiFetch<Appointment>("core", `/appointments/${id}/cancel`, {
        method: "POST",
    });
}

export async function getAppointment(id: string): Promise<Appointment> {
    return apiFetch<Appointment>("core", `/appointments/${id}`);
}
