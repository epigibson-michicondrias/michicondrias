/**
 * useDriverRequests — bandeja del conductor: solicitudes disponibles (cercanas si hay ubicación)
 * y viajes que ya aceptó. Aceptar/rechazar con manejo de conflictos (otro conductor ganó, etc.).
 */
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { acceptRide, getDriverRequests, getDriverRides, rejectRide } from '@/src/services/rides';
import { getCurrentPoint, type GeoPoint } from '@/src/services/rideGeo';
import type { PetRide } from '@/src/services/rides';
import { showAlert } from '@/src/components/AppAlert';

export function useDriverRequests() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [point, setPoint] = useState<GeoPoint | null>(null);
  const [locationChecked, setLocationChecked] = useState(false);

  useEffect(() => {
    let alive = true;
    getCurrentPoint().then((p) => {
      if (alive) {
        setPoint(p);
        setLocationChecked(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const requestsQuery = useQuery<PetRide[]>({
    queryKey: ['driver-requests', point?.lat ?? null, point?.lng ?? null],
    queryFn: () => getDriverRequests(point),
    enabled: locationChecked,
    refetchInterval: 15_000,
  });

  const activeQuery = useQuery<PetRide[]>({
    queryKey: ['driver-rides', 'active'],
    queryFn: () => getDriverRides('active'),
    refetchInterval: 15_000,
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['driver-requests'] });
    queryClient.invalidateQueries({ queryKey: ['driver-rides'] });
    queryClient.invalidateQueries({ queryKey: ['driver-ride-history'] });
  };

  const acceptMutation = useMutation({
    mutationFn: (id: string) => acceptRide(id),
    onSuccess: (ride) => {
      refreshAll();
      router.push(`/transportistas/tracking/${ride.id}` as any);
    },
    onError: (e: any) => {
      refreshAll();
      showAlert({ type: 'error', title: 'No se pudo aceptar', message: e?.message || 'Intenta de nuevo.' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectRide(id),
    onSuccess: refreshAll,
    onError: (e: any) => {
      refreshAll();
      showAlert({ type: 'error', title: 'No se pudo rechazar', message: e?.message || 'Intenta de nuevo.' });
    },
  });

  const refetch = () => {
    requestsQuery.refetch();
    activeQuery.refetch();
  };

  return {
    requests: requestsQuery.data ?? [],
    activeRides: activeQuery.data ?? [],
    hasLocation: !!point,
    isLoading: !locationChecked || requestsQuery.isLoading || activeQuery.isLoading,
    isError: requestsQuery.isError || activeQuery.isError,
    isRefetching: requestsQuery.isRefetching || activeQuery.isRefetching,
    refetch,
    accept: (id: string) => acceptMutation.mutate(id),
    reject: (id: string) => rejectMutation.mutate(id),
    busyId: acceptMutation.isPending
      ? (acceptMutation.variables as string)
      : rejectMutation.isPending
        ? (rejectMutation.variables as string)
        : null,
    router,
  };
}
