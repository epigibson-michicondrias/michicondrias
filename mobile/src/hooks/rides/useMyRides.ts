/**
 * useMyRides — viajes que pedí como cliente, con filtro activos / historial.
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getMyRides } from '@/src/services/rides';
import type { PetRide, RideListFilter } from '@/src/services/rides';

export function useMyRides() {
  const router = useRouter();
  const [filter, setFilter] = useState<RideListFilter>('active');

  const { data: rides = [], isLoading, isError, isRefetching, refetch } = useQuery<PetRide[]>({
    queryKey: ['my-rides', filter],
    queryFn: () => getMyRides(filter),
    refetchInterval: filter === 'active' ? 15_000 : false,
  });

  return { filter, setFilter, rides, isLoading, isError, isRefetching, refetch, router };
}
