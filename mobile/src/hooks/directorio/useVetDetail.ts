/**
 * useVetDetail — Data fetching for the specialist detail screen
 * Fetches the vet matching the route param
 */
import { Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { shareContent } from '@/src/utils/share';
import { useAuth } from '@/src/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getVet, getClinic, getClinicServices } from '@/src/services/directorio';

export function useVetDetail() {
    const { user } = useAuth();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const vetId = id as string;

    const { data: specialist, isLoading, isError, refetch } = useQuery({
        queryKey: ['vet', vetId],
        queryFn: () => getVet(vetId),
        enabled: !!vetId,
    });
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

    const open = (url: string) => Linking.openURL(url).catch(() =>
        showAlert({ type: 'info', title: 'No se pudo abrir', message: 'Tu teléfono no tiene una app para esta acción.' }));
    const phoneDigits = specialist?.phone?.replace(/\D/g, '') ?? '';
    const fullName = specialist ? `${specialist.first_name} ${specialist.last_name}`.trim() : '';

    return {
        vetId,
        fullName,
        call: phoneDigits ? () => open(`tel:${phoneDigits}`) : undefined,
        whatsapp: phoneDigits ? () => open(`https://wa.me/${phoneDigits.length === 10 ? `52${phoneDigits}` : phoneDigits}`) : undefined,
        share: () => specialist && shareContent(fullName, `${fullName} — ${specialist.specialty || 'Médico veterinario'}. Lo encontré en Michicondrias 🐾`),
        /** Solo se agenda en línea con quien atiende en una clínica (el backend necesita la clínica). */
        canBook: !!specialist?.clinic_id,
        book: (serviceId?: string) => specialist?.clinic_id && router.push({
            pathname: '/directorio/citas/agendar/[clinic_id]',
            params: { clinic_id: specialist.clinic_id, vet_id: specialist.id, ...(serviceId ? { service_id: serviceId } : {}) },
        }),
        openClinic: () => clinic && router.push(`/directorio/clinica/${clinic.id}`),
        goBack: () => (router.canGoBack() ? router.back() : router.replace('/directorio')),
        /** El propio veterinario no se reseña a sí mismo (el backend responde 403). */
        canReview: !!user && !!specialist && specialist.user_id !== user.id,
        specialist,
        isLoading,
        isError,
        refetch,
        clinic,
        isLoadingClinic,
        services,
        isLoadingServices,
    };
}
