/**
 * useGroomingProvider — panel del estilista (`(app)/grooming/gestion`): citas, fotos/reporte y estados.
 * Espejo de `mobile/src/hooks/grooming/useGroomingProvider.ts` con subida vía `File` del navegador.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/AppAlert";
import {
  getProviderAppointments,
  updateAppointmentPhotos,
  updateAppointmentStatus,
} from "@/services/grooming";
import type { GroomingAppointment, GroomingAppointmentUpdatePhotos } from "@/services/grooming";
import { getMascotasPresignedUrl } from "@/services/mascotas";
import { getS3Url, getFileExtension } from "@/utils/helpers";
import { uploadImageToPresignedUrl } from "@/utils/upload";

export type ProviderFilter = "all" | "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export interface ProviderPhotoPayload extends GroomingAppointmentUpdatePhotos {
  /** Foto nueva del navegador; si viene, se sube y su URL reemplaza la del campo equivalente. */
  beforeFile?: File | null;
  afterFile?: File | null;
}

export function useGroomingProvider() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ProviderFilter>("all");

  const {
    data: appointments = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery<GroomingAppointment[]>({
    queryKey: ["grooming-provider-appointments"],
    queryFn: () => getProviderAppointments(),
  });

  const filteredAppointments = useMemo(() => {
    if (filter === "all") return appointments;
    return appointments.filter((a) => (a.status === "pending" ? "scheduled" : a.status) === filter);
  }, [appointments, filter]);

  const photoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GroomingAppointmentUpdatePhotos }) =>
      updateAppointmentPhotos(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grooming-provider-appointments"] });
      showAlert({
        type: "success",
        title: "¡Actualizado!",
        message: "Las fotos y reporte se guardaron correctamente.",
      });
    },
    onError: (e) => {
      showAlert({
        type: "error",
        title: "Error",
        message: errorMessage(e, "No se pudieron guardar los cambios."),
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grooming-provider-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["grooming-client-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["grooming-slots"] });
    },
    onError: (e) =>
      showAlert({ type: "error", title: "No se pudo actualizar", message: errorMessage(e, "Inténtalo de nuevo.") }),
  });

  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.match(/\.(\w+)$/)?.[1]?.toLowerCase() || getFileExtension(file.name) || "jpg";
    const { url, object_key } = await getMascotasPresignedUrl(ext);
    await uploadImageToPresignedUrl(URL.createObjectURL(file), url, ext);
    return getS3Url(object_key);
  };

  const updatePhotos = async (appointmentId: string, data: ProviderPhotoPayload) => {
    try {
      const before = data.beforeFile ? await uploadFile(data.beforeFile) : data.before_photo_url;
      const after = data.afterFile ? await uploadFile(data.afterFile) : data.after_photo_url;
      photoMutation.mutate({
        id: appointmentId,
        data: {
          before_photo_url: before || undefined,
          after_photo_url: after || undefined,
          skin_report: data.skin_report,
          status: data.status,
        },
      });
    } catch (e) {
      showAlert({
        type: "error",
        title: "No se pudo subir la foto",
        message: errorMessage(e, "Revisa tu conexión e inténtalo de nuevo."),
      });
    }
  };

  const updateStatus = (appointmentId: string, status: string) => {
    statusMutation.mutate({ id: appointmentId, status });
  };

  return {
    appointments: filteredAppointments,
    allAppointments: appointments,
    filter,
    isLoading,
    isRefetching,
    isUpdating: photoMutation.isPending || statusMutation.isPending,
    setFilter,
    refetch,
    updatePhotos,
    updateStatus,
  };
}
