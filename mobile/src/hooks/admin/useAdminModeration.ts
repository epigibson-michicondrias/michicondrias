/**
 * useAdminModeration — Business logic for the admin moderation screen
 * Manages pending items across all moderation categories and approve/reject actions
 */
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ModeracionService from '@/src/services/moderacion';
import { showAlert } from '@/src/components/AppAlert';

export type TabType = 'adopciones' | 'solicitudes' | 'perdidas' | 'directorio' | 'veterinarios' | 'ecommerce';

export function useAdminModeration() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabType>('adopciones');

    // Queries
    const { data: pendingAdoptions = [], isLoading: loadingAdoptions } = useQuery({
        queryKey: ['pending-adoptions'],
        queryFn: ModeracionService.getPendingAdoptions,
    });

    const { data: pendingProducts = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['pending-products'],
        queryFn: ModeracionService.getPendingProducts,
    });

    const { data: pendingLostPets = [], isLoading: loadingLostPets } = useQuery({
        queryKey: ['pending-lost-pets'],
        queryFn: ModeracionService.getPendingLostPets,
    });

    const { data: pendingRequests = [], isLoading: loadingRequests } = useQuery({
        queryKey: ['pending-requests'],
        queryFn: ModeracionService.getGlobalPendingRequests,
    });

    const { data: pendingClinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['pending-clinics'],
        queryFn: ModeracionService.getPendingClinics,
    });

    const { data: pendingVets = [], isLoading: loadingVets } = useQuery({
        queryKey: ['pending-vets'],
        queryFn: ModeracionService.getPendingVeterinarians,
    });

    const isLoading = loadingAdoptions || loadingProducts || loadingLostPets || loadingClinics || loadingVets || loadingRequests;

    const handleAction = async (action: 'approve' | 'reject', type: TabType | 'solicitudes', id: string, name: string) => {
        showAlert({
            type: action === 'approve' ? 'success' : 'error',
            title: action === 'approve' ? 'Aprobar Contenido' : 'Rechazar Contenido',
            message: `¿Estás seguro de ${action === 'approve' ? 'APROBAR' : 'RECHAZAR'} a: ${name}?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: action === 'approve' ? 'Aprobar' : 'Rechazar',
            onButtonPress: async () => {
                try {
                    if (type === 'adopciones') {
                        action === 'approve' ? await ModeracionService.approveAdoption(id) : await ModeracionService.rejectAdoption(id);
                        queryClient.invalidateQueries({ queryKey: ['pending-adoptions'] });
                    } else if (type === 'ecommerce') {
                        action === 'approve' ? await ModeracionService.approveProduct(id) : await ModeracionService.rejectProduct(id);
                        queryClient.invalidateQueries({ queryKey: ['pending-products'] });
                    } else if (type === 'perdidas') {
                        action === 'approve' ? await ModeracionService.approveLostPet(id) : await ModeracionService.rejectLostPet(id);
                        queryClient.invalidateQueries({ queryKey: ['pending-lost-pets'] });
                    } else if (type === 'directorio') {
                        action === 'approve' ? await ModeracionService.approveClinic(id) : await ModeracionService.rejectClinic(id);
                        queryClient.invalidateQueries({ queryKey: ['pending-clinics'] });
                    } else if (type === 'veterinarios') {
                        action === 'approve' ? await ModeracionService.approveVeterinarian(id) : await ModeracionService.rejectVeterinarian(id);
                        queryClient.invalidateQueries({ queryKey: ['pending-vets'] });
                    } else if (type === 'solicitudes') {
                        action === 'approve' ? await ModeracionService.approveAdoptionRequest(id) : await ModeracionService.rejectAdoptionRequest(id);
                        queryClient.invalidateQueries({ queryKey: ['pending-requests'] });
                    }
                    showAlert({ type: 'success', title: 'Éxito', message: 'Contenido procesado correctamente.' });
                } catch (e) {
                    showAlert({ type: 'error', title: 'Error', message: 'No se pudo completar la acción.' });
                }
            }
        });
    };

    const getDataForTab = (): any[] => {
        switch (activeTab) {
            case 'adopciones':
                return (pendingAdoptions as any[]) || [];
            case 'solicitudes':
                return (pendingRequests as any[]) || [];
            case 'ecommerce':
                return (pendingProducts as any[]) || [];
            case 'directorio':
                return [...((pendingClinics as any[]) || [])];
            case 'veterinarios':
                return [...((pendingVets as any[]) || [])];
            case 'perdidas':
                return (pendingLostPets as any[]) || [];
            default:
                return [];
        }
    };

    return {
        activeTab,
        setActiveTab,
        isLoading,
        pendingAdoptions,
        pendingProducts,
        pendingLostPets,
        pendingRequests,
        pendingClinics,
        pendingVets,
        handleAction,
        getDataForTab,
    };
}
