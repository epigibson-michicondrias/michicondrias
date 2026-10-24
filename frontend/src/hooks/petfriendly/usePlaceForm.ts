/**
 * usePlaceForm — alta de lugar pet-friendly (`(app)/petfriendly/nuevo`).
 * Espejo de la lógica de `mobile/app/petfriendly/nuevo.tsx` con `File` del navegador y geolocalización web.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createPlace, getPetfriendlyPresignedUrl } from "@/services/petfriendly";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/components/AppAlert";
import { getS3Url, getFileExtension } from "@/utils/helpers";
import { uploadImageToPresignedUrl } from "@/utils/upload";

export interface PlaceFormState {
  name: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  description: string;
  pet_sizes_allowed: string;
  has_water_bowls: "Sí" | "No";
  has_pet_menu: "Sí" | "No";
}

const INITIAL_FORM: PlaceFormState = {
  name: "",
  category: "Restaurante",
  address: "",
  city: "",
  phone: "",
  website: "",
  description: "",
  pet_sizes_allowed: "Todos",
  has_water_bowls: "No",
  has_pet_menu: "No",
};

export function usePlaceForm() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState<PlaceFormState>(INITIAL_FORM);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      showAlert({
        type: "warning",
        title: "Ubicación no disponible",
        message: "Tu navegador no permite obtener la ubicación.",
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        showAlert({
          type: "warning",
          title: "Ubicación no disponible",
          message:
            "No pudimos obtener tu ubicación. Revisa los permisos del navegador e inténtalo de nuevo.",
        });
      },
    );
  };

  const setImageFile = (file: File | null) => {
    setImage(file ? { file, preview: URL.createObjectURL(file) } : null);
  };

  const updateField = <K extends keyof PlaceFormState>(field: K, value: PlaceFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showAlert({ type: "error", title: "Falta el nombre", message: "El nombre del lugar es obligatorio." });
      return;
    }
    if (!location) {
      showAlert({
        type: "error",
        title: "Falta la ubicación",
        message: 'Necesitamos tu ubicación para ubicar el lugar en el mapa. Toca "Usar mi ubicación actual".',
      });
      return;
    }
    if (form.website.trim() && !/^https?:\/\//i.test(form.website.trim())) {
      showAlert({
        type: "error",
        title: "Sitio web inválido",
        message: "El enlace debe empezar con http:// o https://",
      });
      return;
    }
    if (form.phone.trim() && form.phone.replace(/\D/g, "").length < 10) {
      showAlert({ type: "error", title: "Teléfono inválido", message: "Escribe un teléfono de 10 dígitos." });
      return;
    }
    if (!user) {
      showAlert({ type: "error", title: "Error", message: "Debes estar autenticado" });
      return;
    }

    setLoading(true);
    try {
      let image_url: string | null = null;
      if (image) {
        const ext = getFileExtension(image.file.name) || "jpg";
        const { url, object_key } = await getPetfriendlyPresignedUrl(ext);
        await uploadImageToPresignedUrl(image.preview, url, ext);
        image_url = getS3Url(object_key);
      }

      await createPlace({
        ...form,
        name: form.name.trim(),
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        description: form.description.trim() || null,
        pet_sizes_allowed: form.pet_sizes_allowed.toLowerCase(),
        has_water_bowls: form.has_water_bowls === "Sí" ? "si" : "no",
        has_pet_menu: form.has_pet_menu === "Sí" ? "si" : "no",
        latitude: location.latitude,
        longitude: location.longitude,
        image_url,
      });

      queryClient.invalidateQueries({ queryKey: ["petfriendly-places"] });
      showAlert({
        type: "success",
        title: "¡Gracias!",
        message: "Has contribuido a que más michis y lomitos encuentren lugares geniales.",
      });
      router.back();
    } catch (error) {
      showAlert({
        type: "error",
        title: "No se pudo registrar el lugar",
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
    location,
    locating,
    updateField,
    setImageFile,
    locate,
    handleSave,
  };
}
