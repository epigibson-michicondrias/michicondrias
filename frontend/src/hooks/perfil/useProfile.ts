/**
 * useProfile — formulario de datos personales (`(app)/perfil/editar`). Espejo de
 * `mobile/src/hooks/perfil/useProfile.ts`.
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, updateMyProfile } from '@/services/profile';
import { showAlert } from '@/components/AppAlert';

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
        let cancelled = false;
        (async () => {
            await Promise.resolve();
            if (cancelled || !profile) return;
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                location: profile.location || '',
                bio: profile.bio || '',
            });
        })();
        return () => { cancelled = true; };
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
            await reloadUser();
            showAlert({ type: 'success', title: 'Datos guardados', message: 'Tu perfil quedó actualizado.' });
            router.back();
        },
        onError: (error: Error) => {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: error.message || 'Inténtalo de nuevo.' });
        },
    });

    const updateField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const handleSave = () => {
        const next = validate(formData);
        setErrors(next);
        if (Object.keys(next).length > 0) return;
        updateMutation.mutate(formData);
    };

    return {
        formData,
        errors,
        updateField,
        isLoading,
        handleSave,
        isSaving: updateMutation.isPending,
    };
}
