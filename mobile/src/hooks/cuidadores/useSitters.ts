import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listSitters, Sitter } from '@/src/services/cuidadores';

export function useSitters() {
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState<string>('');

    const {
        data: sitters = [],
        isLoading,
        refetch,
        isRefetching,
    } = useQuery<Sitter[]>({
        queryKey: ['sitters'],
        queryFn: () => listSitters(),
    });

    const filteredSitters = useMemo(() => {
        return sitters.filter(sitter => {
            const matchSearch =
                sitter.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (sitter.location || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchService =
                !serviceFilter ||
                sitter.service_type === serviceFilter ||
                sitter.service_type === 'both';
            return matchSearch && matchService;
        });
    }, [sitters, searchQuery, serviceFilter]);

    const hasActiveFilters = searchQuery !== '' || serviceFilter !== '';

    return {
        sitters: filteredSitters,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        serviceFilter,
        setServiceFilter,
        hasActiveFilters,
    };
}
