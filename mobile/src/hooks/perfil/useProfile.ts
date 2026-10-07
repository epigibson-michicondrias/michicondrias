/**
 * useProfile — formulario de datos personales (pantalla perfil/editar): carga, validación por campo y guardado.
 * Lo demás de la cuenta (sesión, verificación, facturación, tema) vive en useAccount (pestaña Perfil).
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { getMyProfile, updateMyProfile } from '@/src/services/profile';
import { showAlert } from '@/src/components/AppAlert';

export interface ProfileFormData {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
}

type ProfileErrors = Partial<Record<keyof ProfileFormData, string>>;

export const BIO_MAX = 500;

const EMPTY_FORM: ProfileFormData = { full_name: '', email: '', phone: '', location: '', bio: '' };

function validate(data: ProfileFormData): ProfileErrors {
    const errors: ProfileErrors = {};
    if (data.full_name.trim().length < 2) errors.full_name = 'Escribe tu nombre completo.';
    const digits = data.phone.replace(/\D/g, '');
    if (data.phone.trim() && (digits.length < 7 || digits.length > 15)) errors.phone = 'Usa de 7 a 15 dígitos, o déjalo vacío.';
    if (data.bio.trim().length > BIO_MAX) errors.bio = `Máximo ${BIO_MAX} caracteres.`;
    return errors;
}

export function useProfile() {
    const { reloadUser } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<ProfileFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<ProfileErrors>({});

    const { data: profile, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: getMyProfile,
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                bio: profile.bio || '',
            });
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: (data: ProfileFormData) => updateMyProfile({
            full_name: data.full_name.trim(),
            phone: data.phone.trim(),
            location: data.location.trim(),
            bio: data.bio.trim(),
        }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            // El nombre también se muestra en Inicio y en la pestaña Perfil (contexto de sesión)
            await reloadUser();
            showAlert({ type: 'success', title: 'Datos guardados', message: 'Tu perfil quedó actualizado.' });
            router.back();
        },
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: error?.message || 'Inténtalo de nuevo en un momento.' });
        },
    });

    const updateField = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSave = () => {
        const found = validate(formData);
        setErrors(found);
        if (Object.keys(found).length === 0) updateMutation.mutate(formData);
    };

    return {
        profile,
        isLoading,
        formData,
        errors,
        updateField,
        handleSave,
        isSaving: updateMutation.isPending,
    };
}
