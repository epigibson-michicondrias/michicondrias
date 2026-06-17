/**
 * useRideTracking — Hook for real-time ride tracking screen
 * Polls ride status every 5s, provides start/finish actions for drivers
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  trackRide,
  startRide,
  finishRide,
  updateLocation,
} from '@/src/services/rides';
import type { RideTrack, PetRide, RideLocationUpdate } from '@/src/services/rides';
import { showAlert } from '@/src/components/AppAlert';

export function useRideTracking(rideId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Poll ride tracking data every 5 seconds
  const {
    data: tracking,
    isLoading,
    isError,
  } = useQuery<RideTrack>({
    queryKey: ['ride-tracking', rideId],
    queryFn: () => trackRide(rideId),
    enabled: !!rideId,
    refetchInterval: 5000,
  });

  // Start ride mutation
  const startMutation = useMutation({
    mutationFn: () => startRide(rideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-tracking', rideId] });
      showAlert({
        type: 'success',
        title: '¡Viaje Iniciado!',
        message: 'El viaje ha comenzado. Conduce con cuidado.',
      });
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo iniciar el viaje.',
      });
    },
  });

  // Finish ride mutation
  const finishMutation = useMutation({
    mutationFn: () => finishRide(rideId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-tracking', rideId] });
      showAlert({
        type: 'success',
        title: '¡Viaje Finalizado!',
        message: 'El viaje ha sido completado exitosamente.',
        onButtonPress: () => router.back(),
      });
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo finalizar el viaje.',
      });
    },
  });

  const handleStart = () => startMutation.mutate();
  const handleFinish = () => finishMutation.mutate();

  // Location update mutation
  const locationMutation = useMutation({
    mutationFn: (data: RideLocationUpdate) => updateLocation(rideId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-tracking', rideId] });
    },
    onError: () => {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar la ubicación.',
      });
    },
  });

  const handleUpdateLocation = (lat: number, lng: number) => {
    locationMutation.mutate({ current_lat: lat, current_lng: lng });
  };

  const isRideActive = tracking?.status === 'in_progress' || tracking?.status === 'en_curso';
  const isRidePending = tracking?.status === 'pending' || tracking?.status === 'pendiente';
  const isRideCompleted = tracking?.status === 'completed' || tracking?.status === 'completado';

  return {
    // Data
    tracking,
    isLoading,
    isError,

    // Computed
    isRideActive,
    isRidePending,
    isRideCompleted,

    // Actions
    handleStart,
    handleFinish,
    isStarting: startMutation.isPending,
    isFinishing: finishMutation.isPending,

    // Location
    handleUpdateLocation,
    isUpdatingLocation: locationMutation.isPending,

    // Navigation
    router,
  };
}
