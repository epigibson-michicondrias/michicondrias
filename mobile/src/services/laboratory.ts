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

export async function getClinicLabTests(clinicId: string, status?: string): Promise<LabTest[]> {
    const query = status ? `?status=${status}` : "";
    return apiFetch<LabTest[]>("directorio", `/clinics/${clinicId}/laboratory${query}`);
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
