/**
 * useEditReport — Hook for editing an existing lost/found pet report
 * Uses getReportById and updateReport from perdidas service
 */
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { getReportById, updateReport, getPerdidasPresignedUrl } from '@/src/services/perdidas';
import { showAlert } from '@/src/components/AppAlert';
import type { LostPetReport } from '@/src/types/perdidas';

export interface EditReportFormState {
    pet_name: string;
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

export function useEditReport() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [image, setImage] = useState<string | null>(null);
    const [form, setForm] = useState<EditReportFormState>({
        pet_name: '',
        species: '',
        breed: '',
        color: '',
        size: '',
        age_approx: '',
        last_seen_location: '',
        description: '',
        contact_phone: '',
        contact_email: '',
    });

    const { data: report, isLoading: isLoadingReport } = useQuery({
        queryKey: ['perdidas-report', id],
        queryFn: () => getReportById(id || ''),
        enabled: !!id,
    });

    // Populate form when report loads
    useEffect(() => {
        if (report) {
            setForm({
                pet_name: report.pet_name || '',
                species: report.species || '',
                breed: report.breed || '',
                color: report.color || '',
                size: report.size || '',
                age_approx: report.age_approx || '',
                last_seen_location: report.last_seen_location || '',
                description: report.description || '',
                contact_phone: report.contact_phone || '',
                contact_email: report.contact_email || '',
            });
            if (report.image_url) {
                setImage(report.image_url);
            }
        }
    }, [report]);

    const updateField = <K extends keyof EditReportFormState>(field: K, value: EditReportFormState[K]) => {
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

    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!id) throw new Error('No report ID');
            if (!form.pet_name) throw new Error('name_required');

            let image_url = report?.image_url || null;

            // Only upload if image changed (local file URI vs remote URL)
            if (image && image !== report?.image_url && !image.startsWith('http')) {
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

            return updateReport(id, {
                ...form,
                image_url,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perdidas-report', id] });
            queryClient.invalidateQueries({ queryKey: ['lost-pet-reports'] });
            showAlert({ type: 'success', title: '¡Actualizado!', message: 'El reporte ha sido actualizado correctamente.' });
            router.back();
        },
        onError: (error: Error) => {
            if (error.message === 'name_required') {
                showAlert({ type: 'error', title: 'Error', message: 'El nombre es obligatorio.' });
            } else {
                showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el reporte.' });
            }
        },
    });

    const handleUpdate = () => {
        if (!form.pet_name) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre es obligatorio.' });
            return;
        }
        updateMutation.mutate();
    };

    return {
        // Data
        form,
        image,
        report,
        isLoadingReport,
        isUpdating: updateMutation.isPending,

        // Actions
        updateField,
        setForm,
        pickImage,
        setImage,
        handleUpdate,
    };
}
