import { apiFetch } from "../lib/api";

export interface CriticalPatient {
    id: string;
    name: string;
    owner: string;
    condition: string;
    status: string;
    nextCheckup: string | null;
    treatment: string;
    alertLevel: 'yellow' | 'red' | 'green';
    vetId: string | null;
    clinicId: string;
}

export async function getCriticalPatients(clinicId: string): Promise<CriticalPatient[]> {
    return apiFetch<CriticalPatient[]>("directorio", `/clinics/${clinicId}/patients/critical`);
}

export async function getActivePatients(clinicId: string): Promise<CriticalPatient[]> {
    return apiFetch<CriticalPatient[]>("directorio", `/clinics/${clinicId}/patients/active`);
}

export async function getEmergencyPatients(clinicId: string): Promise<CriticalPatient[]> {
    return apiFetch<CriticalPatient[]>("directorio", `/clinics/${clinicId}/patients/emergency`);
}
