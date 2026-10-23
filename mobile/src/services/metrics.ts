import { apiFetch } from "../lib/api";

export interface ClinicMetrics {
    todayAppointments: number;
    pendingConfirmations: number;
    surgeriesToday: number;
    emergencyCases: number;
    vaccinationsToday: number;
    checkupsToday: number;
    labResultsPending: number;
    prescriptionsActive: number;
    inventoryAlerts: number;
    dailyRevenue: number;
    occupancyRate: number;
    newPatientsToday: number;
    criticalPatients: number;
}

export async function getClinicMetrics(clinicId: string): Promise<ClinicMetrics> {
    return apiFetch<ClinicMetrics>("directorio", `/clinics/${clinicId}/metrics/daily`);
}

export async function getClinicRevenue(clinicId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    return apiFetch<any>("directorio", `/clinics/${clinicId}/metrics/revenue?period=${period}`);
}

export async function getClinicOccupancy(clinicId: string): Promise<any> {
    return apiFetch<any>("directorio", `/clinics/${clinicId}/metrics/occupancy`);
}
