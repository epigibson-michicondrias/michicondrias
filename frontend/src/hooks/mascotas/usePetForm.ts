/**
 * usePetForm — alta de mascota (`(app)/mascotas/nuevo`). Espejo de
 * `mobile/src/hooks/mascotas/usePetForm.ts` con `next/navigation` y `File` del navegador.
 * La validación vive en `petFormRules` y la aplica `PetForm` antes de llamar a `handleSubmit`.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createPet, getMascotasPresignedUrl } from '@/services/mascotas';
import { showAlert } from '@/components/AppAlert';
import { getFileExtension, getS3Url } from '@/utils/helpers';
import { uploadImageToPresignedUrl } from '@/utils/upload';
import type { PetFormData } from '@/types/mascotas';
import { PET_FORM_DEFAULTS } from '@/types/mascotas';
import { toPetPayload } from './petFormRules';

export function usePetForm() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<PetFormData>({ ...PET_FORM_DEFAULTS });
    const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const updateField = <K extends keyof PetFormData>(field: K, value: PetFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const setImageFile = (file: File | null) => {
        setImage(file ? { file, preview: URL.createObjectURL(file) } : null);
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!image) return null;
        const ext = getFileExtension(image.file.name) || 'jpg';
        const { url, object_key } = await getMascotasPresignedUrl(ext);
        await uploadImageToPresignedUrl(image.preview, url, ext);
        return getS3Url(object_key);
    };

    /** Registra la mascota (el formulario ya viene validado) y abre su ficha en Salud para el siguiente paso. */
    const handleSubmit = async () => {
        if (!user) {
            showAlert({ type: 'error', title: 'Inicia sesión', message: 'Necesitas una sesión activa para registrar a tu mascota.' });
            return;
        }

        setLoading(true);
        try {
            const photo_url = await uploadImage();
            const payload = toPetPayload(form);
            const created = await createPet({ ...payload, owner_id: user.id, photo_url });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            queryClient.invalidateQueries({ queryKey: ['my-pets-carnet'] });
            showAlert({
                type: 'success',
                title: `${payload.name} ya está en tu lista`,
                message: 'Registra sus vacunas para tener su carnet al día.',
            });
            router.replace(`/mascotas/${created.id}?tab=salud`);
        } catch {
            showAlert({ type: 'error', title: 'No se pudo registrar', message: 'Revisa tu conexión e inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        updateField,
        image,
        setImageFile,
        loading,
        handleSubmit,
    };
}
