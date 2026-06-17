/**
 * useWalkRequests — Hook for walker requests screen
 * Manages walk request fetching, filtering, and status configuration
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getIncomingWalkRequests, WalkRequest } from '@/src/services/paseadores';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';

export function useWalkRequests() {
    const { theme } = useTheme();

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['walker-requests'],
        queryFn: getIncomingWalkRequests,
    });

    const filteredRequests = useMemo(() => {
        return requests.filter((request: WalkRequest) => {
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
            const matchesSearch = request.pet_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (request.pickup_address || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [requests, statusFilter, searchQuery]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: AlertCircle,
                    color: '#f59e0b',
                    bgColor: '#f59e0b20',
                    label: 'Pendiente'
                };
            case 'confirmed':
                return {
                    icon: CheckCircle,
                    color: '#10b981',
                    bgColor: '#10b98120',
                    label: 'Confirmado'
                };
            case 'completed':
                return {
                    icon: CheckCircle,
                    color: '#6366f1',
                    bgColor: '#6366f120',
                    label: 'Completado'
                };
            case 'cancelled':
                return {
                    icon: XCircle,
                    color: '#ef4444',
                    bgColor: '#ef444420',
                    label: 'Cancelado'
                };
            default:
                return {
                    icon: AlertCircle,
                    color: theme.textMuted,
                    bgColor: theme.surface,
                    label: status
                };
        }
    };

    const statusFilters = useMemo(() => [
        { id: 'all', label: 'Todas', count: requests.length },
        { id: 'pending', label: 'Pendientes', count: requests.filter((r: WalkRequest) => r.status === 'pending').length },
        { id: 'confirmed', label: 'Confirmadas', count: requests.filter((r: WalkRequest) => r.status === 'confirmed').length },
        { id: 'completed', label: 'Completadas', count: requests.filter((r: WalkRequest) => r.status === 'completed').length },
        { id: 'cancelled', label: 'Canceladas', count: requests.filter((r: WalkRequest) => r.status === 'cancelled').length },
    ], [requests]);

    return {
        requests: filteredRequests,
        isLoading,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        getStatusConfig,
        statusFilters,
    };
}
