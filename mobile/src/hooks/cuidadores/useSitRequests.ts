/**
 * useSitRequests — Hook for sitter requests screen
 * Manages sit request fetching, filtering, and status/service configuration
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getIncomingSitRequests, SitRequest } from '@/src/services/cuidadores';
import { AlertCircle, CheckCircle, XCircle, Sun, Moon, Home } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';

export function useSitRequests() {
    const { theme } = useTheme();

    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['sitter-requests'],
        queryFn: getIncomingSitRequests,
    });

    const filteredRequests = useMemo(() => {
        return requests.filter((request: SitRequest) => {
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
            const matchesSearch = request.pet_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (request.address || '').toLowerCase().includes(searchQuery.toLowerCase());
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

    const getServiceConfig = (type: string) => {
        switch (type) {
            case 'daycare':
                return {
                    icon: Sun,
                    label: 'Guardería',
                    color: '#f59e0b'
                };
            case 'boarding':
                return {
                    icon: Moon,
                    label: 'Hospedaje',
                    color: '#6366f1'
                };
            default:
                return {
                    icon: Home,
                    label: type || 'Cuidado',
                    color: theme.primary
                };
        }
    };

    const statusFilters = useMemo(() => [
        { id: 'all', label: 'Todas', count: requests.length },
        { id: 'pending', label: 'Pendientes', count: requests.filter((r: SitRequest) => r.status === 'pending').length },
        { id: 'confirmed', label: 'Confirmadas', count: requests.filter((r: SitRequest) => r.status === 'confirmed').length },
        { id: 'completed', label: 'Completadas', count: requests.filter((r: SitRequest) => r.status === 'completed').length },
        { id: 'cancelled', label: 'Canceladas', count: requests.filter((r: SitRequest) => r.status === 'cancelled').length },
    ], [requests]);

    return {
        requests: filteredRequests,
        isLoading,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        getStatusConfig,
        getServiceConfig,
        statusFilters,
    };
}
