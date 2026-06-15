import { apiFetch } from "../lib/api";

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    supplier: string;
    isCritical: boolean;
    lastRestockedAt: string | null;
}

export interface InventoryCreatePayload {
    name: string;
    description?: string;
    category?: string;
    unit?: string;
    currentStock?: number;
    minStock?: number;
    maxStock?: number;
    supplier?: string;
    costPerUnit?: number;
    isMedication?: boolean;
}

export async function getClinicInventory(clinicId: string): Promise<InventoryItem[]> {
    return apiFetch<InventoryItem[]>("directorio", `/clinics/${clinicId}/inventory`);
}

export async function getCriticalInventory(clinicId: string): Promise<InventoryItem[]> {
    return apiFetch<InventoryItem[]>("directorio", `/clinics/${clinicId}/inventory/critical`);
}

export async function addInventoryItem(clinicId: string, item: InventoryCreatePayload): Promise<{id: string, message: string}> {
    return apiFetch<{id: string, message: string}>("directorio", `/clinics/${clinicId}/inventory`, {
        method: 'POST',
        body: JSON.stringify(item)
    });
}

export async function updateInventoryItem(clinicId: string, itemId: string, item: Partial<InventoryItem>): Promise<{message: string}> {
    return apiFetch<{message: string}>("directorio", `/clinics/${clinicId}/inventory/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(item)
    });
}

export async function deleteInventoryItem(clinicId: string, itemId: string): Promise<{message: string}> {
    return apiFetch<{message: string}>("directorio", `/clinics/${clinicId}/inventory/${itemId}`, {
        method: 'DELETE'
    });
}
