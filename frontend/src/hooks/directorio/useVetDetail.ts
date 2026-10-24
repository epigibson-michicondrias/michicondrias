/**
 * useVetDetail — perfil del especialista: datos, clínica donde atiende y servicios.
 * Espejo de `mobile/src/hooks/directorio/useVetDetail.ts`.
 */
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getVet, getClinic, getClinicServices } from "@/services/directorio";
import { showAlert } from "@/components/AppAlert";
import { useAuth } from "@/contexts/AuthContext";
import { openExternalUrl, shareContent } from "@/features/directorio/links";

export function useVetDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const vetId = params.id;

  const {
    data: specialist,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["vet", vetId],
    queryFn: () => getVet(vetId),
    enabled: !!vetId,
  });
  const clinicId = specialist?.clinic_id;

  const { data: clinic, isLoading: isLoadingClinic } = useQuery({
    queryKey: ["clinic", clinicId],
    queryFn: () => getClinic(clinicId!),
    enabled: !!clinicId,
  });

  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["clinic-services", clinicId],
    queryFn: () => getClinicServices(clinicId!),
    enabled: !!clinicId,
  });

  const phoneDigits = specialist?.phone?.replace(/\D/g, "") ?? "";
  const fullName = specialist
    ? [specialist.first_name, specialist.last_name].filter(Boolean).join(" ").trim() || "Especialista"
    : "";
  const specialtyLabel = specialist?.specialty?.trim()
    ? specialist.specialty.trim().replace(/^./, (c) => c.toUpperCase())
    : "Médico veterinario";
  const avatarLetter = (specialist?.first_name || specialist?.last_name || fullName || "?").charAt(0).toUpperCase();

  return {
    vetId,
    fullName,
    specialtyLabel,
    avatarLetter,
    call: phoneDigits ? () => openExternalUrl(`tel:${phoneDigits}`) : undefined,
    whatsapp: phoneDigits
      ? () => openExternalUrl(`https://wa.me/${phoneDigits.length === 10 ? `52${phoneDigits}` : phoneDigits}`)
      : undefined,
    share: () =>
      specialist &&
      shareContent(fullName, `${fullName} — ${specialtyLabel}. Lo encontré en Michicondrias 🐾`),
    /** Solo se agenda en línea con quien atiende en una clínica con servicios (el backend exige clínica y servicio). */
    canBook: !!specialist?.clinic_id && services.length > 0,
    book: (serviceId?: string) => {
      if (!specialist?.clinic_id) return;
      const qs = new URLSearchParams({ vet_id: specialist.id });
      if (serviceId) qs.set("service_id", serviceId);
      router.push(`/directorio/citas/agendar/${specialist.clinic_id}?${qs.toString()}`);
    },
    openClinic: () => clinic && router.push(`/directorio/clinica/${clinic.id}`),
    goBack: () => (window.history.length > 1 ? router.back() : router.replace("/directorio")),
    /** El propio veterinario no se reseña a sí mismo (el backend responde 403). */
    canReview: !!user && !!specialist && specialist.user_id !== user.id,
    specialist,
    isLoading,
    isError,
    refetch,
    clinic,
    isLoadingClinic,
    services,
    isLoadingServices,
  };
}
