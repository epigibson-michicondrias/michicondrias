/**
 * usePetForm — Hook for pet creation form logic
 * Extracts state, image upload, and submission from app/mascotas/nuevo.tsx.
 * La validación vive en `petFormRules` y la aplica `PetForm` antes de llamar a `handleSubmit`.
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { createPet, getMascotasPresignedUrl } from '@/src/services/mascotas';
import { showAlert } from '@/src/components/AppAlert';
import { hapticSuccess } from '@/src/lib/haptics';
import { getFileExtension, getS3Url } from '@/src/utils/helpers';
import type { PetFormData } from '@/src/types/mascotas';
import { PET_FORM_DEFAULTS } from '@/src/types/mascotas';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';
import { toPetPayload } from './petFormRules';

export function usePetForm() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<PetFormData>({ ...PET_FORM_DEFAULTS });
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    /** Update a single field */
    const updateField = <K extends keyof PetFormData>(field: K, value: PetFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    /** Upload image to S3 via presigned URL */
    const uploadImage = async (imageUri: string): Promise<string | null> => {
        const ext = getFileExtension(imageUri);
        const { url, object_key } = await getMascotasPresignedUrl(ext);

        await uploadImageToPresignedUrl(imageUri, url, ext);

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
            const photo_url = image ? await uploadImage(image) : null;
            const payload = toPetPayload(form);
            const created = await createPet({ ...payload, owner_id: user.id, photo_url });

            // Invalidate pets list so it refreshes
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            queryClient.invalidateQueries({ queryKey: ['my-pets-carnet'] });

            hapticSuccess();
            showAlert({
                type: 'success',
                title: `${payload.name} ya está en tu lista`,
                message: 'Registra sus vacunas para tener su carnet al día.',
            });
            router.replace({ pathname: '/mascotas/[id]', params: { id: created.id, tab: 'salud' } } as any);
        } catch (error) {
            console.error(error);
            showAlert({ type: 'error', title: 'No se pudo registrar', message: 'Revisa tu conexión e inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        updateField,
        image,
        setImage,
        loading,
        handleSubmit,
    };
}
