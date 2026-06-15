import { apiFetch } from "../lib/api";

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface Prescription {
    id: string;
    patientId: string;
    veterinarianId: string;
    medications: Medication[];
    status: 'active' | 'filled' | 'expired' | 'cancelled';
    notes?: string;
    issuedDate: string | null;
    expiryDate: string | null;
    filledDate: string | null;
}

export interface PrescriptionCreatePayload {
    patientId: string;
    veterinarianId: string;
    medications: Medication[];
    notes?: string;
}

export async function getClinicPrescriptions(clinicId: string, status?: string): Promise<Prescription[]> {
    const query = status ? `?status=${status}` : "";
    return apiFetch<Prescription[]>("directorio", `/clinics/${clinicId}/prescriptions${query}`);
}

export async function createPrescription(clinicId: string, presc: PrescriptionCreatePayload): Promise<{id: string, message: string}> {
    return apiFetch<{id: string, message: string}>("directorio", `/clinics/${clinicId}/prescriptions`, {
        method: 'POST',
        body: JSON.stringify(presc)
    });
}

export async function updatePrescriptionStatus(clinicId: string, prescId: string, status: string): Promise<{message: string}> {
    return apiFetch<{message: string}>("directorio", `/clinics/${clinicId}/prescriptions/${prescId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}
