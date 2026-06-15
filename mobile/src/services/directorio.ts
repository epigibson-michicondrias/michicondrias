import { apiFetch } from "../lib/api";

export interface Clinic {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    description: string | null;
    logo_url: string | null;
    is_24_hours: boolean;
    has_emergency: boolean;
    owner_user_id: string | null;
    is_approved?: boolean;
}

export interface ClinicCreate {
    name: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    description?: string | null;
    logo_url?: string | null;
    is_24_hours?: boolean;
    has_emergency?: boolean;
}

export interface Vet {
    id: string;
    first_name: string;
    last_name: string;
    specialty: string | null;
    license_number: string | null;
    phone: string | null;
    email: string | null;
    bio: string | null;
    photo_url: string | null;
    clinic_id: string | null;
    user_id: string | null;
}

export interface ClinicReview {
    id: string;
    clinic_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    created_at: string | null;
}

export interface ClinicRating {
    average_rating: number;
    total_reviews: number;
}

// --- Clinics ---

export async function getClinics(): Promise<Clinic[]> {
    return apiFetch<Clinic[]>("directorio", "/clinics/");
}

export async function getClinic(id: string): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", `/clinics/${id}`);
}

export async function getMyClinics(): Promise<Clinic[]> {
    return apiFetch<Clinic[]>("directorio", "/clinics/me");
}

export async function createClinic(clinic: ClinicCreate): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", "/clinics/", {
        method: "POST",
        body: JSON.stringify(clinic),
    });
}

export async function updateClinic(id: string, clinic: Partial<ClinicCreate>): Promise<Clinic> {
    return apiFetch<Clinic>("directorio", `/clinics/${id}`, {
        method: "PUT",
        body: JSON.stringify(clinic),
    });
}

export async function deleteClinic(id: string): Promise<void> {
    return apiFetch<void>("directorio", `/clinics/${id}`, {
        method: "DELETE",
    });
}

// --- Veterinarians ---

export async function getVets(clinicId?: string): Promise<Vet[]> {
    const qs = clinicId ? `?clinic_id=${clinicId}` : "";
    return apiFetch<Vet[]>("directorio", `/veterinarians/${qs}`);
}

export async function createVet(vet: Omit<Vet, "id" | "user_id">): Promise<Vet> {
    return apiFetch<Vet>("directorio", "/veterinarians/", {
        method: "POST",
        body: JSON.stringify(vet),
    });
}

export async function updateVet(id: string, vet: Partial<Vet>): Promise<Vet> {
    return apiFetch<Vet>("directorio", `/veterinarians/${id}`, {
        method: "PUT",
        body: JSON.stringify(vet),
    });
}

// --- Reviews ---

export async function getClinicReviews(clinicId: string): Promise<ClinicReview[]> {
    return apiFetch<ClinicReview[]>("directorio", `/reviews/clinics/${clinicId}/reviews`);
}

