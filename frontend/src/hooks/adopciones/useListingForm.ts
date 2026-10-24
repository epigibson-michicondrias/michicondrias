/**
 * useListingForm — publicar o editar mascota en adopción (`(app)/adopciones/nuevo`).
 * Espejo de `mobile/src/hooks/adopciones/useListingForm.ts` con `File` del navegador.
 */
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  createListing,
  updateListing,
  getAdopcionesPresignedUrl,
} from "@/services/adopciones";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/components/AppAlert";
import { getS3Url, getFileExtension } from "@/utils/helpers";
import { uploadImageToPresignedUrl } from "@/utils/upload";

export interface ListingFormState {
  name: string;
  species: string;
  breed: string;
  age_months: string;
  gender: string;
  size: string;
  location: string;
  description: string;
  is_emergency: boolean;
  is_vaccinated: boolean;
  is_sterilized: boolean;
  is_dewormed: boolean;
  social_cats: boolean;
  social_dogs: boolean;
  social_children: boolean;
  temperament: string;
  energy_level: string;
}

const INITIAL_FORM: ListingFormState = {
  name: "",
  species: "perro",
  breed: "",
  age_months: "",
  gender: "macho",
  size: "Mediano",
  location: "",
  description: "",
  is_emergency: false,
  is_vaccinated: false,
  is_sterilized: false,
  is_dewormed: false,
  social_cats: true,
  social_dogs: true,
  social_children: true,
  temperament: "",
  energy_level: "Media",
};

export function useListingForm() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [form, setForm] = useState<ListingFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<"name" | "age_months" | "location", string>>>({});

  const updateField = <K extends keyof ListingFormState>(field: K, value: ListingFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleField = (field: keyof ListingFormState) => {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const setImageFile = (file: File | null) => {
    setImage(file ? { file, preview: URL.createObjectURL(file) } : null);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!image) return null;
    const ext = getFileExtension(image.file.name) || "jpg";
    const { url, object_key } = await getAdopcionesPresignedUrl(ext);
    await uploadImageToPresignedUrl(image.preview, url, ext);
    return getS3Url(object_key);
  };

  const handleSave = async () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Escribe su nombre.";
    if (form.age_months.trim() && (!/^\d+$/.test(form.age_months.trim()) || parseInt(form.age_months, 10) > 480))
      next.age_months = "En meses, de 0 a 480.";
    if (!form.location.trim()) next.location = "Indica la ciudad o zona donde está.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !user) return;

    setLoading(true);
    try {
      const photo_url = await uploadImage();
      const payload = {
        ...form,
        age_months: form.age_months.trim() ? parseInt(form.age_months, 10) : null,
        photo_url,
      };
      if (editId) {
        await updateListing(editId, payload);
      } else {
        await createListing({ ...payload, published_by: user.id });
      }
      queryClient.invalidateQueries({ queryKey: ["adopciones-listings"] });
      queryClient.invalidateQueries({ queryKey: ["my-adopciones"] });
      showAlert({
        type: "success",
        title: editId ? "Cambios guardados" : "Publicación enviada",
        message:
          "Un administrador la revisará y, al aprobarla, aparecerá en el listado de adopción. Puedes ver su estado en Mis publicaciones.",
      });
      router.back();
    } catch (error) {
      showAlert({
        type: "error",
        title: editId ? "No se pudieron guardar los cambios" : "No se pudo crear la publicación",
        message: error instanceof Error ? error.message : "Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    image,
    loading,
    errors,
    isEditing: !!editId,
    updateField,
    toggleField,
    setImageFile,
    handleSave,
  };
}
