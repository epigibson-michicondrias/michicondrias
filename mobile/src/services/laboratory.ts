import { apiFetch } from "../lib/api";

export interface LabTest {
    id: string;
    patientId: string;
    testType: string;
    testName: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    requestedDate: string | null;
    completedDate: string | null;
    requestingVetId: string | null;
}

export interface LabTestCreatePayload {
    patientId: string;
    testType: string;
    testName: string;
    description?: string;
    vetId?: string;
}

export const MOCK_LAB_TESTS: LabTest[] = [
    { id: "L1", patientId: "P-12345", testType: "Sangre", testName: "Hemograma Completo", status: "pending", requestedDate: "2024-05-01T10:00:00Z", completedDate: null, requestingVetId: "V-1" },
    { id: "L2", patientId: "P-67890", testType: "Orina", testName: "Examen General de Orina", status: "completed", requestedDate: "2024-04-28T09:00:00Z", completedDate: "2024-04-29T11:00:00Z", requestingVetId: "V-2" },
    { id: "L3", patientId: "P-11111", testType: "Imagenología", testName: "Radiografía Tórax", status: "pending", requestedDate: "2024-05-02T08:30:00Z", completedDate: null, requestingVetId: "V-1" },
    { id: "L4", patientId: "P-22222", testType: "Genética", testName: "Test de ADN", status: "completed", requestedDate: "2024-04-20T14:00:00Z", completedDate: "2024-04-25T16:00:00Z", requestingVetId: "V-3" }
];

export async function getClinicLabTests(clinicId: string, status?: string): Promise<LabTest[]> {
    if (status) {
        return Promise.resolve(MOCK_LAB_TESTS.filter(t => t.status === status));
    }
    return Promise.resolve(MOCK_LAB_TESTS);
}

export async function requestLabTest(clinicId: string, test: LabTestCreatePayload): Promise<{id: string, message: string}> {
    return apiFetch<{id: string, message: string}>("directorio", `/clinics/${clinicId}/laboratory`, {
        method: 'POST',
        body: JSON.stringify(test)
    });
}

export async function updateLabTestResults(clinicId: string, testId: string, resultData: any): Promise<{message: string}> {
    return apiFetch<{message: string}>("directorio", `/clinics/${clinicId}/laboratory/${testId}`, {
        method: 'PUT',
        body: JSON.stringify(resultData)
    });
}
