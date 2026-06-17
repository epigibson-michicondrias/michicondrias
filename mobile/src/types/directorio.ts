/**
 * @module types/directorio
 * @description Types for the veterinary directory domain — clinics, veterinarians,
 * reviews, service catalogs, schedules, appointments, surgeries, and telemedicine consultations.
 */

// ─── Clinics ────────────────────────────────────────────────────────────────────

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
    average_rating?: number;
    total_reviews?: number;
    services?: string[];
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

// ─── Veterinarians ──────────────────────────────────────────────────────────────

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
    average_rating?: number;
    total_reviews?: number;
}

// ─── Reviews & Ratings ──────────────────────────────────────────────────────────

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

// ─── Services Catalog ───────────────────────────────────────────────────────────

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

// ─── Schedule ───────────────────────────────────────────────────────────────────

export interface ClinicScheduleItem {
    id: string;
    clinic_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    is_active: boolean;
}

// ─── Appointments ───────────────────────────────────────────────────────────────

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

// ─── Surgeries ──────────────────────────────────────────────────────────────────

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

// ─── Telemedicine / Consultations ───────────────────────────────────────────────

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

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Default values for creating a new clinic */
export const CLINIC_CREATE_DEFAULTS: ClinicCreate = {
    name: '',
    address: null,
    city: null,
    state: null,
    phone: null,
    email: null,
    website: null,
    description: null,
    logo_url: null,
    is_24_hours: false,
    has_emergency: false,
};

/** Surgery status options */
export const SURGERY_STATUS_OPTIONS = [
    { label: 'Programada', value: 'scheduled' },
    { label: 'En progreso', value: 'in-progress' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
] as const;

/** Appointment status options */
export const APPOINTMENT_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Confirmada', value: 'confirmed' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
] as const;

/** Days of week for schedule */
export const DAYS_OF_WEEK = [
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 0 },
] as const;
