/**
 * useServiceProfile — edición del perfil profesional de paseador o cuidador (`(app)/servicios-pro/perfil`).
 * Espejo de `mobile/src/hooks/servicios-pro/useServiceProfile.ts`. El formulario parte del perfil guardado y solo
 * guarda en estado los campos que el usuario cambia.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/AppAlert";
import { getMyWalkerProfile, updateWalker } from "@/services/paseadores";
import { getMySitterProfile, updateSitter } from "@/services/cuidadores";
import { useProRole } from "@/features/servicios-pro/useProRole";
import { errorMessage } from "@/features/servicios-pro/requestStatus";

export interface ServiceProfileForm {
  display_name: string;
  bio: string;
  location: string;
  price_a: string;
  price_b: string;
  is_active: boolean;
  accepts_dogs: boolean;
  accepts_cats: boolean;
}

const str = (v?: number | null) => (v == null ? "" : String(v));

function num(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function useServiceProfile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isWalker, isSitter } = useProRole();
  const [edits, setEdits] = useState<Partial<ServiceProfileForm>>({});
  const [saving, setSaving] = useState(false);

  const walkerQuery = useQuery({ queryKey: ["my-walker-profile"], queryFn: getMyWalkerProfile, enabled: isWalker });
  const sitterQuery = useQuery({ queryKey: ["my-sitter-profile"], queryFn: getMySitterProfile, enabled: isSitter });
  const walker = isWalker ? walkerQuery.data : undefined;
  const sitter = isSitter ? sitterQuery.data : undefined;
  const profile = walker ?? sitter;

  const base: ServiceProfileForm = {
    display_name: profile?.display_name ?? "",
    bio: profile?.bio ?? "",
    location: profile?.location ?? "",
    price_a: walker ? str(walker.price_per_walk) : str(sitter?.price_per_day),
    price_b: walker ? str(walker.price_per_hour) : str(sitter?.price_per_visit),
    is_active: profile?.is_active ?? true,
    accepts_dogs: profile?.accepts_dogs ?? true,
    accepts_cats: profile?.accepts_cats ?? true,
  };
  const form: ServiceProfileForm = { ...base, ...edits };

  const updateField = <K extends keyof ServiceProfileForm>(key: K, value: ServiceProfileForm[K]) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.display_name.trim()) {
      showAlert({ type: "error", title: "Falta el nombre", message: "Escribe el nombre que verán tus clientes." });
      return;
    }
    if ([form.price_a, form.price_b].some((v) => v.trim() !== "" && num(v) === null)) {
      showAlert({ type: "error", title: "Tarifa inválida", message: "Las tarifas deben ser números mayores o iguales a 0." });
      return;
    }
    const common = {
      display_name: form.display_name.trim(),
      bio: form.bio.trim() || null,
      location: form.location.trim() || null,
      is_active: form.is_active,
      accepts_dogs: form.accepts_dogs,
      accepts_cats: form.accepts_cats,
    };
    setSaving(true);
    try {
      if (walker) {
        await updateWalker(walker.id, { ...common, price_per_walk: num(form.price_a), price_per_hour: num(form.price_b) });
        queryClient.invalidateQueries({ queryKey: ["my-walker-profile"] });
        queryClient.invalidateQueries({ queryKey: ["walkers"] });
        queryClient.invalidateQueries({ queryKey: ["walker"] });
      } else if (sitter) {
        await updateSitter(sitter.id, { ...common, price_per_day: num(form.price_a), price_per_visit: num(form.price_b) });
        queryClient.invalidateQueries({ queryKey: ["my-sitter-profile"] });
        queryClient.invalidateQueries({ queryKey: ["sitters"] });
        queryClient.invalidateQueries({ queryKey: ["sitter"] });
      }
      setEdits({});
      showAlert({ type: "success", title: "Perfil guardado", message: "Tus cambios ya son visibles para los clientes." });
      router.back();
    } catch (e) {
      showAlert({ type: "error", title: "No se pudo guardar", message: errorMessage(e, "No se pudo guardar el perfil.") });
    } finally {
      setSaving(false);
    }
  };

  return {
    isWalker,
    hasProfile: !!profile,
    /** Sello «Verificado» que un admin activó (X3). */
    isVerified: !!profile?.is_verified,
    isSuspended: profile?.is_active === false,
    form,
    updateField,
    saving,
    isLoading: walkerQuery.isLoading || sitterQuery.isLoading,
    handleSave,
  };
}
