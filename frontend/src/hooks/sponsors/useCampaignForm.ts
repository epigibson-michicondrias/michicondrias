/**
 * useCampaignForm — alta de campaña (`nueva-campana`) e impulso de alerta (`boost-alerta`).
 * Espejo de `mobile/src/hooks/sponsors/useCampaignForm.ts`, con validación por campo.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/AppAlert";
import {
  createBoostedAlert,
  createCampaign,
  type BoostedAlert,
  type BoostedAlertCreate,
  type SponsorCampaign,
  type SponsorCampaignCreate,
} from "@/services/sponsors";
import { getReports, type LostPetReport } from "@/services/perdidas";
import { errorMessage } from "@/features/servicios-pro/requestStatus";

export interface CampaignFormData {
  title: string;
  banner_url: string;
  target_link: string;
  budget_limit: string;
}

export interface BoostFormData {
  lost_pet_report_id: string;
  extra_radius_meters: string;
  amount_paid: string;
}

type Errors<T> = Partial<Record<keyof T, string>>;

const isUrl = (v: string) => /^https?:\/\/\S+$/i.test(v.trim());

export function useCampaignForm(mode: "campaign" | "boost" = "campaign") {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [campaignForm, setCampaignForm] = useState<CampaignFormData>({
    title: "",
    banner_url: "",
    target_link: "",
    budget_limit: "",
  });
  const [campaignErrors, setCampaignErrors] = useState<Errors<CampaignFormData>>({});

  const [boostForm, setBoostForm] = useState<BoostFormData>({
    lost_pet_report_id: "",
    extra_radius_meters: "5000",
    amount_paid: "",
  });
  const [boostErrors, setBoostErrors] = useState<Errors<BoostFormData>>({});

  const { data: lostPetReports = [], isLoading: isLoadingReports } = useQuery<LostPetReport[]>({
    queryKey: ["lost-pet-reports-active"],
    queryFn: () => getReports("lost", "active"),
    enabled: mode === "boost",
  });

  const createCampaignMutation = useMutation<SponsorCampaign, Error, SponsorCampaignCreate>({
    mutationFn: (data) => createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsor-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-stats"] });
      showAlert({ type: "success", title: "¡Campaña creada!", message: "Tu campaña ya aparece en el listado." });
      router.push("/patrocinadores/estadisticas");
    },
    onError: (e) => {
      showAlert({ type: "error", title: "No se pudo crear", message: errorMessage(e, "Intenta de nuevo.") });
    },
  });

  const createBoostMutation = useMutation<BoostedAlert, Error, BoostedAlertCreate>({
    mutationFn: (data) => createBoostedAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsor-campaigns"] });
      showAlert({
        type: "success",
        title: "Impulso registrado",
        message:
          "Registramos tu impulso. La difusión ampliada a usuarios cercanos aún no está activa y el cobro no se procesa en la plataforma.",
      });
      router.back();
    },
    onError: (e) => {
      showAlert({ type: "error", title: "No se pudo impulsar", message: errorMessage(e, "Intenta de nuevo.") });
    },
  });

  const updateCampaignField = (field: keyof CampaignFormData, value: string) => {
    setCampaignForm((prev) => ({ ...prev, [field]: value }));
    setCampaignErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateBoostField = (field: keyof BoostFormData, value: string) => {
    setBoostForm((prev) => ({ ...prev, [field]: value }));
    setBoostErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmitCampaign = () => {
    const next: Errors<CampaignFormData> = {};
    if (!campaignForm.title.trim()) next.title = "Escribe el nombre de la campaña.";
    if (!isUrl(campaignForm.banner_url)) next.banner_url = "Pega la URL de la imagen (https://...).";
    if (campaignForm.target_link.trim() && !isUrl(campaignForm.target_link))
      next.target_link = "El enlace debe empezar con https://";
    if (!(Number(campaignForm.budget_limit) > 0)) next.budget_limit = "El presupuesto debe ser mayor a 0.";
    setCampaignErrors(next);
    if (Object.keys(next).length) return;

    createCampaignMutation.mutate({
      title: campaignForm.title.trim(),
      banner_url: campaignForm.banner_url.trim(),
      target_link: campaignForm.target_link.trim() || undefined,
      budget_limit: Number(campaignForm.budget_limit),
    });
  };

  const handleSubmitBoost = () => {
    const next: Errors<BoostFormData> = {};
    if (!boostForm.lost_pet_report_id) next.lost_pet_report_id = "Selecciona un reporte de mascota perdida.";
    if (boostForm.extra_radius_meters.trim() && !(Number(boostForm.extra_radius_meters) > 0))
      next.extra_radius_meters = "El radio debe ser mayor a 0.";
    if (!(Number(boostForm.amount_paid) > 0)) next.amount_paid = "El monto debe ser mayor a 0.";
    setBoostErrors(next);
    if (Object.keys(next).length) return;

    createBoostMutation.mutate({
      lost_pet_report_id: boostForm.lost_pet_report_id,
      extra_radius_meters: Number(boostForm.extra_radius_meters) || undefined,
      amount_paid: Number(boostForm.amount_paid),
    });
  };

  return {
    campaignForm,
    campaignErrors,
    updateCampaignField,
    handleSubmitCampaign,
    isSubmittingCampaign: createCampaignMutation.isPending,
    boostForm,
    boostErrors,
    updateBoostField,
    handleSubmitBoost,
    isSubmittingBoost: createBoostMutation.isPending,
    lostPetReports,
    isLoadingReports,
  };
}
