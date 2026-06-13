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

export const MOCK_ALERTS: ClinicAlert[] = [
    { id: "AL-1", type: "emergency", title: "Emergencia Ingresada", message: "Paciente con trauma llegó a recepción.", priority: "high", time: "Hace 5 mins", icon: "AlertTriangle", color: "#ef4444", isRead: false, actionUrl: "/mi-clinica/pacientes" },
    { id: "AL-2", type: "inventory", title: "Stock Crítico", message: "Quedan menos de 5 dosis de Vacuna Rabia.", priority: "high", time: "Hace 1 hr", icon: "Package", color: "#f59e0b", isRead: false, actionUrl: "/mi-clinica/inventario" },
    { id: "AL-3", type: "laboratory", title: "Resultados Listos", message: "Hemograma de Max está disponible.", priority: "medium", time: "Hace 2 hrs", icon: "FlaskConical", color: "#3b82f6", isRead: true, actionUrl: "/mi-clinica/laboratorio" }
];

export async function getClinicAlerts(clinicId: string): Promise<ClinicAlert[]> {
    return Promise.resolve(MOCK_ALERTS);
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
