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

export const MOCK_PATIENTS: CriticalPatient[] = [
    { id: "P-12345", name: "Max", owner: "Carlos Ramírez", condition: "Post-operatorio Cirugía Ortopédica", status: "Estable", nextCheckup: "2024-05-03T10:00:00Z", treatment: "Antibiótico y analgésicos IV", alertLevel: "yellow", vetId: "V-1", clinicId: "C-1" },
    { id: "P-67890", name: "Luna", owner: "María García", condition: "Gastroenteritis Hemorrágica", status: "Crítico", nextCheckup: "2024-05-02T14:00:00Z", treatment: "Fluidos IV constantes, antieméticos", alertLevel: "red", vetId: "V-2", clinicId: "C-1" },
    { id: "P-11111", name: "Rocky", owner: "Juan Pérez", condition: "Traumatismo por atropellamiento", status: "Reservado", nextCheckup: "2024-05-02T16:00:00Z", treatment: "Estabilización, control de hemorragia", alertLevel: "red", vetId: "V-1", clinicId: "C-1" },
    { id: "P-22222", name: "Bella", owner: "Ana Martínez", condition: "Recuperación de esterilización", status: "Estable", nextCheckup: "2024-05-08T09:00:00Z", treatment: "Reposo, analgésico oral", alertLevel: "green", vetId: "V-3", clinicId: "C-1" }
];

export async function getCriticalPatients(clinicId: string): Promise<CriticalPatient[]> {
    return Promise.resolve(MOCK_PATIENTS.filter(p => p.alertLevel === 'red' || p.alertLevel === 'yellow'));
}

export async function getActivePatients(clinicId: string): Promise<CriticalPatient[]> {
    return Promise.resolve(MOCK_PATIENTS);
}

export async function getEmergencyPatients(clinicId: string): Promise<CriticalPatient[]> {
    return Promise.resolve(MOCK_PATIENTS.filter(p => p.alertLevel === 'red'));
}