export async function createClinicReview(clinicId: string, rating: number, comment?: string): Promise<ClinicReview> {
    return apiFetch<ClinicReview>("directorio", `/reviews/clinics/${clinicId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment || null }),
    });
}

export async function getClinicRating(clinicId: string): Promise<ClinicRating> {
    return apiFetch<ClinicRating>("directorio", `/reviews/clinics/${clinicId}/rating`);
}

// --- Services Catalog ---

export interface ClinicServiceItem {
    id: string;
    clinic_id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration_minutes: number;
    category: string | null;
    is_active: boolean;
}

export const MOCK_SERVICES: ClinicServiceItem[] = [
    { id: "S-1", clinic_id: "C-1", name: "Consulta General", description: "Revisión médica general", price: 500, duration_minutes: 30, category: "Consultas", is_active: true },
    { id: "S-2", clinic_id: "C-1", name: "Vacunación", description: "Aplicación de vacunas del esquema", price: 350, duration_minutes: 15, category: "Preventiva", is_active: true },
    { id: "S-3", clinic_id: "C-1", name: "Odontología", description: "Limpieza dental profunda", price: 1200, duration_minutes: 60, category: "Especialidad", is_active: true }
];

export async function getAllServices(): Promise<ClinicServiceItem[]> {
    return apiFetch<ClinicServiceItem[]>("directorio", "/catalog/admin/all");
}

export async function getClinicServices(clinicId: string): Promise<ClinicServiceItem[]> {
    return apiFetch<ClinicServiceItem[]>("directorio", `/catalog/clinics/${clinicId}/services`);
}

export async function createClinicService(clinicId: string, data: { name: string; description?: string; price?: number; duration_minutes?: number; category?: string }): Promise<ClinicServiceItem> {
    return apiFetch<ClinicServiceItem>("directorio", `/catalog/clinics/${clinicId}/services`, { method: "POST", body: JSON.stringify(data) });
}

export async function updateClinicService(serviceId: string, data: Partial<ClinicServiceItem>): Promise<ClinicServiceItem> {
    return apiFetch<ClinicServiceItem>("directorio", `/catalog/services/${serviceId}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteClinicService(serviceId: string): Promise<void> {
    return apiFetch<void>("directorio", `/catalog/services/${serviceId}`, { method: "DELETE" });
}

// --- Schedule ---

export interface ClinicScheduleItem {
    id: string;
    clinic_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    is_active: boolean;
}

export async function getClinicSchedule(clinicId: string): Promise<ClinicScheduleItem[]> {
    return apiFetch<ClinicScheduleItem[]>("directorio", `/schedule/clinics/${clinicId}/schedule`);
}

export async function setClinicSchedule(clinicId: string, schedules: { day_of_week: number; start_time: string; end_time: string; slot_duration_minutes?: number }[]): Promise<ClinicScheduleItem[]> {
    return apiFetch<ClinicScheduleItem[]>("directorio", `/schedule/clinics/${clinicId}/schedule`, { method: "POST", body: JSON.stringify(schedules) });
}

// --- Appointments ---

export interface AvailableSlot {
    start_time: string;
    end_time: string;
}

export interface AppointmentItem {
    id: string;
    clinic_id: string;
    service_id: string;
    pet_id: string;
    user_id: string;
    vet_id: string | null;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string | null;
    cancellation_reason?: string | null;
    created_at: string | null;
    service_name: string | null;
    clinic_name: string | null;
}

export async function getAvailableSlots(clinicId: string, date: string, serviceId: string): Promise<AvailableSlot[]> {
    return apiFetch<AvailableSlot[]>("directorio", `/appointments/clinics/${clinicId}/slots?date=${date}&service_id=${serviceId}`);
}

export async function createAppointment(data: { clinic_id: string; service_id: string; pet_id: string; date: string; start_time: string; notes?: string }): Promise<AppointmentItem> {
    return apiFetch<AppointmentItem>("directorio", "/appointments/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMyAppointments(): Promise<AppointmentItem[]> {
    return apiFetch<AppointmentItem[]>("directorio", "/appointments/me");
}

export async function getClinicAppointments(clinicId: string, status?: string): Promise<AppointmentItem[]> {
    const query = status ? `?status=${status}` : "";
    return apiFetch<AppointmentItem[]>("directorio", `/appointments/clinic/${clinicId}${query}`);
}

export async function confirmAppointment(id: string): Promise<AppointmentItem> {
    return apiFetch<AppointmentItem>("directorio", `/appointments/${id}/confirm`, { method: "PUT" });
}

export async function completeAppointment(id: string): Promise<AppointmentItem> {
    return apiFetch<AppointmentItem>("directorio", `/appointments/${id}/complete`, { method: "PUT" });
}

export async function cancelAppointment(id: string, reason?: string): Promise<AppointmentItem> {
    const query = reason ? `?reason=${reason}` : "";
    return apiFetch<AppointmentItem>("directorio", `/appointments/${id}/cancel${query}`, { method: "PUT" });
}

export async function rescheduleAppointment(id: string, date: string, startTime: string): Promise<AppointmentItem> {
    return apiFetch<AppointmentItem>("directorio", `/appointments/${id}/reschedule`, { method: "PUT", body: JSON.stringify({ date, start_time: startTime }) });
}

// --- Surgeries ---

export interface SurgeryItem {
    id?: string;
    clinic_id: string;
    patient_id: string;
    surgeon_id?: string;
    surgery_name: string;
    surgery_type: string;
    scheduled_date: string; // ISO DateTime
    estimated_duration_minutes?: number;
    status: string; // "scheduled", "in-progress", "completed", "cancelled"
    operating_room?: string;
    notes?: string;
    created_at?: string;
}

export interface SurgeryCreate {
    clinic_id: string;
    patient_id: string;
    surgeon_id?: string;
    surgery_name: string;
    surgery_type: string;
    scheduled_date: string;
    estimated_duration_minutes?: number;
    operating_room?: string;
    notes?: string;
}

export async function getClinicSurgeries(clinicId: string): Promise<SurgeryItem[]> {
    return apiFetch<SurgeryItem[]>("directorio", `/clinics/${clinicId}/surgeries`);
}

export async function createSurgery(data: SurgeryCreate): Promise<SurgeryItem> {
    return apiFetch<SurgeryItem>("directorio", `/clinics/${data.clinic_id}/surgeries`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}



// --- Hospital specific API calls ---

export async function getHospitalClinics(): Promise<Clinic[]> {
    return apiFetch<Clinic[]>("directorio", "/clinics/hospitals/clinics");
}

export async function getHospitalVeterinarians(): Promise<Vet[]> {
    return apiFetch<Vet[]>("directorio", "/clinics/hospitals/veterinarians");
}

export async function associateVeterinarian(clinicId: string, vetId: string): Promise<Vet> {
    return apiFetch<Vet>("directorio", `/clinics/${clinicId}/veterinarians/${vetId}`, {
        method: "POST",
    });
}

export async function dissociateVeterinarian(clinicId: string, vetId: string): Promise<{message: string}> {
    return apiFetch<{message: string}>("directorio", `/clinics/${clinicId}/veterinarians/${vetId}`, {
        method: "DELETE",
    });
}


// --- Telemedicine / Consultations ---

export interface ConsultationItem {
    id: string;
    clinic_id?: string;
    vet_id?: string;
    pet_id?: string;
    scheduled_at: string;
    status: string;
    room_url?: string;
    notes?: string;
    created_at: string;
}

export interface ConsultationCreate {
    clinic_id?: string;
    vet_id?: string;
    pet_id?: string;
    scheduled_at: string;
    notes?: string;
}

export async function bookConsultation(data: ConsultationCreate): Promise<ConsultationItem> {
    return apiFetch<ConsultationItem>("directorio", "/consultations/", {
        method: "POST",
        body: JSON.stringify(data)
    });
}

export async function getMyConsultations(): Promise<ConsultationItem[]> {
    return apiFetch<ConsultationItem[]>("directorio", "/consultations/me");
}

export async function getVetConsultations(): Promise<ConsultationItem[]> {
    return apiFetch<ConsultationItem[]>("directorio", "/consultations/vet/incoming");
}

export async function updateConsultationStatus(id: string, status: string): Promise<ConsultationItem> {
    return apiFetch<ConsultationItem>("directorio", `/consultations/${id}/status?status=${status}`, {
        method: "PATCH"
    });
}


