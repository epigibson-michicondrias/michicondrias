/**
 * useServiceProfile — Business logic for professional profile editing
 * Manages walker/sitter profile data, form state, and save operations
 */
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { getMyWalkerProfile, updateWalker } from '@/src/services/paseadores';
import { getMySitterProfile, updateSitter } from '@/src/services/cuidadores';
import { useAuth } from '@/src/contexts/AuthContext';

export function useServiceProfile() {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const isWalker = user?.role_name === 'walker';
    const isSitter = user?.role_name === 'sitter';

    const { data: walkerProfile, isLoading: loadingWalker } = useQuery({
        queryKey: ['my-walker-profile'],
        queryFn: getMyWalkerProfile,
        enabled: isWalker,
    });

    const { data: sitterProfile, isLoading: loadingSitter } = useQuery({
        queryKey: ['my-sitter-profile'],
        queryFn: getMySitterProfile,
        enabled: isSitter,
    });

    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isWalker && walkerProfile) {
            setFormData({
                display_name: walkerProfile.display_name,
                bio: walkerProfile.bio || '',
                location: walkerProfile.location || '',
                price_per_walk: walkerProfile.price_per_walk?.toString() || '0',
                price_per_hour: walkerProfile.price_per_hour?.toString() || '0',
                is_active: walkerProfile.is_active,
                accepts_dogs: walkerProfile.accepts_dogs,
                accepts_cats: walkerProfile.accepts_cats,
            });
        } else if (isSitter && sitterProfile) {
            setFormData({
                display_name: sitterProfile.display_name,
                bio: sitterProfile.bio || '',
                location: sitterProfile.location || '',
                price_per_day: sitterProfile.price_per_day?.toString() || '0',
                price_per_visit: sitterProfile.price_per_visit?.toString() || '0',
                is_active: sitterProfile.is_active,
                accepts_dogs: sitterProfile.accepts_dogs,
                accepts_cats: sitterProfile.accepts_cats,
            });
        }
    }, [walkerProfile, sitterProfile, isWalker, isSitter]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (isWalker && walkerProfile) {
                await updateWalker(walkerProfile.id, {
                    ...formData,
                    price_per_walk: parseFloat(formData.price_per_walk),
                    price_per_hour: parseFloat(formData.price_per_hour),
                });
                queryClient.invalidateQueries({ queryKey: ['my-walker-profile'] });
            } else if (isSitter && sitterProfile) {
                await updateSitter(sitterProfile.id, {
                    ...formData,
                    price_per_day: parseFloat(formData.price_per_day),
                    price_per_visit: parseFloat(formData.price_per_visit),
                });
                queryClient.invalidateQueries({ queryKey: ['my-sitter-profile'] });
            }
            showAlert({ type: 'success', title: 'Éxito', message: 'Perfil actualizado correctamente' });
            router.back();
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo guardar el perfil' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const isLoading = loadingWalker || loadingSitter;

    return {
        isWalker,
        isSitter,
        formData,
        updateField,
        saving,
        isLoading,
        handleSave,
    };
}
