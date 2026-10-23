/**
 * useApplyForm — formulario de solicitud de adopción (`(app)/adopciones/solicitar/[id]`).
 * Espejo de `mobile/src/hooks/adopciones/useApplyForm.ts`.
 */
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getListing, requestAdoption, type AdoptionRequestCreate } from "@/services/adopciones";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/components/AppAlert";

export function useApplyForm() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<
    Partial<Record<"applicant_name" | "hours_alone" | "landlord_permission" | "reason" | "financial_commitment", string>>
  >({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<AdoptionRequestCreate>({
    applicant_name: user?.full_name || "",
    house_type: "Casa",
    has_yard: false,
    own_or_rent: "Propia",
    landlord_permission: false,
    other_pets: "",
    has_children: false,
    children_ages: "",
    hours_alone: 4,
    financial_commitment: false,
    reason: "",
    previous_experience: "",
  });

  const { data: listing, isLoading: loadingListing } = useQuery({
    queryKey: ["adopcion", id],
    queryFn: () => getListing(id!),
    enabled: !!id,
  });

  // Un admin modera las adopciones; no postula desde el portal público
  const isAdmin = user?.role_name === "admin";
  const isVerified = user?.verification_status === "VERIFIED";
  const isPending = user?.verification_status === "PENDING";

  const updateField = <K extends keyof AdoptionRequestCreate>(field: K, value: AdoptionRequestCreate[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleNext = () => {
    if (step === 1) {
      const next: typeof errors = {};
      if (!form.applicant_name?.trim()) next.applicant_name = "Escribe tu nombre completo.";
      if (form.own_or_rent === "Renta" && !form.landlord_permission) {
        next.landlord_permission = "Si rentas, necesitas el permiso de tu arrendador para tener mascotas.";
      }
      setErrors(next);
      if (Object.keys(next).length === 0) setStep(2);
    } else if (step === 2) {
      const h = Number(form.hours_alone);
      if (!Number.isFinite(h) || h < 0 || h > 24) {
        setErrors({ hours_alone: "Entre 0 y 24 horas." });
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step > 1) setStep(step - 1);
    else if (window.history.length > 1) router.back();
    else router.replace(`/adopciones/mascota/${id}`);
  };

  const handleSubmit = async () => {
    const next: typeof errors = {};
    if (!form.reason?.trim()) next.reason = "Cuéntanos por qué quieres adoptar.";
    if (!form.financial_commitment) next.financial_commitment = "Acepta el compromiso para continuar.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await requestAdoption(id!, form);
      queryClient.invalidateQueries({ queryKey: ["my-adoption-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["adopcion", id] });
      setSuccess(true);
    } catch (error) {
      showAlert({
        type: "error",
        title: "No se pudo enviar la solicitud",
        message: (error as Error).message || "Inténtalo de nuevo en unos minutos.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    listing,
    loadingListing,
    form,
    step,
    errors,
    loading,
    success,
    user,
    isAdmin,
    isVerified,
    isPending,
    updateField,
    handleNext,
    handleBack,
    handleSubmit,
  };
}
