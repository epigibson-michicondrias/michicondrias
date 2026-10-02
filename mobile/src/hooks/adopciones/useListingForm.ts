/**
 * useListingForm — Hook for creating a new adoption listing
 * Extracts form state, image picking, and submit logic from app/adopciones/nuevo.tsx
 */
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createListing, updateListing, getListing, getAdopcionesPresignedUrl } from '@/src/services/adopciones';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import { getS3Url, getFileExtension } from '@/src/utils/helpers';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';

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
    name: '',
    species: 'perro',
    breed: '',
    age_months: '',
    gender: 'macho',
    size: 'Mediano',
    location: '',
    description: '',
    is_emergency: false,
    is_vaccinated: false,
    is_sterilized: false,
    is_dewormed: false,
    social_cats: true,
    social_dogs: true,
    social_children: true,
    temperament: '',
    energy_level: 'Media',
};

export function useListingForm() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { editId } = useLocalSearchParams<{ editId?: string }>();
    const isEditing = !!editId;

    // Modo edición: precarga la publicación existente
    const { data: existing } = useQuery({
        queryKey: ['adopcion', editId],
        queryFn: () => getListing(editId as string),
        enabled: isEditing,
    });

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [form, setForm] = useState<ListingFormState>(INITIAL_FORM);

    useEffect(() => {
        if (!existing) return;
        setForm({
            name: existing.name || '',
            species: existing.species || 'perro',
            breed: existing.breed || '',
            age_months: existing.age_months != null ? String(existing.age_months) : '',
            gender: existing.gender || 'macho',
            size: existing.size || 'Mediano',
            location: existing.location || '',
            description: existing.description || '',
            is_emergency: !!existing.is_emergency,
            is_vaccinated: !!existing.is_vaccinated,
            is_sterilized: !!existing.is_sterilized,
            is_dewormed: !!existing.is_dewormed,
            social_cats: existing.social_cats ?? true,
            social_dogs: existing.social_dogs ?? true,
            social_children: existing.social_children ?? true,
            temperament: existing.temperament || '',
            energy_level: existing.energy_level || 'Media',
        });
        if (existing.photo_url) setImage(existing.photo_url);
    }, [existing]);

    const updateField = <K extends keyof ListingFormState>(field: K, value: ListingFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const toggleField = (field: keyof ListingFormState) => {
        setForm((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleImageSelected = (uri: string) => {
        setImage(uri);
    };

    const handleImageRemoved = () => {
        setImage(null);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return showAlert({ type: 'error', title: 'Error', message: 'El nombre es obligatorio' });
        if (!user) return showAlert({ type: 'error', title: 'Error', message: 'Debes estar autenticado' });

        setLoading(true);
        try {
            let photo_url = null;

            if (image && image.startsWith('http')) {
                photo_url = image; // foto existente sin cambios
            } else if (image) {
                const ext = getFileExtension(image);
                const { url, object_key } = await getAdopcionesPresignedUrl(ext);
                await uploadImageToPresignedUrl(image, url, ext);

                photo_url = getS3Url(object_key);
            }

            const payload = {
                ...form,
                age_months: Number.isFinite(parseInt(form.age_months)) ? parseInt(form.age_months) : null,
                photo_url,
            };
            if (isEditing) {
                await updateListing(editId as string, payload);
            } else {
                await createListing({ ...payload, published_by: user.id });
            }
            queryClient.invalidateQueries({ queryKey: ['adopcion', editId] });

            queryClient.invalidateQueries({ queryKey: ['adopciones-listings'] });
            queryClient.invalidateQueries({ queryKey: ['my-adopciones'] });
            showAlert({ type: 'success', title: isEditing ? '¡Cambios guardados!' : '¡Publicación enviada!', message: 'Un administrador la revisará y, al aprobarla, aparecerá en el listado de adopción. Puedes ver su estado en Mis publicaciones.' });
            router.back();
        } catch (error) {
            showAlert({ type: 'error', title: 'No se pudo crear la publicación', message: error instanceof Error ? error.message : 'Inténtalo de nuevo.' });
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        image,
        loading,
        isEditing,
        updateField,
        toggleField,
        handleImageSelected,
        handleImageRemoved,
        handleSave,
    };
}
