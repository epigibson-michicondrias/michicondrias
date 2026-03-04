import { apiFetch } from "../api";

export interface Prescription {
    id?: string;
    medical_record_id?: string;
    medication_name: string;
    dosage: string;
    frequency_hours: number;
    duration_days: number;
    instructions?: string;
    created_at?: string;
}

export interface MedicalRecord {
    id?: string;
    appointment_id: string;
    pet_id: string;
    clinic_id: string;
    vet_id?: string;
    diagnosis: string;
    weight_kg?: number | null;
    temperature_c?: number | null;
    clinical_notes?: string;
    prescriptions: Prescription[];
    created_at?: string;
}

export interface MedicalRecordCreate {
    pet_id: string;
    diagnosis: string;
    weight_kg?: number;
    temperature_c?: number;
    clinical_notes?: string;
    prescriptions: Prescription[];
}

export async function createMedicalRecord(appointmentId: string, data: MedicalRecordCreate): Promise<MedicalRecord> {
    return apiFetch<MedicalRecord>("directorio", `/medical-records/${appointmentId}`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getMedicalRecordByAppointment(appointmentId: string): Promise<MedicalRecord> {
    return apiFetch<MedicalRecord>("directorio", `/medical-records/appointment/${appointmentId}`);
}

export async function getMedicalHistoryByPet(petId: string): Promise<MedicalRecord[]> {
    return apiFetch<MedicalRecord[]>("directorio", `/medical-records/pet/${petId}`);
}
