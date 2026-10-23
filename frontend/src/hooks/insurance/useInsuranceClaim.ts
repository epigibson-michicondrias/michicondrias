/**
 * useInsuranceClaim — reclamo de seguro (`(app)/aseguradoras/reclamo/nuevo`).
 * Espejo de `mobile/src/hooks/insurance/useInsuranceClaim.ts`. Acepta `?pet_id=`.
 */
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { createClaim, getActivePolicyByPet } from "@/services/insurance";
import type { InsuranceClaimCreate, InsuranceClaim, PetInsurancePolicy } from "@/services/insurance";
import { getUserPets, getMascotasPresignedUrl } from "@/services/mascotas";
import { getFileExtension, getS3Url } from "@/utils/helpers";
import { uploadImageToPresignedUrl } from "@/utils/upload";
import type { Pet } from "@/types/mascotas";
import { showAlert } from "@/components/AppAlert";

export interface ClaimFormData {
  reason: string;
  amount_claimed: string;
}

const CLAIM_FORM_DEFAULTS: ClaimFormData = {
  reason: "",
  amount_claimed: "",
};

export function useInsuranceClaim() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<ClaimFormData>({ ...CLAIM_FORM_DEFAULTS });
  const [selectedPetId, setSelectedPetId] = useState<string | null>(() => searchParams.get("pet_id"));
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateField = <K extends keyof ClaimFormData>(field: K, value: ClaimFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const {
    data: pets = [],
    isLoading: isLoadingPets,
  } = useQuery<Pet[]>({
    queryKey: ["user-pets", user?.id],
    queryFn: () => (user?.id ? getUserPets(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });

  const {
    data: activePolicy,
    isLoading: isLoadingPolicy,
  } = useQuery<PetInsurancePolicy | null>({
    queryKey: ["petPolicy", selectedPetId],
    queryFn: async () => {
      if (!selectedPetId) return null;
      try {
        return await getActivePolicyByPet(selectedPetId);
      } catch {
        return null;
      }
    },
    enabled: !!selectedPetId,
  });

  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? null;

  const claimMutation = useMutation<InsuranceClaim, Error, InsuranceClaimCreate>({
    mutationFn: (data) => createClaim(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insuranceClaims"] });
      queryClient.invalidateQueries({ queryKey: ["insurancePolicies"] });
      showAlert({
        type: "success",
        title: "¡Reclamo enviado!",
        message:
          "La aseguradora revisará tu reclamo y te avisaremos cuando lo resuelva. Puedes seguirlo en Mis Pólizas.",
        onButtonPress: () => router.replace("/aseguradoras/mis-polizas"),
      });
      setForm({ ...CLAIM_FORM_DEFAULTS });
      setReceiptFile(null);
    },
    onError: (e) => {
      showAlert({
        type: "error",
        title: "No pudimos enviar el reclamo",
        message: e.message || "Inténtalo de nuevo.",
      });
    },
  });

  const uploadReceipt = async (): Promise<string | undefined> => {
    if (!receiptFile) return undefined;
    const ext = getFileExtension(receiptFile.name) || "jpg";
    const { url, object_key } = await getMascotasPresignedUrl(ext);
    await uploadImageToPresignedUrl(URL.createObjectURL(receiptFile), url, ext);
    return getS3Url(object_key);
  };

  const handleSubmit = async () => {
    if (!activePolicy) {
      showAlert({
        type: "error",
        title: "Sin póliza",
        message: "La mascota seleccionada no tiene una póliza activa.",
      });
      return;
    }
    if (!form.reason.trim()) {
      showAlert({ type: "error", title: "Falta el motivo", message: "Describe el motivo del reclamo." });
      return;
    }
    const amount = parseFloat(form.amount_claimed.replace(",", "."));
    if (!form.amount_claimed || Number.isNaN(amount) || amount <= 0) {
      showAlert({
        type: "error",
        title: "Monto inválido",
        message: "Ingresa un monto reclamado mayor a cero.",
      });
      return;
    }

    let receiptUrl: string | undefined;
    if (receiptFile) {
      setIsUploading(true);
      try {
        receiptUrl = await uploadReceipt();
      } catch {
        showAlert({
          type: "error",
          title: "No se pudo subir el comprobante",
          message: "Revisa tu conexión e inténtalo de nuevo.",
        });
        return;
      } finally {
        setIsUploading(false);
      }
    }

    claimMutation.mutate({
      policy_id: activePolicy.id,
      amount_claimed: amount,
      reason: form.reason.trim(),
      medical_receipt_url: receiptUrl,
    });
  };

  return {
    form,
    updateField,
    pets,
    selectedPetId,
    selectedPet,
    activePolicy,
    isLoading: isLoadingPets,
    isLoadingPolicy,
    isSubmitting: claimMutation.isPending || isUploading,
    receiptFile,
    setReceiptFile,
    setSelectedPetId,
    handleSubmit,
  };
}
