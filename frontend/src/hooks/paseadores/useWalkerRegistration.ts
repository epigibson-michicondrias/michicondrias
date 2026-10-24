/**
 * useWalkerRegistration — alta de paseador (`(app)/paseadores/registro`).
 * Espejo del formulario legacy con los servicios nuevos.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { registerAsWalker, type Walker } from "@/services/paseadores";
import { showAlert } from "@/components/AppAlert";
import { errorMessage } from "@/features/servicios-pro/requestStatus";
import { uploadProPhoto } from "@/features/servicios-pro/uploads";

export interface WalkerFormState {
  display_name: string;
  bio: string;
  location: string;
  price_per_walk: string;
  price_per_hour: string;
  experience_years: string;
  max_pets_per_walk: string;
  service_radius_km: string;
  schedule_preference: string;
  accepts_dogs: boolean;
  accepts_cats: boolean;
}

const INITIAL: WalkerFormState = {
  display_name: "",
  bio: "",
  location: "",
  price_per_walk: "",
  price_per_hour: "",
  experience_years: "",
  max_pets_per_walk: "3",
  service_radius_km: "5",
  schedule_preference: "Flexible",
  accepts_dogs: true,
  accepts_cats: false,
};

export const SCHEDULE_OPTIONS = [
  { label: "Mañanas", value: "Mañanas" },
  { label: "Tardes", value: "Tardes" },
  { label: "Flexible", value: "Flexible" },
];

function num(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function useWalkerRegistration() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<WalkerFormState>(INITIAL);
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof WalkerFormState, string>>>({});

  const updateField = <K extends keyof WalkerFormState>(key: K, value: WalkerFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: Partial<Record<keyof WalkerFormState, string>> = {};
    if (!form.display_name.trim()) next.display_name = "Escribe el nombre que verán tus clientes.";
    if (form.price_per_walk.trim() !== "" && num(form.price_per_walk) === null) next.price_per_walk = "Debe ser un número mayor o igual a 0.";
    if (form.price_per_hour.trim() !== "" && num(form.price_per_hour) === null) next.price_per_hour = "Debe ser un número mayor o igual a 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const photoKey = await uploadProPhoto("walk", image);
      const payload: Partial<Walker> = {
        display_name: form.display_name.trim(),
        bio: form.bio.trim() || undefined,
        location: form.location.trim() || undefined,
        photo_url: photoKey || undefined,
        price_per_walk: num(form.price_per_walk),
        price_per_hour: num(form.price_per_hour),
        experience_years: num(form.experience_years) ?? 0,
        accepts_dogs: form.accepts_dogs,
        accepts_cats: form.accepts_cats,
        max_pets_per_walk: num(form.max_pets_per_walk) ?? 3,
        service_radius_km: num(form.service_radius_km) ?? 5,
        schedule_preference: form.schedule_preference || undefined,
      };
      await registerAsWalker(payload);
      queryClient.invalidateQueries({ queryKey: ["walkers"] });
      queryClient.invalidateQueries({ queryKey: ["my-walker-profile"] });
      showAlert({
        type: "success",
        title: "¡Registro enviado!",
        message: "Ya formas parte de los paseadores. Tu perfil estará visible en el listado.",
      });
      router.push("/paseadores");
    } catch (e) {
      showAlert({ type: "error", title: "No se pudo registrar", message: errorMessage(e, "No se pudo registrar como paseador.") });
    } finally {
      setSaving(false);
    }
  };

  return { form, errors, image, saving, updateField, setImage, handleSave };
}
