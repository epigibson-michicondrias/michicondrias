/**
 * useReportForm — alta de reporte de mascota perdida/encontrada (`(app)/perdidas/reportar`).
 * Espejo de `mobile/src/hooks/perdidas/useReportForm.ts` con `next/navigation` y `File` del navegador.
 * No asigna coordenadas: el punto del mapa solo se usa si el backend ya lo tiene.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReport, getPerdidasPresignedUrl } from '@/services/perdidas';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/AppAlert';
import { getFileExtension, getS3Url } from '@/utils/helpers';
import { uploadImageToPresignedUrl } from '@/utils/upload';

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

export type ReportFormErrors = Partial<
    Record<'pet_name' | 'last_seen_location' | 'contact_phone' | 'contact_email', string>
>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM: ReportFormState = {
    pet_name: '',
    report_type: 'lost',
    species: 'perro',
    breed: '',
    color: '',
    size: 'mediano',
    age_approx: '',
    last_seen_location: '',
    description: '',
    contact_phone: '',
    contact_email: '',
};

export function useReportForm() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<ReportFormState>({ ...INITIAL_FORM });
    const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
    const [errors, setErrors] = useState<ReportFormErrors>({});

    const updateField = <K extends keyof ReportFormState>(field: K, value: ReportFormState[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof ReportFormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const setImageFile = (file: File | null) => {
        setImage(file ? { file, preview: URL.createObjectURL(file) } : null);
    };

    const validate = (): boolean => {
        const next: ReportFormErrors = {};
        if (!form.pet_name.trim()) next.pet_name = 'Escribe su nombre o una descripción corta.';
        if (!form.last_seen_location.trim()) next.last_seen_location = 'Indica la zona donde se perdió o encontró.';
        const phone = form.contact_phone.trim();
        const email = form.contact_email.trim();
        if (!phone && !email) {
            next.contact_phone = 'Agrega un teléfono o un correo para que puedan avisarte.';
        }
        if (phone && phone.replace(/\D/g, '').length < 8) {
            next.contact_phone = 'Escribe al menos 8 dígitos.';
        }
        if (email && !EMAIL_RE.test(email)) next.contact_email = 'Revisa el correo.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!image) return null;
        const ext = getFileExtension(image.file.name) || 'jpg';
        const { url, object_key } = await getPerdidasPresignedUrl(ext);
        await uploadImageToPresignedUrl(image.preview, url, ext);
        return getS3Url(object_key);
    };

    const mutation = useMutation({
        mutationFn: async () => {
            const image_url = await uploadImage();
            return createReport({
                ...form,
                pet_name: form.pet_name.trim(),
                breed: form.breed.trim() || null,
                color: form.color.trim() || null,
                age_approx: form.age_approx.trim() || null,
                last_seen_location: form.last_seen_location.trim(),
                description: form.description.trim() || null,
                contact_phone: form.contact_phone.trim() || null,
                contact_email: form.contact_email.trim() || null,
                image_url,
                reporter_id: user!.id,
                status: 'active',
            });
        },
        onSuccess: (created) => {
            queryClient.invalidateQueries({ queryKey: ['lost-pet-reports'] });
            queryClient.invalidateQueries({ queryKey: ['lost-pet-resolved'] });
            queryClient.invalidateQueries({ queryKey: ['my-lost-reports'] });
            showAlert({
                type: 'success',
                title: form.report_type === 'lost' ? '¡Reporte publicado!' : '¡Mascota reportada!',
                message: 'Ya aparece en el listado. Te avisaremos si alguien la ve.',
            });
            router.replace(`/perdidas/rastreo/${created.id}`);
        },
        onError: (error: Error) => {
            showAlert({
                type: 'error',
                title: 'No se pudo publicar',
                message: error.message || 'Inténtalo de nuevo.',
            });
        },
    });

    const handleSave = () => {
        if (!user) {
            showAlert({
                type: 'error',
                title: 'Inicia sesión',
                message: 'Necesitas una cuenta para publicar un reporte.',
            });
            return;
        }
        if (!validate()) return;
        mutation.mutate();
    };

    return {
        form,
        errors,
        updateField,
        image,
        setImageFile,
        handleSave,
        saving: mutation.isPending,
    };
}
