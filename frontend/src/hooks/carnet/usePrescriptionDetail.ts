/**
 * usePrescriptionDetail — detalle de la receta de una consulta (`(app)/carnet/receta/[id]`).
 * Espejo de `mobile/src/hooks/carnet/usePrescriptionDetail.ts`.
 */
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPetById } from '@/services/mascotas';
import { getRecordsByPet } from '@/services/carnet';

export function usePrescriptionDetail() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const recordId = params.id;
    const petIdStr = searchParams.get('petId') || '';

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
