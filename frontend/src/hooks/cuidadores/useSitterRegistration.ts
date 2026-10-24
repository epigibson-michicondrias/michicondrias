/**
 * useSitterRegistration — alta de cuidador (`(app)/cuidadores/registro`).
 * Espejo del formulario legacy con los servicios nuevos.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { registerAsSitter, type Sitter } from "@/services/cuidadores";
import { showAlert } from "@/components/AppAlert";
import { errorMessage } from "@/features/servicios-pro/requestStatus";
import { uploadProPhoto } from "@/features/servicios-pro/uploads";

export interface SitterFormState {
  display_name: string;
  bio: string;
  location: string;
  service_type: string;
  home_type: string;
  price_per_day: string;
  price_per_visit: string;
  experience_years: string;
  max_pets: string;
  has_yard: boolean;
  accepts_dogs: boolean;
  accepts_cats: boolean;
}

const INITIAL: SitterFormState = {
  display_name: "",
  bio: "",
  location: "",
  service_type: "both",
  home_type: "Casa",
  price_per_day: "",
  price_per_visit: "",
  experience_years: "",
  max_pets: "1",
  has_yard: false,
  accepts_dogs: true,
  accepts_cats: true,
};

export const SERVICE_TYPE_OPTIONS = [
  { label: "Hospedaje", value: "hosting" },
  { label: "Visitas a domicilio", value: "visiting" },
  { label: "Ambos", value: "both" },
];

export const HOME_TYPE_OPTIONS = [
  { label: "Casa", value: "Casa" },
  { label: "Departamento", value: "Departamento" },
  { label: "Otro", value: "Otro" },
];

function num(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function useSitterRegistration() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SitterFormState>(INITIAL);
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SitterFormState, string>>>({});

  const updateField = <K extends keyof SitterFormState>(key: K, value: SitterFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: Partial<Record<keyof SitterFormState, string>> = {};
    if (!form.display_name.trim()) next.display_name = "Escribe el nombre que verán tus clientes.";
    if (form.price_per_day.trim() !== "" && num(form.price_per_day) === null) next.price_per_day = "Debe ser un número mayor o igual a 0.";
    if (form.price_per_visit.trim() !== "" && num(form.price_per_visit) === null) next.price_per_visit = "Debe ser un número mayor o igual a 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const photoKey = await uploadProPhoto("sit", image);
      const payload: Partial<Sitter> = {
        display_name: form.display_name.trim(),
        bio: form.bio.trim() || undefined,
        location: form.location.trim() || undefined,
        photo_url: photoKey || undefined,
        price_per_day: num(form.price_per_day),
        price_per_visit: num(form.price_per_visit),
        service_type: form.service_type,
        home_type: form.home_type || undefined,
        max_pets: num(form.max_pets) ?? 1,
        has_yard: form.has_yard,
        accepts_dogs: form.accepts_dogs,
        accepts_cats: form.accepts_cats,
        experience_years: num(form.experience_years) ?? 0,
      };
      await registerAsSitter(payload);
      queryClient.invalidateQueries({ queryKey: ["sitters"] });
      queryClient.invalidateQueries({ queryKey: ["my-sitter-profile"] });
      showAlert({
        type: "success",
        title: "¡Registro enviado!",
        message: "Ya formas parte de los cuidadores. Tu perfil estará visible en el listado.",
      });
      router.push("/cuidadores");
    } catch (e) {
      showAlert({ type: "error", title: "No se pudo registrar", message: errorMessage(e, "No se pudo registrar como cuidador.") });
    } finally {
      setSaving(false);
    }
  };

  return { form, errors, image, saving, updateField, setImage, handleSave };
}
