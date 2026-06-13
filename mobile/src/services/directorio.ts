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

// --- MOCKS ---
export const MOCK_CLINICS: Clinic[] = [
    {
        id: "C-1", name: "Hospital Veterinario Michicondrias", address: "Av. Central 123", city: "CDMX", state: "CDMX", phone: "555-1234", email: "contacto@michicondrias.com", website: "michicondrias.com", description: "Clínica 24/7", logo_url: null, is_24_hours: true, has_emergency: true, owner_user_id: "U-1", is_approved: true
    }
];

export async function getClinics(): Promise<Clinic[]> {
    return Promise.resolve(MOCK_CLINICS);
}

export async function getClinic(id: string): Promise<Clinic> {
    return Promise.resolve(MOCK_CLINICS[0]);
}

export async function getMyClinics(): Promise<Clinic[]> {
    return Promise.resolve(MOCK_CLINICS);
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

export const MOCK_VETS: Vet[] = [
    { id: "V-1", first_name: "Ana", last_name: "López", specialty: "Cirugía", license_number: "MED-123", phone: "555-0001", email: "ana@vet.com", bio: "Experta en ortopedia", photo_url: null, clinic_id: "C-1", user_id: "U-10" },
    { id: "V-2", first_name: "Carlos", last_name: "Ruiz", specialty: "Medicina Interna", license_number: "MED-456", phone: "555-0002", email: "carlos@vet.com", bio: null, photo_url: null, clinic_id: "C-1", user_id: "U-11" }
];

export async function getVets(clinicId?: string): Promise<Vet[]> {
    return Promise.resolve(MOCK_VETS);
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

export async function getClinicServices(clinicId: string): Promise<ClinicServiceItem[]> {
    return Promise.resolve(MOCK_SERVICES);
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

export const MOCK_SCHEDULE: ClinicScheduleItem[] = [
    { id: "SCH-1", clinic_id: "C-1", day_of_week: 1, start_time: "08:00", end_time: "20:00", slot_duration_minutes: 30, is_active: true },
    { id: "SCH-2", clinic_id: "C-1", day_of_week: 2, start_time: "08:00", end_time: "20:00", slot_duration_minutes: 30, is_active: true },
    { id: "SCH-3", clinic_id: "C-1", day_of_week: 3, start_time: "08:00", end_time: "20:00", slot_duration_minutes: 30, is_active: true },
    { id: "SCH-4", clinic_id: "C-1", day_of_week: 4, start_time: "08:00", end_time: "20:00", slot_duration_minutes: 30, is_active: true },
    { id: "SCH-5", clinic_id: "C-1", day_of_week: 5, start_time: "08:00", end_time: "20:00", slot_duration_minutes: 30, is_active: true },
    { id: "SCH-6", clinic_id: "C-1", day_of_week: 6, start_time: "09:00", end_time: "15:00", slot_duration_minutes: 30, is_active: true }
];

export async function getClinicSchedule(clinicId: string): Promise<ClinicScheduleItem[]> {
    return Promise.resolve(MOCK_SCHEDULE);
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

export const MOCK_APPOINTMENTS: AppointmentItem[] = [
    { id: "A-1", clinic_id: "C-1", service_id: "S-1", pet_id: "P-12345", user_id: "U-2", vet_id: "V-1", date: "2024-05-02", start_time: "10:00", end_time: "10:30", status: "confirmed", notes: "Consulta general", service_name: "Consulta General", clinic_name: "Michicondrias", created_at: "2024-05-01T08:00:00Z" },
    { id: "A-2", clinic_id: "C-1", service_id: "S-2", pet_id: "P-67890", user_id: "U-3", vet_id: "V-2", date: "2024-05-02", start_time: "11:00", end_time: "12:00", status: "pending", notes: "Vacunación múltiple", service_name: "Vacunación", clinic_name: "Michicondrias", created_at: "2024-05-01T09:00:00Z" },
    { id: "A-3", clinic_id: "C-1", service_id: "S-3", pet_id: "P-11111", user_id: "U-4", vet_id: "V-1", date: "2024-05-01", start_time: "09:00", end_time: "09:30", status: "completed", notes: "Revisión dental", service_name: "Odontología", clinic_name: "Michicondrias", created_at: "2024-04-28T10:00:00Z" }
];

export async function getAvailableSlots(clinicId: string, date: string, serviceId: string): Promise<AvailableSlot[]> {
    return Promise.resolve([{ start_time: "10:00", end_time: "10:30" }, { start_time: "11:00", end_time: "11:30" }]);
}

export async function createAppointment(data: { clinic_id: string; service_id: string; pet_id: string; date: string; start_time: string; notes?: string }): Promise<AppointmentItem> {
    return Promise.resolve({ ...MOCK_APPOINTMENTS[0], id: `A-${Date.now()}`, ...data });
}

export async function getMyAppointments(): Promise<AppointmentItem[]> {
    return Promise.resolve(MOCK_APPOINTMENTS);
}

export async function getClinicAppointments(clinicId: string, status?: string): Promise<AppointmentItem[]> {
    if (status) return Promise.resolve(MOCK_APPOINTMENTS.filter(a => a.status === status));
    return Promise.resolve(MOCK_APPOINTMENTS);
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
    estimated_duration_minutes: number;
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

export const MOCK_SURGERIES: SurgeryItem[] = [
    { id: "Surg-1", clinic_id: "C-1", patient_id: "P-12345", surgeon_id: "V-1", surgery_name: "Ovariohisterectomía", surgery_type: "elective", scheduled_date: "2024-05-02T08:00:00Z", estimated_duration_minutes: 90, status: "completed", operating_room: "Quirófano 1", notes: "Sin complicaciones", created_at: "2024-04-25T10:00:00Z" },
    { id: "Surg-2", clinic_id: "C-1", patient_id: "P-67890", surgeon_id: "V-2", surgery_name: "Extracción cuerpo extraño", surgery_type: "emergency", scheduled_date: new Date().toISOString(), estimated_duration_minutes: 120, status: "in-progress", operating_room: "Quirófano 2", notes: "Paciente inestable", created_at: "2024-05-02T10:00:00Z" },
    { id: "Surg-3", clinic_id: "C-1", patient_id: "P-11111", surgeon_id: "V-1", surgery_name: "Profilaxis Dental", surgery_type: "preventive", scheduled_date: "2024-05-05T10:00:00Z", estimated_duration_minutes: 60, status: "scheduled", operating_room: "Dental 1", notes: "Revisar canino superior", created_at: "2024-05-01T10:00:00Z" }
];

export async function getClinicSurgeries(clinicId: string): Promise<SurgeryItem[]> {
    return Promise.resolve(MOCK_SURGERIES);
}

export async function createSurgery(data: SurgeryCreate): Promise<SurgeryItem> {
    const newSurg: SurgeryItem = { ...data, id: `Surg-${Date.now()}`, status: 'scheduled', estimated_duration_minutes: data.estimated_duration_minutes || 60 };
    return Promise.resolve(newSurg);
}
