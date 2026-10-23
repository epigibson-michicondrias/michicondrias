import { apiFetch } from "../lib/api";
import type { MedicalRecordUpdate, VaccineCreate, VaccineUpdate } from "../types/carnet";

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

export async function getRecord(recordId: string): Promise<MedicalRecord> {
    return apiFetch<MedicalRecord>("carnet", `/records/${recordId}`);
}

export async function updateRecord(recordId: string, data: MedicalRecordUpdate): Promise<MedicalRecord> {
    return apiFetch<MedicalRecord>("carnet", `/records/${recordId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteRecord(recordId: string): Promise<void> {
    await apiFetch("carnet", `/records/${recordId}`, { method: "DELETE" });
}

export async function getVaccinesByPet(petId: string): Promise<Vaccine[]> {
    return apiFetch<Vaccine[]>("carnet", `/vaccines/pet/${petId}`);
}

export async function createVaccine(vaccine: VaccineCreate): Promise<Vaccine> {
    return apiFetch<Vaccine>("carnet", "/vaccines/", {
        method: "POST",
        body: JSON.stringify(vaccine),
    });
}

export async function getVaccine(vaccineId: string): Promise<Vaccine> {
    return apiFetch<Vaccine>("carnet", `/vaccines/${vaccineId}`);
}

export async function updateVaccine(vaccineId: string, data: VaccineUpdate): Promise<Vaccine> {
    return apiFetch<Vaccine>("carnet", `/vaccines/${vaccineId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteVaccine(vaccineId: string): Promise<void> {
    await apiFetch("carnet", `/vaccines/${vaccineId}`, { method: "DELETE" });
}
