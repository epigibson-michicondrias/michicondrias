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

export const MOCK_METRICS: ClinicMetrics = {
    todayAppointments: 12,
    pendingConfirmations: 3,
    surgeriesToday: 2,
    emergencyCases: 1,
    vaccinationsToday: 5,
    checkupsToday: 4,
    labResultsPending: 2,
    prescriptionsActive: 8,
    inventoryAlerts: 4,
    dailyRevenue: 15400,
    occupancyRate: 85,
    newPatientsToday: 2,
    criticalPatients: 3
};

export async function getClinicMetrics(clinicId: string): Promise<ClinicMetrics> {
    return Promise.resolve(MOCK_METRICS);
}

export async function getClinicRevenue(clinicId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<any> {
    return apiFetch<any>("directorio", `/clinics/${clinicId}/metrics/revenue?period=${period}`);
}

export async function getClinicOccupancy(clinicId: string): Promise<any> {
    return apiFetch<any>("directorio", `/clinics/${clinicId}/metrics/occupancy`);
}
