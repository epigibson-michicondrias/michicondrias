/**
 * useProfile — Hook for user profile data, edit state, and mutations
 * Extracts data fetching and form logic from app/perfil/index.tsx
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/contexts/AuthContext';
import { getCurrentUser, type User } from '@/src/lib/auth';
import { createBillingPortalSession } from '@/src/services/ecommerce';
import { showAlert } from '@/src/components/AppAlert';
import { Linking } from 'react-native';

export interface ProfileFormData {
    full_name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
}

export function useProfile() {
    const { user, signOut } = useAuth();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
    });

    const { data: profile, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: getCurrentUser,
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                email: profile.email || '',
                phone: '', // No está en la interfaz User
                location: '', // No está en la interfaz User
                bio: '', // No está en la interfaz User
            });
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: (data: Partial<User>) => {
            // Por ahora simulamos la actualización
            return Promise.resolve(data as User);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            setIsEditing(false);
            showAlert({ type: 'success', title: 'Éxito', message: 'Tu perfil ha sido actualizado' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar el perfil' });
        },
    });

    const handleSave = () => {
        if (!formData.full_name.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre es requerido' });
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
                phone: formData.phone || '',
                location: formData.location || '',
                bio: formData.bio || '',
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
