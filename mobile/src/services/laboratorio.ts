import { apiFetch } from "../lib/api";

// --- Lab Orders ---

export async function createLabOrder(data: any): Promise<any> {
    return apiFetch<any>("laboratorio", "/labs/orders", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getPendingLabOrders(): Promise<any[]> {
    return apiFetch<any[]>("laboratorio", "/labs/pending");
}

export async function uploadLabResults(orderId: string, data: any): Promise<any> {
    return apiFetch<any>("laboratorio", `/labs/orders/${orderId}/results`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getPetLabHistory(petId: string): Promise<any[]> {
    return apiFetch<any[]>("laboratorio", `/labs/pet/${petId}/history`);
}

export async function updateLabOrderStatus(orderId: string, status: string): Promise<any> {
    return apiFetch<any>("laboratorio", `/labs/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

// --- Lab Tests Catalog ---

export async function createLabTest(data: any): Promise<any> {
    return apiFetch<any>("laboratorio", "/labs/tests", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getLabTests(): Promise<any[]> {
    return apiFetch<any[]>("laboratorio", "/labs/tests");
}

// --- Lab Appointments ---

export async function createLabAppointment(data: any): Promise<any> {
    return apiFetch<any>("laboratorio", "/labs/appointments", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getClientLabAppointments(): Promise<any[]> {
    return apiFetch<any[]>("laboratorio", "/labs/appointments/client");
}

export async function getProviderLabAppointments(): Promise<any[]> {
    return apiFetch<any[]>("laboratorio", "/labs/appointments/provider");
}

// --- Lab Anomalies / Alerts ---

export async function getLabAnomalies(): Promise<any[]> {
    return apiFetch<any[]>("laboratorio", "/labs/alerts/anomalies");
}
