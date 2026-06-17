import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPetById, updatePet, getMascotasPresignedUrl } from '@/src/services/mascotas';
import { showAlert } from '@/src/components/AppAlert';
import { getFileExtension, getS3Url } from '@/src/utils/helpers';
import type { PetFormData } from '@/src/types/mascotas';
import { PET_FORM_DEFAULTS } from '@/src/types/mascotas';

export function useEditPet() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<PetFormData>({ ...PET_FORM_DEFAULTS });
    const [image, setImage] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch the existing pet profile
    const { data: pet, isLoading: isLoadingPet } = useQuery({
        queryKey: ['pet-profile', id],
        queryFn: () => getPetById(id!),
        enabled: !!id,
    });

    // Populate form with existing data when loaded
    useEffect(() => {
        if (pet) {
            setForm({
                name: pet.name || '',
                species: pet.species || 'perro',
                breed: pet.breed || '',
                age_months: pet.age_months !== null ? String(pet.age_months) : '',
                gender: pet.gender || 'macho',
                description: pet.description || '',
                is_vaccinated: pet.is_vaccinated ?? false,
                is_sterilized: pet.is_sterilized ?? false,
                is_dewormed: pet.is_dewormed ?? false,
                weight_kg: pet.weight_kg !== undefined ? String(pet.weight_kg) : '',
                microchip_id: '', // Not in the main Pet model but kept in form
            });
            setImage(pet.photo_url);
        }
    }, [pet]);

    const updateField = <K extends keyof PetFormData>(field: K, value: PetFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const uploadImage = async (imageUri: string): Promise<string | null> => {
        if (imageUri.startsWith('http')) {
            // Already uploaded S3 image URL, return as is
            return imageUri;
        }
        try {
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
        } catch (err) {
            console.error('Image upload failed:', err);
            return null;
        }
    };

    const handleUpdate = async () => {
        if (!id) return;
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

        let ageVal: number | null = null;
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

        setIsUpdating(true);
        try {
            let photo_url = pet?.photo_url || null;
            if (image && image !== pet?.photo_url) {
                photo_url = await uploadImage(image);
            }

            await updatePet(id, {
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
                photo_url,
            });

            // Invalidate caches
            queryClient.invalidateQueries({ queryKey: ['pet-profile', id] });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });

            showAlert({
                type: 'success',
                title: '¡Éxito!',
                message: `${trimmedName} ha sido actualizado correctamente.`,
            });
            router.back();
        } catch (error) {
            console.error(error);
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar la mascota.' });
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        form,
        updateField,
        image,
        setImage,
        isLoadingPet,
        isUpdating,
        handleUpdate,
    };
}
