/**
 * useListingForm — Hook for creating a new adoption listing
 * Extracts form state, image picking, and submit logic from app/adopciones/nuevo.tsx
 */
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { createListing, getAdopcionesPresignedUrl } from '@/src/services/adopciones';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

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

    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [form, setForm] = useState<ListingFormState>(INITIAL_FORM);

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
        if (!form.name) return showAlert({ type: 'error', title: 'Error', message: 'El nombre es obligatorio' });
        if (!user) return showAlert({ type: 'error', title: 'Error', message: 'Debes estar autenticado' });

        setLoading(true);
        try {
            let photo_url = null;

            if (image) {
                const ext = image.split('.').pop();
                const { url, object_key } = await getAdopcionesPresignedUrl(ext || 'jpg');

                const response = await fetch(image);
                const blob = await response.blob();

                await fetch(url, {
                    method: 'PUT',
                    body: blob,
                    headers: { 'Content-Type': `image/${ext}` }
                });

                photo_url = `https://michicondrias-storage-1.s3.us-east-1.amazonaws.com/${object_key}`;
            }

            await createListing({
                ...form,
                published_by: user.id,
                age_months: form.age_months ? parseInt(form.age_months) : null,
                photo_url,
                status: 'available',
            });

            showAlert({ type: 'success', title: '¡Éxito!', message: 'La publicación de adopción ha sido creada.' });
            router.back();
        } catch (error) {
            console.error(error);
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo crear la publicación.' });
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        image,
        loading,
        updateField,
        toggleField,
        handleImageSelected,
        handleImageRemoved,
        handleSave,
    };
}
