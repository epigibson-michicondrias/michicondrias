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
    return apiFetch<CriticalPatient[]>("directorio", `/clinics/clinics/${clinicId}/patients/critical`);
}

export async function getActivePatients(clinicId: string): Promise<CriticalPatient[]> {
    const all = await apiFetch<CriticalPatient[]>("directorio", `/clinics/clinics/${clinicId}/patients/critical`);
    return all.filter(p => p.alertLevel === 'yellow' || p.alertLevel === 'green');
}

export async function getEmergencyPatients(clinicId: string): Promise<CriticalPatient[]> {
    const all = await apiFetch<CriticalPatient[]>("directorio", `/clinics/clinics/${clinicId}/patients/critical`);
    return all.filter(p => p.alertLevel === 'red');
}

export interface ClinicPatient {
    id: string;
    name: string;
    species?: string | null;
    breed?: string | null;
    owner_id?: string | null;
    owner: string;
    visits: number;
    last_visit: string | null;
    next_visit: string | null;
    alert_level: 'yellow' | 'red' | 'green' | null;
}

/** Pacientes reales de la clínica (mascotas con citas), no solo los marcados como críticos. */
export async function getClinicPatients(clinicId: string): Promise<ClinicPatient[]> {
    return apiFetch<ClinicPatient[]>("directorio", `/clinics/clinics/${clinicId}/patients`);
}
