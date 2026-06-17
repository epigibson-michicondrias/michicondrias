import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getClinic, updateClinic, ClinicCreate } from '@/src/services/directorio';
import { showAlert } from '@/src/components/AppAlert';

export function useClinicConfig(id: string) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [loading, setLoading] = useState(false);
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
        if (!form.name) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre de la clínica es obligatorio' });
            return;
        }

        setLoading(true);
        try {
            await updateClinic(id, form);
            showAlert({ type: 'success', title: 'Éxito', message: 'Perfil de clínica actualizado correctamente' });
            queryClient.invalidateQueries({ queryKey: ['clinic-detail', id] });
            router.back();
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el perfil' });
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
        // Data
        loadingClinic,
        // Actions
        handleSave,
        updateField,
    };
}
