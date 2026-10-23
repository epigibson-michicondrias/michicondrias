/**
 * usePetForm — alta de mascota (`(app)/mascotas/nuevo`). Espejo de
 * `mobile/src/hooks/mascotas/usePetForm.ts` con `next/navigation` y `File` del navegador.
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

        let ageVal: number | undefined;
        if (form.age_months.trim() !== '') {
            const parsed = parseInt(form.age_months, 10);
            if (isNaN(parsed) || parsed < 0) {
                showAlert({ type: 'error', title: 'Error', message: 'La edad debe ser un número entero positivo o cero' });
                return;
            }
            ageVal = parsed;
        }

        let weightVal: number | undefined;
        if (form.weight_kg.trim() !== '') {
            const normalized = form.weight_kg.trim().replace(',', '.');
            const parsed = parseFloat(normalized);
            if (isNaN(parsed) || parsed <= 0) {
                showAlert({ type: 'error', title: 'Error', message: 'El peso debe ser un número mayor a cero' });
                return;
            }
            weightVal = parsed;
        }

        if (!user) {
            showAlert({ type: 'error', title: 'Error', message: 'Inicia sesión para registrar una mascota' });
            return;
        }

        setLoading(true);
        try {
            const photoUrl = await uploadImage();
            await createPet({
                name: trimmedName,
                species: form.species,
                breed: trimmedBreed,
                age_months: ageVal,
                gender: form.gender,
                description: trimmedDescription,
                is_vaccinated: form.is_vaccinated,
                is_sterilized: form.is_sterilized,
                is_dewormed: form.is_dewormed,
                weight_kg: weightVal,
                microchip_number: form.microchip_id.trim() || null,
                photo_url: photoUrl,
                owner_id: user.id,
                is_active: true,
            });
            await queryClient.invalidateQueries({ queryKey: ['user-pets', user.id] });
            showAlert({ type: 'success', title: '¡Listo!', message: `${trimmedName} ya es parte de tu familia.` });
            router.replace('/mascotas');
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'No pudimos registrarla',
                message: error instanceof Error ? error.message : 'Inténtalo de nuevo.',
            });
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
