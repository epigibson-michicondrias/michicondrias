/**
 * useRequestRide — Hook para pedir un viaje.
 * El servidor calcula distancia y tarifa y el conductor acepta la solicitud: aquí solo se arma la
 * ruta (con coordenadas cuando se pueden obtener), la mascota, la fecha y un conductor sugerido opcional.
 */
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getUserPets } from '@/src/services/mascotas';
import { getAvailableDrivers, estimateFare, requestRide } from '@/src/services/rides';
import { describePoint, geocodeAddress, getCurrentPoint, type GeoPoint } from '@/src/services/rideGeo';
import type { Pet } from '@/src/types/mascotas';
import type { DriverProfile, PetRideCreate, RideEstimateOut } from '@/src/services/rides';
import { showAlert } from '@/src/components/AppAlert';

export interface RideFormData {
  origin_address: string;
  destination_address: string;
  pet_id: string;
  /** id de usuario del conductor sugerido ('' = cualquier conductor disponible) */
  driver_id: string;
  requires_carrier: boolean;
  scheduled_at: Date | null;
  notes: string;
}

const FORM_DEFAULTS: RideFormData = {
  origin_address: '',
  destination_address: '',
  pet_id: '',
  driver_id: '',
  requires_carrier: false,
  scheduled_at: null,
  notes: '',
};

type Resolved = { address: string; point: GeoPoint | null };

export function useRequestRide() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ driver_id?: string }>();
  const { user } = useAuth();
  const [form, setForm] = useState<RideFormData>(() => ({
    ...FORM_DEFAULTS,
    driver_id: params.driver_id || '',
  }));
  const [estimate, setEstimate] = useState<RideEstimateOut | null>(null);
  const [estimateNote, setEstimateNote] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  // Coordenadas ya resueltas por dirección (se invalidan si el texto cambia)
  const resolved = useRef<{ origin?: Resolved; destination?: Resolved }>({});

  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ['user-pets-ride', user?.id],
    queryFn: () => (user ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery<DriverProfile[]>({
    queryKey: ['available-drivers-ride'],
    queryFn: () => getAvailableDrivers(),
  });

  const resolvePoint = async (kind: 'origin' | 'destination'): Promise<GeoPoint | null> => {
    const address = (kind === 'origin' ? form.origin_address : form.destination_address).trim();
    const cached = resolved.current[kind];
    if (cached && cached.address === address) return cached.point;
    const point = await geocodeAddress(address);
    resolved.current[kind] = { address, point };
    return point;
  };

  const estimateMutation = useMutation({
    mutationFn: async () => {
      const [o, d] = await Promise.all([resolvePoint('origin'), resolvePoint('destination')]);
      if (!o || !d) return null;
      return estimateFare({
        origin_lat: o.lat,
        origin_lng: o.lng,
        destination_lat: d.lat,
        destination_lng: d.lng,
        requires_carrier: form.requires_carrier,
      });
    },
    onSuccess: (data) => {
      setEstimate(data);
      setEstimateNote(
        data ? null : 'No pudimos ubicar alguna de las direcciones. Escríbelas con calle, número y ciudad. La tarifa final la calcula el servicio al enviar.',
      );
    },
    onError: (e: any) => {
      setEstimate(null);
      showAlert({ type: 'error', title: 'No se pudo calcular', message: e?.message || 'No se pudo calcular la tarifa estimada.' });
    },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      const [o, d] = await Promise.all([resolvePoint('origin'), resolvePoint('destination')]);
      const payload: PetRideCreate = {
        pet_id: form.pet_id,
        origin_address: form.origin_address.trim(),
        destination_address: form.destination_address.trim(),
        requires_carrier: form.requires_carrier,
        notes: form.notes.trim() || undefined,
        scheduled_at: form.scheduled_at ? form.scheduled_at.toISOString() : undefined,
        preferred_driver_id: form.driver_id || undefined,
      };
      if (o && d) {
        payload.origin_lat = o.lat;
        payload.origin_lng = o.lng;
        payload.destination_lat = d.lat;
        payload.destination_lng = d.lng;
      }
      return requestRide(payload);
    },
    onSuccess: (ride) => {
      queryClient.invalidateQueries({ queryKey: ['my-rides'] });
      showAlert({
        type: 'success',
        title: '¡Viaje solicitado!',
        message:
          ride.price != null
            ? `Tarifa: $${Number(ride.price).toFixed(2)}. Te avisaremos cuando un conductor lo acepte.`
            : 'Te avisaremos cuando un conductor lo acepte.',
        onButtonPress: () => router.replace('/transportistas/mis-viajes' as any),
      });
    },
    onError: (e: any) => {
      showAlert({
        type: 'error',
        title: 'No se pudo solicitar',
        message: e?.message || 'No se pudo solicitar el transporte. Intenta de nuevo.',
      });
    },
  });

  const updateForm = (updates: Partial<RideFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    if ('origin_address' in updates || 'destination_address' in updates || 'requires_carrier' in updates) {
      setEstimate(null);
      setEstimateNote(null);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const point = await getCurrentPoint();
      if (!point) {
        showAlert({ type: 'warning', title: 'Ubicación no disponible', message: 'Activa el permiso de ubicación o escribe la dirección de recogida.' });
        return;
      }
      const address = (await describePoint(point)) || 'Mi ubicación actual';
      resolved.current.origin = { address, point };
      updateForm({ origin_address: address });
    } finally {
      setLocating(false);
    }
  };

  const canEstimate = form.origin_address.trim().length >= 3 && form.destination_address.trim().length >= 3;

  const handleEstimate = () => {
    if (!canEstimate) {
      showAlert({ type: 'error', title: 'Faltan datos', message: 'Escribe el origen y el destino para calcular la tarifa.' });
      return;
    }
    estimateMutation.mutate();
  };

  const handleSubmit = () => {
    if (!form.pet_id || form.origin_address.trim().length < 3 || form.destination_address.trim().length < 3) {
      showAlert({
        type: 'error',
        title: 'Faltan datos',
        message: 'Selecciona tu mascota y escribe el origen y el destino.',
      });
      return;
    }
    if (form.scheduled_at && form.scheduled_at.getTime() < Date.now() - 5 * 60_000) {
      showAlert({ type: 'error', title: 'Fecha inválida', message: 'La fecha del viaje no puede estar en el pasado.' });
      return;
    }
    requestMutation.mutate();
  };

  return {
    // Form state
    form,
    updateForm,
    estimate,
    estimateNote,

    // Data
    pets,
    drivers,
    isLoading: petsLoading || driversLoading,

    // Actions
    handleEstimate,
    handleSubmit,
    useMyLocation,
    canEstimate,
    isLocating: locating,
    isEstimating: estimateMutation.isPending,
    isSubmitting: requestMutation.isPending,

    // Navigation
    router,
  };
}
