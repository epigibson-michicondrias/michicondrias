/**
 * useEditPet — edición y borrado de una mascota (`(app)/mascotas/editar/[id]`). Espejo de
 * `mobile/src/hooks/mascotas/useEditPet.ts` con `next/navigation` y `File` del navegador.
 */
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPetById, updatePet, deletePet, getMascotasPresignedUrl } from '@/services/mascotas';
import { showAlert } from '@/components/AppAlert';
import { getFileExtension, getS3Url } from '@/utils/helpers';
import { uploadImageToPresignedUrl } from '@/utils/upload';
import type { PetFormData } from '@/types/mascotas';
import { PET_FORM_DEFAULTS } from '@/types/mascotas';
import { petToForm, toPetPayload } from './petFormRules';

export function useEditPet() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<PetFormData>({ ...PET_FORM_DEFAULTS });
    // `file` solo cuando se eligió una foto nueva; si no, `preview` es la URL ya publicada
    const [image, setImage] = useState<{ file: File | null; preview: string } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data: pet, isLoading: isLoadingPet, error } = useQuery({
        queryKey: ['pet-profile', id],
        queryFn: () => getPetById(id!),
        enabled: !!id,
    });

    // Llena el formulario una vez por mascota (estado derivado en render, sin efecto)
    const [loadedId, setLoadedId] = useState<string | null>(null);
    if (pet && loadedId !== pet.id) {
        setLoadedId(pet.id);
        setForm(petToForm(pet));
        setImage(pet.photo_url ? { file: null, preview: pet.photo_url } : null);
    }

    const updateField = <K extends keyof PetFormData>(field: K, value: PetFormData[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const setImageFile = (file: File | null) => {
        setImage(file ? { file, preview: URL.createObjectURL(file) } : null);
    };

    /** Foto final: sin foto (la quitó), la ya publicada, o la nueva subida (si falla la subida no se guarda nada). */
    const resolvePhoto = async (): Promise<string | null> => {
        if (!image) return null;
        if (!image.file) return image.preview;
        const ext = getFileExtension(image.file.name) || 'jpg';
        const { url, object_key } = await getMascotasPresignedUrl(ext);
        await uploadImageToPresignedUrl(image.preview, url, ext);
        return getS3Url(object_key);
    };

    /** Guarda los cambios (el formulario ya viene validado por `PetForm`). */
    const handleUpdate = async () => {
        if (!id) return;
        const payload = toPetPayload(form);
        setIsUpdating(true);
        try {
            const photo_url = await resolvePhoto();
            await updatePet(id, { ...payload, photo_url });
            queryClient.invalidateQueries({ queryKey: ['pet-profile', id] });
            queryClient.invalidateQueries({ queryKey: ['pet', id] });
            queryClient.invalidateQueries({ queryKey: ['user-pets'] });
            queryClient.invalidateQueries({ queryKey: ['my-pets-carnet'] });
            showAlert({ type: 'success', title: 'Cambios guardados', message: `Los datos de ${payload.name} están al día.` });
            router.back();
        } catch {
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
                    router.replace('/mascotas');
                } catch (err) {
                    showAlert({ type: 'error', title: 'No se pudo eliminar', message: (err instanceof Error && err.message) || 'Inténtalo de nuevo en unos minutos.' });
                } finally {
                    setIsDeleting(false);
                }
            },
        });
    };

    return {
        pet,
        error,
        form,
        updateField,
        image,
        setImageFile,
        isLoadingPet,
        /** Con Michi-Tracker Pro activo el backend no deja eliminarla (409): primero se cancela en facturación. */
        hasTracker: !!pet?.has_active_subscription,
        isUpdating,
        isDeleting,
        handleUpdate,
        handleDelete,
    };
}
