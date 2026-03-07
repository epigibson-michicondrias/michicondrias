import { apiFetch } from "../lib/api";

export interface ClinicAlert {
    id: string;
    type: 'emergency' | 'inventory' | 'laboratory' | 'vaccination' | 'followup';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
    time: string;
    icon: string;
    color: string;
    isRead: boolean;
    actionUrl: string;
}

export async function getClinicAlerts(clinicId: string): Promise<ClinicAlert[]> {
    return apiFetch<ClinicAlert[]>("directorio", `/clinics/${clinicId}/alerts`);
}

export async function getEmergencyAlerts(clinicId: string): Promise<ClinicAlert[]> {
    return apiFetch<ClinicAlert[]>("directorio", `/clinics/${clinicId}/alerts/emergency`);
}

export async function getInventoryAlerts(clinicId: string): Promise<ClinicAlert[]> {
    return apiFetch<ClinicAlert[]>("directorio", `/clinics/${clinicId}/alerts/inventory`);
}

export async function getLaboratoryAlerts(clinicId: string): Promise<ClinicAlert[]> {
    return apiFetch<ClinicAlert[]>("directorio", `/clinics/${clinicId}/alerts/laboratory`);
}

export async function markAlertAsRead(alertId: string): Promise<void> {
    return apiFetch<void>("directorio", `/alerts/${alertId}/read`, {
        method: "PUT"
    });
}
