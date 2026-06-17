/**
 * usePetForm — Hook for pet creation form logic
 * Extracts state, validation, image upload, and submission from app/mascotas/nuevo.tsx
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { createPet, getMascotasPresignedUrl } from '@/src/services/mascotas';
import { showAlert } from '@/src/components/AppAlert';
import { getFileExtension, getS3Url } from '@/src/utils/helpers';
import type { PetFormData } from '@/src/types/mascotas';
import { PET_FORM_DEFAULTS } from '@/src/types/mascotas';

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

        const response = await fetch(imageUri);
        const blob = await response.blob();

        await fetch(url, {
            method: 'PUT',
            body: blob,
            headers: { 'Content-Type': `image/${ext}` },
        });

        return getS3Url(object_key);
    };

    /** Validate and submit the form */
    const handleSubmit = async () => {
        const trimmedName = form.name.trim();
        const trimmedBreed = form.breed.trim();
        const trimmedDescription = form.description.trim();

        if (!trimmedName) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre es obligatorio' });
            return;
        }
        if (!trimmedBreed) {
            showAlert({ type: 'error', title: 'Error', message: 'La raza es obligatoria' });
            return;
        }
        if (!trimmedDescription) {
            showAlert({ type: 'error', title: 'Error', message: 'La descripción es obligatoria' });
            return;
        }

        let ageVal: number | undefined = undefined;
        if (form.age_months.trim() !== '') {
            const parsed = parseInt(form.age_months, 10);
            if (isNaN(parsed) || parsed < 0) {
                showAlert({ type: 'error', title: 'Error', message: 'La edad debe ser un número entero positivo o cero' });
                return;
            }
            ageVal = parsed;
        }

        let weightVal: number | undefined = undefined;
        if (form.weight_kg.trim() !== '') {
            const parsed = parseFloat(form.weight_kg);
            if (isNaN(parsed) || parsed <= 0) {
                showAlert({ type: 'error', title: 'Error', message: 'El peso debe ser un número mayor a cero' });
                return;
            }
            weightVal = parsed;
        }

        if (!user) {
            showAlert({ type: 'error', title: 'Error', message: 'Debes estar autenticado' });
            return;
        }

        setLoading(true);
        try {
            let photo_url: string | null = null;
            if (image) {
                photo_url = await uploadImage(image);
            }

            await createPet({
                ...form,
                name: trimmedName,
                breed: trimmedBreed,
                description: trimmedDescription,
                owner_id: user.id,
                age_months: ageVal,
                weight_kg: weightVal,
                photo_url,
            } as any);

            // Invalidate pets list so it refreshes
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });

            showAlert({
                type: 'success',
                title: '¡Éxito!',
                message: `${trimmedName} ha sido registrado correctamente.`,
            });
            router.back();
        } catch (error) {
            console.error(error);
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo registrar la mascota.' });
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
