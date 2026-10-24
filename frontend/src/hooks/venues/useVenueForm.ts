/**
 * useVenueForm — alta/edición de establecimiento (`(app)/establecimientos/nuevo` y `editar/[id]`).
 * Espejo de `mobile/src/hooks/venues/useVenueForm.ts` con `useParams` de next/navigation.
 */
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVenue,
  updateVenue,
  deleteVenue,
  getVenue,
  type Venue,
  type VenueCreate,
  type VenueUpdate,
} from "@/services/venues";
import { showAlert } from "@/components/AppAlert";

export interface VenueFormData {
  name: string;
  address: string;
  discount_coupon: string;
  discount_description: string;
}

const DEFAULT_AMENITIES: Record<string, boolean> = {
  Estacionamiento: false,
  WiFi: false,
  "Pet-Friendly": false,
  "Agua para mascotas": false,
  "Área de juegos": false,
  Guardería: false,
};

export function useVenueForm(mode: "create" | "edit" = "create") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [formData, setFormData] = useState<VenueFormData>({
    name: "",
    address: "",
    discount_coupon: "",
    discount_description: "",
  });
  const [amenities, setAmenities] = useState<Record<string, boolean>>({ ...DEFAULT_AMENITIES });

  const { data: existingVenue, isLoading: isLoadingVenue } = useQuery<Venue>({
    queryKey: ["venue", id],
    queryFn: () => getVenue(id!),
    enabled: mode === "edit" && !!id,
  });

  // Hidratar el formulario al llegar el venue (setState fuera del cuerpo síncrono del efecto)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled || !existingVenue || mode !== "edit") return;
      setFormData({
        name: existingVenue.name || "",
        address: existingVenue.address || "",
        discount_coupon: existingVenue.discount_coupon || "",
        discount_description: existingVenue.discount_description || "",
      });
      const merged = { ...DEFAULT_AMENITIES };
      if (existingVenue.amenities) {
        Object.entries(existingVenue.amenities).forEach(([key, value]) => {
          merged[key] = Boolean(value);
        });
      }
      setAmenities(merged);
    })();
    return () => {
      cancelled = true;
    };
  }, [existingVenue, mode]);

  const createMutation = useMutation<Venue, Error, VenueCreate>({
    mutationFn: (data) => createVenue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      showAlert({
        type: "success",
        title: "Establecimiento creado",
        message: "El establecimiento ha sido registrado exitosamente.",
      });
      router.back();
    },
    onError: (e) => {
      showAlert({
        type: "error",
        title: "Error",
        message: e.message || "No se pudo crear el establecimiento. Intenta de nuevo.",
      });
    },
  });

  const updateMutation = useMutation<Venue, Error, { id: string; data: VenueUpdate }>({
    mutationFn: ({ id: venueId, data }) => updateVenue(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue", id] });
      showAlert({
        type: "success",
        title: "Actualizado",
        message: "El establecimiento ha sido actualizado exitosamente.",
      });
      router.back();
    },
    onError: (e) => {
      showAlert({
        type: "error",
        title: "Error",
        message: e.message || "No se pudo actualizar el establecimiento.",
      });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (venueId) => deleteVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.removeQueries({ queryKey: ["venue", id] });
      showAlert({
        type: "success",
        title: "Eliminado",
        message: "El establecimiento ha sido eliminado.",
        onButtonPress: () => router.replace("/establecimientos"),
      });
    },
    onError: (e) => {
      showAlert({
        type: "error",
        title: "Error",
        message: e.message || "No se pudo eliminar el establecimiento.",
      });
    },
  });

  const updateField = (field: keyof VenueFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) => ({ ...prev, [amenity]: !prev[amenity] }));
  };

  const getActiveAmenities = (): Record<string, boolean> => {
    const active: Record<string, boolean> = {};
    Object.entries(amenities).forEach(([key, value]) => {
      if (value) active[key] = true;
    });
    return active;
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showAlert({ type: "error", title: "Error", message: "El nombre es requerido." });
      return;
    }
    if (!formData.address.trim()) {
      showAlert({ type: "error", title: "Error", message: "La dirección es requerida." });
      return;
    }
    if (
      formData.name.trim().length > 150 ||
      formData.address.trim().length > 255 ||
      formData.discount_coupon.trim().length > 50
    ) {
      showAlert({
        type: "error",
        title: "Texto demasiado largo",
        message: "Nombre: máx. 150, dirección: máx. 255 y cupón: máx. 50 caracteres.",
      });
      return;
    }

    // En edición se envía null para poder quitar un cupón o descripción ya guardados
    const clearValue = mode === "edit" ? (null as unknown as undefined) : undefined;
    const venueData = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      amenities: getActiveAmenities(),
      discount_coupon: formData.discount_coupon.trim() || clearValue,
      discount_description: formData.discount_description.trim() || clearValue,
    };

    if (mode === "edit" && id) {
      updateMutation.mutate({ id, data: venueData });
    } else {
      createMutation.mutate(venueData);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    showAlert({
      type: "warning",
      title: "Eliminar establecimiento",
      message: "¿Estás seguro de que deseas eliminar este establecimiento? Esta acción no se puede deshacer.",
      showCancel: true,
      cancelText: "Cancelar",
      buttonText: "Eliminar",
      onButtonPress: () => deleteMutation.mutate(id),
    });
  };

  return {
    formData,
    amenities,
    updateField,
    toggleAmenity,
    handleSubmit,
    handleDelete,
    isLoadingVenue,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    existingVenue,
  };
}
