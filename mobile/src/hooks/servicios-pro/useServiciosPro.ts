/**
 * useServiciosPro — Data fetching and filtering for professional services listing
 * Manages walkers/sitters queries, search, and tab state
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listWalkers, Walker } from '@/src/services/paseadores';
import { listSitters, Sitter } from '@/src/services/cuidadores';

export function useServiciosPro() {
    const [activeTab, setActiveTab] = useState<'walkers' | 'sitters'>('walkers');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: walkers = [], isLoading: loadingWalkers } = useQuery({
        queryKey: ['walkers'],
        queryFn: () => listWalkers(),
        enabled: activeTab === 'walkers',
    });

    const { data: sitters = [], isLoading: loadingSitters } = useQuery({
        queryKey: ['sitters'],
        queryFn: () => listSitters(),
        enabled: activeTab === 'sitters',
    });

    const filteredData = (activeTab === 'walkers' ? walkers : sitters).filter((item: any) =>
        item.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isLoading = loadingWalkers || loadingSitters;

    return {
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        filteredData,
        isLoading,
    };
}
