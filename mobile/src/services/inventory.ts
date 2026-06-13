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

export const MOCK_INVENTORY: InventoryItem[] = [
    { id: "1", name: "Amoxicilina 500mg", category: "medicamentos", unit: "Cajas", currentStock: 5, minStock: 10, maxStock: 50, supplier: "PharmaVet", isCritical: true, lastRestockedAt: "2024-05-01" },
    { id: "2", name: "Vacuna Rabia", category: "vacunas", unit: "Dosis", currentStock: 25, minStock: 15, maxStock: 100, supplier: "BioPet", isCritical: false, lastRestockedAt: "2024-04-15" },
    { id: "3", name: "Jeringas 3ml", category: "insumos", unit: "Cajas", currentStock: 2, minStock: 5, maxStock: 20, supplier: "MedSupply", isCritical: true, lastRestockedAt: "2024-03-20" },
    { id: "4", name: "Alimento Premium Perro", category: "alimentos", unit: "Sacos", currentStock: 12, minStock: 5, maxStock: 30, supplier: "NutriPet", isCritical: false, lastRestockedAt: "2024-04-28" }
];

export async function getClinicInventory(clinicId: string): Promise<InventoryItem[]> {
    return Promise.resolve(MOCK_INVENTORY);
}

export async function getCriticalInventory(clinicId: string): Promise<InventoryItem[]> {
    return Promise.resolve(MOCK_INVENTORY.filter(item => item.isCritical));
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
