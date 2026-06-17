/**
 * useReportForm — Hook for creating a new lost/found pet report
 * Extracts form state, image picking, location, and submit logic
 * from app/perdidas/nuevo.tsx
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { createReport, getPerdidasPresignedUrl } from '@/src/services/perdidas';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export interface ReportFormState {
    pet_name: string;
    report_type: 'lost' | 'found';
    species: string;
    breed: string;
    color: string;
    size: string;
    age_approx: string;
    last_seen_location: string;
    description: string;
    contact_phone: string;
    contact_email: string;
}

export function useReportForm() {
    const { user } = useAuth();
    const router = useRouter();

    const [image, setImage] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [form, setForm] = useState<ReportFormState>({
        pet_name: '',
        report_type: 'lost',
        species: 'gato',
        breed: '',
        color: '',
        size: 'mediano',
        age_approx: 'joven',
        last_seen_location: '',
        description: '',
        contact_phone: '',
        contact_email: user?.email || '',
    });

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    showAlert({ type: 'warning', title: 'Permiso denegado', message: 'Necesitamos tu ubicación para marcar el reporte.' });
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({});
                setLocation({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });
            } catch (error) {
                console.warn('Location services unavailable:', error);
            }
        })();
    }, []);

    const updateField = <K extends keyof ReportFormState>(field: K, value: ReportFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const submitMutation = useMutation({
        mutationFn: async () => {
            if (!form.pet_name) throw new Error('name_required');
            if (!location) throw new Error('location_required');
            if (!user) throw new Error('auth_required');

            let image_url = null;

            if (image) {
                const ext = image.split('.').pop();
                const { url, object_key } = await getPerdidasPresignedUrl(ext || 'jpg');

                const response = await fetch(image);
                const blob = await response.blob();

                await fetch(url, {
                    method: 'PUT',
                    body: blob,
                    headers: { 'Content-Type': `image/${ext}` },
                });

                image_url = `https://michicondrias-storage-1.s3.us-east-1.amazonaws.com/${object_key}`;
            }

            return createReport({
                ...form,
                reporter_id: user.id,
                latitude: location.latitude,
                longitude: location.longitude,
                image_url,
                status: 'active',
            });
        },
        onSuccess: () => {
            showAlert({ type: 'success', title: '¡Reporte Enviado!', message: 'La comunidad ha sido notificada. Gracias por ayudar.' });
            router.back();
        },
        onError: (error: Error) => {
            if (error.message === 'name_required') {
                showAlert({ type: 'error', title: 'Error', message: 'El nombre o descripción corta es obligatorio' });
            } else if (error.message === 'location_required') {
                showAlert({ type: 'error', title: 'Error', message: 'Debes marcar la ubicación en el mapa' });
            } else if (error.message === 'auth_required') {
                showAlert({ type: 'error', title: 'Error', message: 'Debes estar autenticado' });
            } else {
                showAlert({ type: 'error', title: 'Error', message: 'No se pudo crear el reporte.' });
            }
        },
    });

    const handleSave = () => {
        if (!form.pet_name) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre o descripción corta es obligatorio' });
            return;
        }
        if (!location) {
            showAlert({ type: 'error', title: 'Error', message: 'Debes marcar la ubicación en el mapa' });
            return;
        }
        if (!user) {
            showAlert({ type: 'error', title: 'Error', message: 'Debes estar autenticado' });
            return;
        }
        submitMutation.mutate();
    };

    return {
        // Data
        form,
        image,
        location,
        loading: submitMutation.isPending,

        // Actions
        updateField,
        setForm,
        pickImage,
        setImage,
        setLocation,
        handleSave,
    };
}
