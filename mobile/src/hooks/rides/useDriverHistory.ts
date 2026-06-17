/**
 * useDriverHistory — Hook for driver ride history screen
 * Fetches ride history with earnings summary and ride list
 */
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getDriverRideHistory } from '@/src/services/rides';
import type { PetRide } from '@/src/services/rides';

export interface DriverHistoryData {
  driver_id: string;
  total_earnings: number;
  rides_count: number;
  rides: PetRide[];
}

export function useDriverHistory() {
  const router = useRouter();

  const {
    data: history,
    isLoading,
    isError,
    refetch,
  } = useQuery<DriverHistoryData>({
    queryKey: ['driver-ride-history'],
    queryFn: () => getDriverRideHistory(),
  });

  const totalEarnings = history?.total_earnings ?? 0;
  const ridesCount = history?.rides_count ?? 0;
  const rides = history?.rides ?? [];

  return {
    // Data
    totalEarnings,
    ridesCount,
    rides,
    isLoading,
    isError,

    // Actions
    refetch,

    // Navigation
    router,
  };
}
