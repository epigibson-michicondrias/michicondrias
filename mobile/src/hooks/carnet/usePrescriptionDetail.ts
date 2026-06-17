import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getPetById } from '@/src/services/mascotas';
import { getRecordsByPet } from '@/src/services/carnet';

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

    return {
        recordId,
        petId: petIdStr,
        pet,
        record,
        loading: loadingPet || loadingRecords,
    };
}
