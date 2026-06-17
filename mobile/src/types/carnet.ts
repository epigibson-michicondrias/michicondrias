/**
 * @module types/carnet
 * @description Types for the medical records domain — prescriptions,
 * medical records, and vaccination history.
 */

// ─── Prescriptions ──────────────────────────────────────────────────────────────

export interface Prescription {
    id: string;
    medical_record_id: string;
    medication_name: string;
    dosage: string;
    frequency_hours: number;
    duration_days: number;
    instructions: string | null;
}

// ─── Medical Records ────────────────────────────────────────────────────────────

export interface MedicalRecordCreate {
    pet_id: string;
    reason_for_visit: string;
    diagnosis?: string;
    treatment?: string;
    weight_kg?: number;
    temperature_c?: number;
    notes?: string;
    appointment_id?: string;
    prescriptions: {
        medication_name: string;
        dosage: string;
        frequency_hours: number;
        duration_days: number;
        instructions?: string;
    }[];
}

export interface MedicalRecord {
    id: string;
    pet_id: string;
    veterinarian_id: string | null;
    clinic_id: string | null;
    appointment_id: string | null;
    date: string;
    reason_for_visit: string;
    diagnosis: string | null;
    treatment: string | null;
    weight_kg: number | null;
    temperature_c: number | null;
    notes: string | null;
    prescriptions: Prescription[];
}

// ─── Vaccines ───────────────────────────────────────────────────────────────────

export interface Vaccine {
    id: string;
    pet_id: string;
    name: string;
    date_administered: string;
    next_due_date: string | null;
    administered_by_vet_id: string | null;
    batch_number: string | null;
    notes: string | null;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Default values for creating a new medical record */
export const MEDICAL_RECORD_CREATE_DEFAULTS: MedicalRecordCreate = {
    pet_id: '',
    reason_for_visit: '',
    diagnosis: '',
    treatment: '',
    weight_kg: undefined,
    temperature_c: undefined,
    notes: '',
    prescriptions: [],
};
