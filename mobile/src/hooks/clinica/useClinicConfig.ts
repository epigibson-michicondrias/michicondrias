import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getClinic, updateClinic, ClinicCreate } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';
import { getMascotasPresignedUrl } from '@/src/services/mascotas';
import { getFileExtension, getS3Url } from '@/src/utils/helpers';
import { uploadImageToPresignedUrl } from '@/src/utils/upload';

export function useClinicConfig(id: string) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [loading, setLoading] = useState(false);
    // Logo nuevo elegido en el dispositivo (se sube al guardar)
    const [logoUri, setLogoUri] = useState<string | null>(null);
    const [form, setForm] = useState<ClinicCreate>({
        name: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        logo_url: '',
        is_24_hours: false,
        has_emergency: false,
    });

    const { data: clinic, isLoading: loadingClinic } = useQuery({
        queryKey: ['clinic-detail', id],
        queryFn: () => getClinic(id),
        enabled: !!id,
    });

    useEffect(() => {
        if (clinic) {
            setForm({
                name: clinic.name,
                address: clinic.address,
                city: clinic.city,
                state: clinic.state,
                phone: clinic.phone,
                email: clinic.email,
                website: clinic.website,
                description: clinic.description,
                logo_url: clinic.logo_url,
                is_24_hours: clinic.is_24_hours,
                has_emergency: clinic.has_emergency,
            });
        }
    }, [clinic]);

    const handleSave = async () => {
        if (!form.name?.trim()) {
            showAlert({ type: 'error', title: 'Falta el nombre', message: 'El nombre de la clínica es obligatorio.' });
            return;
        }
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            showAlert({ type: 'error', title: 'Correo inválido', message: 'Escribe un correo electrónico válido.' });
            return;
        }
        if (form.website && !/^https?:\/\//i.test(form.website.trim())) {
            showAlert({ type: 'error', title: 'Sitio web inválido', message: 'El sitio web debe empezar con http:// o https://' });
            return;
        }

        setLoading(true);
        try {
            let logo_url = form.logo_url || null;
            if (logoUri) {
                const ext = getFileExtension(logoUri);
                const { url, object_key } = await getMascotasPresignedUrl(ext);
                await uploadImageToPresignedUrl(logoUri, url, ext);
                logo_url = getS3Url(object_key);
            }
            const clean = (v?: string | null) => (v && v.trim() ? v.trim() : null);
            await updateClinic(id, {
                ...form,
                name: form.name.trim(),
                address: clean(form.address),
                city: clean(form.city),
                state: clean(form.state),
                phone: clean(form.phone),
                email: clean(form.email),
                website: clean(form.website),
                description: clean(form.description),
                logo_url,
            });
            showAlert({ type: 'success', title: 'Listo', message: 'Perfil de clínica actualizado correctamente.' });
            queryClient.invalidateQueries({ queryKey: ['clinic-detail', id] });
            queryClient.invalidateQueries({ queryKey: ['my-clinics'] });
            queryClient.invalidateQueries({ queryKey: ['hospital-clinics'] });
            queryClient.invalidateQueries({ queryKey: ['public-clinics'] });
            queryClient.invalidateQueries({ queryKey: ['clinics'] });
            router.back();
        } catch (e: any) {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: e?.message || 'No se pudo actualizar el perfil.' });
        } finally {
            setLoading(false);
        }
    };

    const updateField = (field: keyof ClinicCreate, value: any) => {
        setForm({ ...form, [field]: value });
    };

    return {
        // State
        loading,
        form,
        setForm,
        logoUri,
        setLogoUri,
        // Data
        loadingClinic,
        // Actions
        handleSave,
        updateField,
    };
}
