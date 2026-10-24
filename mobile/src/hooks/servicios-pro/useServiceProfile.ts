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
import { useProRole } from './useProRole';
import { errorMessage } from './requestStatus';

/** Campos del formulario. `is_active`/`is_verified` no son editables: el backend no los acepta en el PUT. */
type ProfileForm = {
    display_name?: string;
    bio?: string;
    location?: string;
    price_per_walk?: string;
    price_per_hour?: string;
    price_per_day?: string;
    price_per_visit?: string;
    accepts_dogs?: boolean;
    accepts_cats?: boolean;
};

export function useServiceProfile() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { isWalker, isSitter } = useProRole();

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

    const [formData, setFormData] = useState<ProfileForm>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isWalker && walkerProfile) {
            setFormData({
                display_name: walkerProfile.display_name,
                bio: walkerProfile.bio || '',
                location: walkerProfile.location || '',
                price_per_walk: walkerProfile.price_per_walk?.toString() || '0',
                price_per_hour: walkerProfile.price_per_hour?.toString() || '0',
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
                accepts_dogs: sitterProfile.accepts_dogs,
                accepts_cats: sitterProfile.accepts_cats,
            });
        }
    }, [walkerProfile, sitterProfile, isWalker, isSitter]);

    const num = (v: unknown) => {
        const n = parseFloat(String(v ?? '').replace(',', '.'));
        return Number.isFinite(n) && n >= 0 ? n : null;
    };

    const handleSave = async () => {
        if (!String(formData.display_name || '').trim()) {
            showAlert({ type: 'error', title: 'Falta el nombre', message: 'Escribe el nombre que verán tus clientes.' });
            return;
        }
        const keys: (keyof ProfileForm)[] = isWalker ? ['price_per_walk', 'price_per_hour'] : ['price_per_day', 'price_per_visit'];
        if (keys.some(k => String(formData[k] ?? '').trim() !== '' && num(formData[k]) === null)) {
            showAlert({ type: 'error', title: 'Tarifa inválida', message: 'Las tarifas deben ser números mayores o iguales a 0.' });
            return;
        }
        setSaving(true);
        try {
            if (isWalker && walkerProfile) {
                await updateWalker(walkerProfile.id, {
                    display_name: formData.display_name,
                    bio: formData.bio || null,
                    location: formData.location || null,
                    price_per_walk: num(formData.price_per_walk),
                    price_per_hour: num(formData.price_per_hour),
                    accepts_dogs: !!formData.accepts_dogs,
                    accepts_cats: !!formData.accepts_cats,
                });
                queryClient.invalidateQueries({ queryKey: ['my-walker-profile'] });
                queryClient.invalidateQueries({ queryKey: ['walkers'] });
                queryClient.invalidateQueries({ queryKey: ['walker'] });
            } else if (isSitter && sitterProfile) {
                await updateSitter(sitterProfile.id, {
                    display_name: formData.display_name,
                    bio: formData.bio || null,
                    location: formData.location || null,
                    price_per_day: num(formData.price_per_day),
                    price_per_visit: num(formData.price_per_visit),
                    accepts_dogs: !!formData.accepts_dogs,
                    accepts_cats: !!formData.accepts_cats,
                });
                queryClient.invalidateQueries({ queryKey: ['my-sitter-profile'] });
                queryClient.invalidateQueries({ queryKey: ['sitters'] });
                queryClient.invalidateQueries({ queryKey: ['sitter'] });
            }
            showAlert({ type: 'success', title: 'Perfil guardado', message: 'Tus datos ya se ven actualizados en el directorio.' });
            if (router.canGoBack()) router.back();
        } catch (e: unknown) {
            showAlert({ type: 'error', title: 'No se pudo guardar', message: errorMessage(e, 'No se pudo guardar el perfil. Inténtalo de nuevo.') });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: keyof ProfileForm, value: ProfileForm[keyof ProfileForm]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const profile = isWalker ? walkerProfile : sitterProfile;
    const isLoading = loadingWalker || loadingSitter;

    return {
        isWalker,
        isSitter,
        formData,
        updateField,
        saving,
        isLoading,
        handleSave,
        /** Sello «Verificado» del equipo (X3). */
        isVerified: !!profile?.is_verified,
        /** Suspendido por el equipo: no aparece en el directorio ni acepta solicitudes (X3). */
        isSuspended: profile?.is_active === false,
    };
}
