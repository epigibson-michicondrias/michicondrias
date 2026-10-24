import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getClinic, updateClinic, ClinicCreate } from '@/services/directorio';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';
import { getMascotasPresignedUrl } from '@/services/mascotas';
import { getFileExtension, getS3Url } from '@/utils/helpers';
import { uploadImageToPresignedUrl } from '@/utils/upload';

export function useClinicConfig(id: string) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [loading, setLoading] = useState(false);
    // Logo nuevo elegido en el equipo (se sube al guardar)
    const [logoFile, setLogoFile] = useState<File | null>(null);
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

    // El formulario se llena una vez por cada versión de la clínica que llega del servidor (sin efecto)
    const [syncedClinic, setSyncedClinic] = useState<typeof clinic>();
    if (clinic && clinic !== syncedClinic) {
        setSyncedClinic(clinic);
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
            if (logoFile) {
                const ext = getFileExtension(logoFile.name);
                const { url, object_key } = await getMascotasPresignedUrl(ext);
                await uploadImageToPresignedUrl(URL.createObjectURL(logoFile), url, ext);
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
        } catch (e) {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: errorMessage(e, 'No se pudo actualizar el perfil.') });
        } finally {
            setLoading(false);
        }
    };

    const updateField = <K extends keyof ClinicCreate>(field: K, value: ClinicCreate[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    return {
        // State
        loading,
        form,
        setForm,
        logoFile,
        setLogoFile,
        clinic,
        // Data
        loadingClinic,
        // Actions
        handleSave,
        updateField,
    };
}
