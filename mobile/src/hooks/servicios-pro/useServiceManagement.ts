/**
 * useServiceManagement — "Mis Tareas" del paseador o cuidador: solicitudes entrantes y sus cambios de estado.
 */
import { useState } from 'react';
import { useProRequests, ProRequest } from './useProRequests';
import { useProRole } from './useProRole';
import { normalizeStatus } from './requestStatus';

export type AnyRequest = ProRequest & { type: 'walk' | 'sit' };

export function useServiceManagement() {
    const { isWalker } = useProRole();
    const kind: 'walk' | 'sit' = isWalker ? 'walk' : 'sit';
    const base = useProRequests(kind);
    const [filter, setFilter] = useState('pending');

    const allRequests: AnyRequest[] = base.allRequests.map(r => ({ ...r, type: kind }));
    const filtered = allRequests.filter(r => filter === 'all' || normalizeStatus(r.status) === filter);

    return {
        kind,
        filter,
        setFilter,
        actionLoading: base.updatingId,
        allRequests,
        filtered,
        isLoading: base.isLoading,
        isRefetching: base.isRefetching,
        refetch: base.refetch,
        handleStatusUpdate: base.updateStatus,
    };
}
