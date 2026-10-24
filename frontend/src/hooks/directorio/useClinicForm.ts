/**
 * useClinicForm — registrar un consultorio o clínica en el directorio (veterinario u hospital).
 * Un admin lo revisa antes de publicarlo. Espejo de `mobile/src/hooks/directorio/useClinicForm.ts`.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/AppAlert";
import { createClinic } from "@/services/directorio";

export interface ClinicFormState {
  name: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  description: string;
  is_24_hours: boolean;
  has_emergency: boolean;
}

type Errors = Partial<Record<"name" | "city" | "phone" | "website", string>>;

export function useClinicForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState<ClinicFormState>({
    name: "",
    address: "",
    city: "",
    phone: "",
    website: "",
    description: "",
    is_24_hours: false,
    has_emergency: false,
  });

  const updateField = <K extends keyof ClinicFormState>(field: K, value: ClinicFormState[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field as keyof Errors]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const mutation = useMutation({
    mutationFn: () => {
      const site = form.website.trim();
      return createClinic({
        ...form,
        name: form.name.trim(),
        address: form.address.trim() || null,
        city: form.city.trim(),
        phone: form.phone.trim(),
        website: site ? (/^https?:\/\//i.test(site) ? site : `https://${site}`) : null,
        description: form.description.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-clinics"] });
      queryClient.invalidateQueries({ queryKey: ["hospital-clinics"] });
      showAlert({
        type: "success",
        title: "Registro enviado",
        message: "Un administrador revisará la información. Te avisaremos cuando aparezca en el directorio.",
        onButtonPress: () => router.push("/mi-clinica"),
      });
    },
    onError: (e: Error) =>
      showAlert({ type: "error", title: "No se pudo registrar", message: e.message || "Inténtalo de nuevo." }),
  });

  const handleSubmit = () => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Escribe el nombre.";
    if (!form.city.trim()) next.city = "Escribe la ciudad.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "10 dígitos.";
    if (form.website.trim() && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(form.website.trim()))
      next.website = "Revisa el enlace.";
    setErrors(next);
    if (Object.keys(next).length === 0) mutation.mutate();
  };

  return { form, errors, updateField, handleSubmit, saving: mutation.isPending };
}
