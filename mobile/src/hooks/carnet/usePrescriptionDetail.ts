import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPetById } from '@/src/services/mascotas';
import { getRecordsByPet } from '@/src/services/carnet';
import { getClinic, getVet } from '@/src/services/directorio';
import { prescriptionPlans, prescriptionStatus, prescriptionFolio } from './prescriptionPlan';

export function usePrescriptionDetail() {
    const { id, petId } = useLocalSearchParams();
    const recordId = id as string;
    const petIdStr = petId as string;

    const { data: pet, isLoading: loadingPet } = useQuery({
        queryKey: ['pet', petIdStr],
        queryFn: () => getPetById(petIdStr),
        enabled: !!petIdStr,
    });

    const { data: records = [], isLoading: loadingRecords } = useQuery({
        queryKey: ['pet-records', petIdStr],
        queryFn: () => getRecordsByPet(petIdStr),
        enabled: !!petIdStr,
    });

    const record = records.find((r) => r.id === recordId);

    // Quién la emitió: clínica y veterinario reales de la consulta (si la consulta los trae)
    const { data: clinic } = useQuery({
        queryKey: ['clinic', record?.clinic_id],
        queryFn: () => getClinic(record!.clinic_id!),
        enabled: !!record?.clinic_id,
        meta: { silentError: true },
    });
    const { data: vet } = useQuery({
        queryKey: ['vet', record?.veterinarian_id],
        queryFn: () => getVet(record!.veterinarian_id!),
        enabled: !!record?.veterinarian_id,
        meta: { silentError: true },
    });

    const plans = record ? prescriptionPlans(record) : [];

    return {
        recordId,
        petId: petIdStr,
        pet,
        record,
        clinic,
        vet,
        plans,
        status: prescriptionStatus(plans),
        folio: prescriptionFolio(recordId ?? ''),
        loading: loadingPet || loadingRecords,
    };
}
