/**
 * useRideTracking — detalle y seguimiento de un viaje para cliente y conductor.
 * Sondea el estado, comparte la ubicación del conductor mientras el viaje está aceptado/en curso
 * y expone las acciones válidas según el rol y el estado (aceptar, rechazar, iniciar, finalizar,
 * cancelar, calificar). El servidor valida cada transición (409) y aquí se muestra su mensaje.
 */
import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  getRide,
  acceptRide,
  rejectRide,
  startRide,
  finishRide,
  cancelRide,
  rateRide,
  updateLocation,
} from '@/src/services/rides';
import { getCurrentPoint } from '@/src/services/rideGeo';
import type { PetRide } from '@/src/services/rides';
import { showAlert } from '@/src/components/AppAlert';

const POLL_MS = 6000;
const LOCATION_MS = 15000;

export function useRideTracking(rideId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: ride, isLoading, isError, error, refetch, isRefetching } = useQuery<PetRide>({
    queryKey: ['ride', rideId],
    queryFn: () => getRide(rideId),
    enabled: !!rideId,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === 'completed' || s === 'cancelled' || s === 'rejected' ? false : POLL_MS;
    },
  });

  const refreshLists = () => {
    queryClient.invalidateQueries({ queryKey: ['ride', rideId] });
    queryClient.invalidateQueries({ queryKey: ['my-rides'] });
    queryClient.invalidateQueries({ queryKey: ['driver-requests'] });
    queryClient.invalidateQueries({ queryKey: ['driver-rides'] });
    queryClient.invalidateQueries({ queryKey: ['driver-ride-history'] });
  };

  // Hook interno: cada acción del viaje es una mutación con el mismo manejo de éxito/error
  const useRideAction = (fn: () => Promise<PetRide>, ok?: { title: string; message: string; goBack?: boolean }, failTitle = 'No se pudo completar') =>
    useMutation({
      mutationFn: fn,
      onSuccess: (data) => {
        queryClient.setQueryData(['ride', rideId], data);
        refreshLists();
        if (ok) {
          showAlert({
            type: 'success',
            title: ok.title,
            message: ok.message,
            onButtonPress: ok.goBack ? () => router.back() : undefined,
          });
        }
      },
      onError: (e: any) => {
        refreshLists();
        showAlert({ type: 'error', title: failTitle, message: e?.message || 'Intenta de nuevo.' });
      },
    });

  const acceptMutation = useRideAction(() => acceptRide(rideId), { title: 'Viaje aceptado', message: 'Dirígete al punto de recogida.' }, 'No se pudo aceptar');
  const rejectMutation = useRideAction(() => rejectRide(rideId), { title: 'Solicitud rechazada', message: 'Avisamos al cliente.', goBack: true }, 'No se pudo rechazar');
  const startMutation = useRideAction(() => startRide(rideId), { title: 'Viaje iniciado', message: 'Conduce con cuidado.' }, 'No se pudo iniciar');
  const finishMutation = useRideAction(() => finishRide(rideId), { title: 'Viaje finalizado', message: 'Completaste el viaje.' }, 'No se pudo finalizar');
  const cancelMutation = useMutation({
    mutationFn: (reason?: string) => cancelRide(rideId, reason),
    onSuccess: (data) => {
      queryClient.setQueryData(['ride', rideId], data);
      refreshLists();
      showAlert({ type: 'success', title: 'Viaje actualizado', message: data.status === 'cancelled' ? 'El viaje fue cancelado.' : 'Liberaste el viaje; otros conductores podrán tomarlo.' });
    },
    onError: (e: any) => {
      refreshLists();
      showAlert({ type: 'error', title: 'No se pudo cancelar', message: e?.message || 'Intenta de nuevo.' });
    },
  });
  const rateMutation = useMutation({
    mutationFn: (v: { rating: number; comment?: string }) => rateRide(rideId, v.rating, v.comment),
    onSuccess: (data) => {
      queryClient.setQueryData(['ride', rideId], data);
      refreshLists();
      showAlert({ type: 'success', title: '¡Gracias!', message: 'Tu calificación fue enviada.' });
    },
    onError: (e: any) => showAlert({ type: 'error', title: 'No se pudo calificar', message: e?.message || 'Intenta de nuevo.' }),
  });

  // El conductor comparte su ubicación mientras el viaje está aceptado o en curso.
  const sharing = ride?.viewer_role === 'driver' && (ride?.status === 'accepted' || ride?.status === 'in_transit');
  const busy = useRef(false);
  useEffect(() => {
    if (!sharing || !rideId) return;
    let alive = true;
    const push = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const p = await getCurrentPoint();
        if (alive && p) await updateLocation(rideId, { current_lat: p.lat, current_lng: p.lng });
      } catch {
        /* ubicación best-effort: no interrumpe al conductor */
      } finally {
        busy.current = false;
      }
    };
    push();
    const t = setInterval(push, LOCATION_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [sharing, rideId]);

  const status = ride?.status;
  const role = ride?.viewer_role;

  return {
    ride,
    // Alias de compatibilidad con la versión anterior del hook
    tracking: ride,
    isLoading,
    isError,
    errorMessage: (error as any)?.message as string | undefined,
    refetch,
    isRefetching,

    isRidePending: status === 'pending',
    isRideAccepted: status === 'accepted',
    isRideActive: status === 'in_transit',
    isRideCompleted: status === 'completed',
    isRideClosed: status === 'completed' || status === 'cancelled' || status === 'rejected',
    isSharingLocation: !!sharing,

    // Permisos de acción (el servidor vuelve a validar)
    canAccept: status === 'pending' && role === 'candidate',
    canReject: status === 'pending' && role === 'candidate' && !!ride?.preferred_driver_id,
    canStart: status === 'accepted' && role === 'driver',
    canFinish: status === 'in_transit' && role === 'driver',
    canCancel: !!ride?.can_cancel,
    canRate: !!ride?.can_rate,

    accept: () => acceptMutation.mutate(),
    reject: () => rejectMutation.mutate(),
    handleStart: () => startMutation.mutate(),
    handleFinish: () => finishMutation.mutate(),
    cancel: (reason?: string) => cancelMutation.mutate(reason),
    rate: (rating: number, comment?: string) => rateMutation.mutate({ rating, comment }),
    isActing:
      acceptMutation.isPending || rejectMutation.isPending || startMutation.isPending ||
      finishMutation.isPending || cancelMutation.isPending || rateMutation.isPending,
    isStarting: startMutation.isPending,
    isFinishing: finishMutation.isPending,

    router,
  };
}
