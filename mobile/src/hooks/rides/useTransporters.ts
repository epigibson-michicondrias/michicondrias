/**
 * useTransporters — Hook for transporters screen
 * Extracts data fetching and search filtering from app/transportistas/index.tsx
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getAvailableDrivers, DriverProfile } from '@/src/services/rides';

export function useTransporters() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: drivers = [], isLoading } = useQuery<DriverProfile[]>({
    queryKey: ['available-drivers'],
    queryFn: () => getAvailableDrivers(),
  });

  const filteredDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) =>
          driver.vehicle_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          driver.vehicle_plate.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [drivers, searchQuery],
  );

  return {
    // State
    searchQuery,
    setSearchQuery,

    // Data
    drivers: filteredDrivers,
    isLoading,

    // Navigation
    router,
  };
}
