import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPetById, updatePet, deletePet, getMascotasPresignedUrl } from '@/src/services/mascotas';
import { showAlert } from '@/src/components/AppAlert';
import { getFileExtension, getS3Url } from '@/src/utils/helpers';
import type { PetFormData } from '@/src/types/mascotas';
import { PET_FORM_DEFAULTS } from '@/src/types/mascotas';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';
import { petToForm, toPetPayload } from './petFormRules';

export function useEditPet() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<PetFormData>({ ...PET_FORM_DEFAULTS });
    const [image, setImage] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch the existing pet profile
    const { data: pet, isLoading: isLoadingPet } = useQuery({
        queryKey: ['pet-profile', id],
        queryFn: () => getPetById(id!),
        enabled: !!id,
    });

    // Populate form with existing data when loaded
    useEffect(() => {
        if (pet) {
            setForm(petToForm(pet));
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
        // Si falla la subida se propaga el error: nunca se borra la foto existente en silencio
        const ext = getFileExtension(imageUri);
        const { url, object_key } = await getMascotasPresignedUrl(ext);

        await uploadImageToPresignedUrl(imageUri, url, ext);

        return getS3Url(object_key);
    };

    /** Guarda los cambios (el formulario ya viene validado por `PetForm`). */
    const handleUpdate = async () => {
        if (!id) return;
        const payload = toPetPayload(form);

        setIsUpdating(true);
        try {
            let photo_url = pet?.photo_url || null;
            if (image && image !== pet?.photo_url) {
                photo_url = await uploadImage(image);
            }

            await updatePet(id, { ...payload, photo_url });

            // Invalidate caches
            queryClient.invalidateQueries({ queryKey: ['pet-profile', id] });
            queryClient.invalidateQueries({ queryKey: ['pet', id] });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            queryClient.invalidateQueries({ queryKey: ['my-pets-carnet'] });

            showAlert({ type: 'success', title: 'Cambios guardados', message: `Los datos de ${payload.name} están al día.` });
            router.back();
        } catch (error) {
            console.error(error);
            showAlert({ type: 'error', title: 'No se pudieron guardar los cambios', message: 'Revisa tu conexión e inténtalo de nuevo.' });
        } finally {
            setIsUpdating(false);
        }
    };

    /** Pide confirmación y elimina la mascota (solo el dueño; el backend la desactiva sin romper su carnet ni citas). */
    const handleDelete = () => {
        if (!id) return;
        const petName = pet?.name || 'esta mascota';
        showAlert({
            type: 'warning',
            title: `Eliminar a ${petName}`,
            message: 'Dejará de aparecer en tu lista y no podrás recuperarla. ¿Seguro que quieres eliminarla?',
            showCancel: true,
            cancelText: 'Conservar',
            buttonText: 'Eliminar',
            onButtonPress: async () => {
                setIsDeleting(true);
                try {
                    await deletePet(id);
                    queryClient.removeQueries({ queryKey: ['pet-profile', id] });
                    queryClient.removeQueries({ queryKey: ['pet', id] });
                    queryClient.invalidateQueries({ queryKey: ['user-pets'] });
                    queryClient.invalidateQueries({ queryKey: ['my-pets-carnet'] });
                    router.replace('/mascotas' as any);
                } catch (error: any) {
                    showAlert({ type: 'error', title: 'No se pudo eliminar', message: error?.message || 'Inténtalo de nuevo en unos minutos.' });
                } finally {
                    setIsDeleting(false);
                }
            },
        });
    };

    return {
        form,
        updateField,
        image,
        setImage,
        isLoadingPet,
        /** Con Michi-Tracker Pro activo el backend no deja eliminarla (409): primero se cancela en facturación. */
        hasTracker: !!pet?.has_active_subscription,
        isUpdating,
        isDeleting,
        handleUpdate,
        handleDelete,
    };
}
