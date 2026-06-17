/**
 * useAlerts — Hook for clinic alerts screen
 * Manages alert fetching, tab filtering by type, and mark-as-read mutation
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyClinics, getUnreadAlertCount, deleteAlert as deleteAlertService } from '@/src/services/directorio';
import {
    getClinicAlerts,
    getEmergencyAlerts,
    getInventoryAlerts,
    getLaboratoryAlerts,
    markAlertAsRead,
    ClinicAlert,
} from '@/src/services/alerts';
import { showAlert } from '@/src/components/AppAlert';

export type AlertTab = 'all' | 'emergency' | 'inventory' | 'laboratory';

export function useAlerts() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<AlertTab>('all');

    const { data: clinics = [], isLoading: loadingClinics } = useQuery({
        queryKey: ['my-clinics'],
        queryFn: getMyClinics,
    });
    const clinic = clinics[0];

    const { data: allAlerts = [], isLoading: loadingAll } = useQuery({
        queryKey: ['clinic-alerts', clinic?.id],
        queryFn: () => getClinicAlerts(clinic!.id),
        enabled: !!clinic?.id && activeTab === 'all',
        refetchInterval: 15000,
    });

    const { data: emergencyAlerts = [], isLoading: loadingEmergency } = useQuery({
        queryKey: ['clinic-alerts-emergency', clinic?.id],
        queryFn: () => getEmergencyAlerts(clinic!.id),
        enabled: !!clinic?.id && activeTab === 'emergency',
        refetchInterval: 15000,
    });

    const { data: inventoryAlerts = [], isLoading: loadingInventory } = useQuery({
        queryKey: ['clinic-alerts-inventory', clinic?.id],
        queryFn: () => getInventoryAlerts(clinic!.id),
        enabled: !!clinic?.id && activeTab === 'inventory',
        refetchInterval: 15000,
    });

    const { data: laboratoryAlerts = [], isLoading: loadingLab } = useQuery({
        queryKey: ['clinic-alerts-laboratory', clinic?.id],
        queryFn: () => getLaboratoryAlerts(clinic!.id),
        enabled: !!clinic?.id && activeTab === 'laboratory',
        refetchInterval: 15000,
    });

    const markReadMutation = useMutation({
        mutationFn: (alertId: string) => markAlertAsRead(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-alerts-emergency'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-alerts-inventory'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-alerts-laboratory'] });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo marcar la alerta como leída' });
        },
    });

    const alerts: ClinicAlert[] = (() => {
        switch (activeTab) {
            case 'emergency': return emergencyAlerts;
            case 'inventory': return inventoryAlerts;
            case 'laboratory': return laboratoryAlerts;
            default: return allAlerts;
        }
    })();

    const isLoading = loadingClinics || loadingAll || loadingEmergency || loadingInventory || loadingLab;

    const tabs: { id: AlertTab; label: string; count: number }[] = [
        { id: 'all', label: 'Todas', count: allAlerts.length },
        { id: 'emergency', label: 'Emergencias', count: emergencyAlerts.length },
        { id: 'inventory', label: 'Inventario', count: inventoryAlerts.length },
        { id: 'laboratory', label: 'Laboratorio', count: laboratoryAlerts.length },
    ];

    const handleMarkAsRead = (alertId: string) => {
        markReadMutation.mutate(alertId);
    };

    // Unread alert count from directorio service
    const { data: unreadAlertCount } = useQuery<{ count: number }>({
        queryKey: ['unread-alert-count', clinic?.id],
        queryFn: () => getUnreadAlertCount(clinic!.id),
        enabled: !!clinic?.id,
        refetchInterval: 15000,
    });

    // Delete alert mutation
    const deleteAlertMutation = useMutation({
        mutationFn: (alertId: string) => deleteAlertService(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinic-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-alerts-emergency'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-alerts-inventory'] });
            queryClient.invalidateQueries({ queryKey: ['clinic-alerts-laboratory'] });
            queryClient.invalidateQueries({ queryKey: ['unread-alert-count'] });
            showAlert({ type: 'success', title: 'Eliminada', message: 'Alerta eliminada correctamente' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo eliminar la alerta' });
        },
    });

    const handleDeleteAlert = (alertId: string) => {
        deleteAlertMutation.mutate(alertId);
    };

    return {
        // State
        activeTab,
        setActiveTab,
        // Data
        alerts,
        tabs,
        isLoading,
        loadingClinics,
        unreadCount: unreadAlertCount?.count ?? 0,
        // Actions
        handleMarkAsRead,
        isMarkingRead: markReadMutation.isPending,
        handleDeleteAlert,
        isDeletingAlert: deleteAlertMutation.isPending,
    };
}
