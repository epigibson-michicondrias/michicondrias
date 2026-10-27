import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listSitters, Sitter } from '@/src/services/cuidadores';

export function useSitters() {
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState<string>('');
    const [hasYardOnly, setHasYardOnly] = useState<boolean>(false);
    const [acceptsDogsOnly, setAcceptsDogsOnly] = useState<boolean>(false);
    const [acceptsCatsOnly, setAcceptsCatsOnly] = useState<boolean>(false);
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

    const {
        data: sitters = [],
        isLoading,
        refetch,
        isRefetching,
    } = useQuery<Sitter[]>({
        queryKey: ['sitters'],
        queryFn: () => listSitters(),
    });

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setServiceFilter('');
        setHasYardOnly(false);
        setAcceptsDogsOnly(false);
        setAcceptsCatsOnly(false);
        setVerifiedOnly(false);
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (serviceFilter !== '') count++;
        if (hasYardOnly) count++;
        if (acceptsDogsOnly) count++;
        if (acceptsCatsOnly) count++;
        if (verifiedOnly) count++;
        return count;
    }, [serviceFilter, hasYardOnly, acceptsDogsOnly, acceptsCatsOnly, verifiedOnly]);

    const filteredSitters = useMemo(() => {
        return sitters.filter(sitter => {
            const q = searchQuery.trim().toLowerCase();
            const matchSearch =
                !q ||
                sitter.display_name.toLowerCase().includes(q) ||
                (sitter.location || '').toLowerCase().includes(q) ||
                (sitter.bio || '').toLowerCase().includes(q);

            const matchService =
                !serviceFilter ||
                sitter.service_type === serviceFilter ||
                sitter.service_type === 'both';

            if (hasYardOnly && !sitter.has_yard) return false;
            if (acceptsDogsOnly && !sitter.accepts_dogs) return false;
            if (acceptsCatsOnly && !sitter.accepts_cats) return false;
            if (verifiedOnly && !sitter.is_verified) return false;

            return matchSearch && matchService;
        });
    }, [sitters, searchQuery, serviceFilter, hasYardOnly, acceptsDogsOnly, acceptsCatsOnly, verifiedOnly]);

    const hasActiveFilters = searchQuery.trim() !== '' || activeFiltersCount > 0;

    return {
        sitters: filteredSitters,
        allSitters: sitters,
        isLoading,
        refetch,
        isRefetching,
        searchQuery,
        setSearchQuery,
        serviceFilter,
        setServiceFilter,
        hasYardOnly,
        setHasYardOnly,
        acceptsDogsOnly,
        setAcceptsDogsOnly,
        acceptsCatsOnly,
        setAcceptsCatsOnly,
        verifiedOnly,
        setVerifiedOnly,
        clearFilters,
        activeFiltersCount,
        hasActiveFilters,
    };
}
