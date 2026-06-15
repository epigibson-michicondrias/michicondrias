import { apiFetch } from "../lib/api";

export interface GroomingAppointment {
    id: string;
    groomer_id: string;
    pet_id: string;
    date: string;
    time: string;
    service_type: string;
    status?: string;
    before_photo_url?: string;
    after_photo_url?: string;
    skin_report?: string;
}

export interface GroomingAppointmentCreate {
    groomer_id: string;
    pet_id: string;
    date: string;
    time: string;
    service_type: string;
    status?: string;
}

export interface GroomingAppointmentUpdatePhotos {
    before_photo_url?: string;
    after_photo_url?: string;
    status?: string;
    skin_report?: string;
}

export interface GroomingHistory {
    file?: GroomingFile;
    appointments: GroomingAppointment[];
}

export interface GroomingFile {
    id: string;
    pet_id: string;
    hair_type?: string;
    preferred_shampoo?: string;
    behavior_notes?: string;
    allergies_detected?: string;
    last_service_date?: string;
}

export interface GroomingService {
    id: string;
    groomer_id: string;
    name: string;
    description?: string;
    price: number;
    duration_minutes: number;
    is_active: boolean;
    created_at: string;
}

export interface GroomingServiceCreate {
    name: string;
    description?: string;
    price: number;
    duration_minutes?: number;
}

export async function createAppointment(data: GroomingAppointmentCreate): Promise<GroomingAppointment> {
    return apiFetch<GroomingAppointment>("estilistas", "/appointments", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateAppointmentPhotos(appointmentId: string, data: GroomingAppointmentUpdatePhotos): Promise<GroomingAppointment> {
    return apiFetch<GroomingAppointment>("estilistas", `/appointments/${appointmentId}/photos`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function getGroomingHistory(petId: string): Promise<GroomingHistory> {
    return apiFetch<GroomingHistory>("estilistas", `/files/${petId}`);
}

export async function createGroomingService(data: GroomingServiceCreate): Promise<GroomingService> {
    return apiFetch<GroomingService>("estilistas", "/services", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getActiveServices(): Promise<GroomingService[]> {
    return apiFetch<GroomingService[]>("estilistas", "/services");
}

export async function getClientAppointments(): Promise<GroomingAppointment[]> {
    return apiFetch<GroomingAppointment[]>("estilistas", "/appointments/client");
}

export async function getProviderAppointments(): Promise<GroomingAppointment[]> {
    return apiFetch<GroomingAppointment[]>("estilistas", "/appointments/provider");
}

export async function getAvailableSlots(groomerId: string, targetDate: string): Promise<string[]> {
    const params = new URLSearchParams({ target_date: targetDate });
    return apiFetch<string[]>("estilistas", `/groomers/${groomerId}/available-slots?${params}`);
}
