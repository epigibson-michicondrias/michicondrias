/**
 * useServiceManagement — Business logic for professional service request management
 * Handles incoming walk/sit requests, status updates, and filtering
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { showAlert } from '@/src/components/AppAlert';
import { getIncomingWalkRequests, updateWalkRequestStatus, WalkRequest } from '@/src/services/paseadores';
import { getIncomingSitRequests, updateSitRequestStatus, SitRequest } from '@/src/services/cuidadores';
import { useAuth } from '@/src/contexts/AuthContext';

type AnyRequest = (WalkRequest | SitRequest) & { type: 'walk' | 'sit' };

export function useServiceManagement() {
    const { user } = useAuth();
    const [filter, setFilter] = useState('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const isWalker = user?.role_name === 'walker';
    const isSitter = user?.role_name === 'sitter';

    const { data: walkRequests = [], isLoading: loadingWalks, refetch: refetchWalks } = useQuery({
        queryKey: ['incoming-walks'],
        queryFn: getIncomingWalkRequests,
        enabled: isWalker,
    });

    const { data: sitRequests = [], isLoading: loadingSits, refetch: refetchSits } = useQuery({
        queryKey: ['incoming-sits'],
        queryFn: getIncomingSitRequests,
        enabled: isSitter,
    });

    const allRequests: AnyRequest[] = [
        ...walkRequests.map(r => ({ ...r, type: 'walk' as const })),
        ...sitRequests.map(r => ({ ...r, type: 'sit' as const })),
    ];

    const filtered = allRequests.filter(r => filter === 'all' ? true : r.status === filter);

    const handleStatusUpdate = async (id: string, type: 'walk' | 'sit', newStatus: string) => {
        setActionLoading(id);
        try {
            if (type === 'walk') {
                await updateWalkRequestStatus(id, newStatus);
                refetchWalks();
            } else {
                await updateSitRequestStatus(id, newStatus);
                refetchSits();
            }
            showAlert({ type: 'success', title: 'Éxito', message: `Solicitud ${newStatus === 'accepted' ? 'aceptada' : 'rechazada'} correctamente` });
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estatus' });
        } finally {
            setActionLoading(null);
        }
    };

    const isLoading = loadingWalks || loadingSits;

    return {
        filter,
        setFilter,
        actionLoading,
        allRequests,
        filtered,
        isLoading,
        handleStatusUpdate,
    };
}

export type { AnyRequest };
