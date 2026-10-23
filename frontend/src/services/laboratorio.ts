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
    // El backend recibe el estado como parámetro de consulta (status_str)
    return apiFetch<any>("laboratorio", `/labs/orders/${orderId}/status?status_str=${encodeURIComponent(status)}`, {
        method: "PATCH",
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

export async function getLabOrders(statusFilter?: string): Promise<any[]> {
    const q = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : "";
    return apiFetch<any[]>("laboratorio", `/labs/orders/lab${q}`);
}

export async function getVetLabOrders(): Promise<any[]> {
    return apiFetch<any[]>("laboratorio", "/labs/orders/vet");
}

export async function updateLabAppointmentStatus(id: string, status: 'confirmed' | 'completed' | 'cancelled'): Promise<any> {
    return apiFetch<any>("laboratorio", `/labs/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

export async function getMyLabTests(): Promise<any[]> {
    return apiFetch<any[]>("laboratorio", "/labs/tests/mine");
}

export async function setLabTestActive(id: string, isActive: boolean): Promise<any> {
    return apiFetch<any>("laboratorio", `/labs/tests/${id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
    });
}
