/**
 * useVetDetail — Data fetching for the specialist detail screen
 * Fetches all vets then finds the one matching the route param
 */
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getVets, getClinic, getClinicServices } from '@/src/services/directorio';

export function useVetDetail() {
    const { id } = useLocalSearchParams();
    const vetId = id as string;

    const { data: specialists = [], isLoading } = useQuery({
        queryKey: ['vet', vetId],
        queryFn: () => getVets(),
    });

    const specialist = specialists.find(v => v.id === vetId);
    const clinicId = specialist?.clinic_id;

    const { data: clinic, isLoading: isLoadingClinic } = useQuery({
        queryKey: ['clinic', clinicId],
        queryFn: () => getClinic(clinicId!),
        enabled: !!clinicId,
    });

    const { data: services = [], isLoading: isLoadingServices } = useQuery({
        queryKey: ['clinic-services', clinicId],
        queryFn: () => getClinicServices(clinicId!),
        enabled: !!clinicId,
    });

    return {
        vetId,
        specialist,
        isLoading,
        clinic,
        isLoadingClinic,
        services,
        isLoadingServices,
    };
}
