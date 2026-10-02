/**
 * useProfile — Hook for user profile data, edit state, and mutations
 * Extracts data fetching and form logic from app/perfil/index.tsx
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getCurrentUser } from '@/src/lib/auth';
import { updateMyProfile } from '@/src/services/profile';
import { createBillingPortalSession } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';
import { Linking } from 'react-native';

export interface ProfileFormData {
    full_name: string;
    email: string;
}

export function useProfile() {
    const { user, signOut, reloadUser } = useAuth();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: '',
        email: '',
    });

    const { data: profile, isLoading, isError, refetch } = useQuery({
        queryKey: ['user-profile'],
        queryFn: getCurrentUser,
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
            });
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: (data: ProfileFormData) => updateMyProfile({ full_name: data.full_name.trim() }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            // El nombre también se muestra en inicio y menú (contexto de sesión)
            await reloadUser();
            setIsEditing(false);
            showAlert({ type: 'success', title: 'Perfil actualizado', message: 'Tu nombre se guardó correctamente.' });
        },
        onError: (error: any) => {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: error?.message || 'No se pudo actualizar el perfil' });
        },
    });

    const handleSave = () => {
        const name = formData.full_name.trim();
        if (name.length < 2) {
            showAlert({ type: 'error', title: 'Nombre requerido', message: 'Escribe tu nombre completo (mínimo 2 caracteres).' });
            return;
        }
        updateMutation.mutate(formData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
            });
        }
    };

    const handleLogout = () => {
        showAlert({
            type: 'warning',
            title: 'Cerrar Sesión',
            message: '¿Estás seguro de que deseas cerrar sesión?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Cerrar Sesión',
            onButtonPress: signOut,
        });
    };

    const toggleEditing = () => setIsEditing(!isEditing);

    const updateField = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'veterinario': return 'stethoscope' as const;
            case 'admin': return 'shield' as const;
            default: return 'user' as const;
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'veterinario': return 'Veterinario';
            case 'admin': return 'Administrador';
            case 'paseador': return 'Paseador';
            case 'vendedor': return 'Vendedor';
            case 'refugio': return 'Refugio';
            case 'cuidador': return 'Cuidador';
            case 'patrocinador': return 'Patrocinador';
            case 'establecimiento': return 'Establecimiento';
            case 'clinica': return 'Clínica';
            case 'hogar_temporal': return 'Hogar temporal';
            case 'funeraria': return 'Funeraria';
            default: return 'Usuario';
        }
    };

    const billingPortalMutation = useMutation({
        mutationFn: () => createBillingPortalSession(),
        onSuccess: (data) => {
            if (data.url) {
                Linking.openURL(data.url);
            }
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo abrir el portal de facturación' });
        },
    });

    const handleOpenBillingPortal = () => {
        billingPortalMutation.mutate();
    };

    return {
        // Data
        profile,
        isLoading,
        isError,
        refetch,
        formData,
        isEditing,
        isSaving: updateMutation.isPending,

        // Actions
        handleSave,
        handleCancel,
        handleLogout,
        toggleEditing,
        updateField,
        handleOpenBillingPortal,
        isOpeningBillingPortal: billingPortalMutation.isPending,

        // Helpers
        getRoleIcon,
        getRoleLabel,
    };
}
