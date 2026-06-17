/**
 * useFuneraryServices — Hook for funerary services list screen
 * Extracts data fetching and search filtering from app/funeraria/index.tsx
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getActiveFuneraryServices, FuneraryService } from '@/src/services/funerary';

export function useFuneraryServices() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: services = [], isLoading } = useQuery<FuneraryService[]>({
    queryKey: ['funerary-services'],
    queryFn: () => getActiveFuneraryServices(),
  });

  const filteredServices = useMemo(
    () =>
      services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (service.description || '').toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [services, searchQuery],
  );

  return {
    // State
    searchQuery,
    setSearchQuery,

    // Data
    services: filteredServices,
    isLoading,

    // Navigation
    router,
  };
}
