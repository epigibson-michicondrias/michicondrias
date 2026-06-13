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

export const MOCK_PRESCRIPTIONS: Prescription[] = [
    { id: "RX-1", patientId: "P-12345", veterinarianId: "V-1", status: "active", issuedDate: "2024-05-01T10:00:00Z", expiryDate: "2024-05-15T10:00:00Z", filledDate: null, notes: "Administrar con alimentos", medications: [{ name: "Amoxicilina", dosage: "500mg", frequency: "Cada 12 horas", duration: "7 días" }] },
    { id: "RX-2", patientId: "P-67890", veterinarianId: "V-2", status: "filled", issuedDate: "2024-04-20T09:00:00Z", expiryDate: "2024-05-20T09:00:00Z", filledDate: "2024-04-20T11:00:00Z", notes: "Observar reacciones", medications: [{ name: "Meloxicam", dosage: "2mg", frequency: "Cada 24 horas", duration: "3 días" }, { name: "Omeprazol", dosage: "10mg", frequency: "Cada 24 horas", duration: "5 días" }] },
    { id: "RX-3", patientId: "P-11111", veterinarianId: "V-1", status: "active", issuedDate: "2024-05-02T08:30:00Z", expiryDate: "2024-06-02T08:30:00Z", filledDate: null, notes: "Uso tópico", medications: [{ name: "Pomada Cicatrizante", dosage: "Una capa fina", frequency: "Cada 8 horas", duration: "10 días" }] }
];

export async function getClinicPrescriptions(clinicId: string, status?: string): Promise<Prescription[]> {
    if (status) {
        return Promise.resolve(MOCK_PRESCRIPTIONS.filter(p => p.status === status));
    }
    return Promise.resolve(MOCK_PRESCRIPTIONS);
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
