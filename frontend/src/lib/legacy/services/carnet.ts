import { apiFetch } from "../api";

export interface Prescription {
    id: string;
    medical_record_id: string;
    medication_name: string;
    dosage: string;
    frequency_hours: number;
    duration_days: number;
    instructions: string | null;
}

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

export async function getRecordsByPet(petId: string): Promise<MedicalRecord[]> {
    return apiFetch<MedicalRecord[]>("carnet", `/records/pet/${petId}`);
}

export async function createRecord(record: MedicalRecordCreate): Promise<MedicalRecord> {
    return apiFetch<MedicalRecord>("carnet", "/records/", {
        method: "POST",
        body: JSON.stringify(record),
    });
}

export async function getVaccinesByPet(petId: string): Promise<Vaccine[]> {
    return apiFetch<Vaccine[]>("carnet", `/vaccines/pet/${petId}`);
}

export async function createVaccine(vaccine: Omit<Vaccine, "id" | "date_administered">): Promise<Vaccine> {
    return apiFetch<Vaccine>("carnet", "/vaccines/", {
        method: "POST",
        body: JSON.stringify(vaccine),
    });
}
