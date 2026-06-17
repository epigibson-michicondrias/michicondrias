/**
 * useVenueForm — Hook for venue create/edit forms
 * Manages form state, amenities, and CRUD mutations
 */
import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    createVenue,
    updateVenue,
    deleteVenue,
    getVenue,
    Venue,
    VenueCreate,
    VenueUpdate,
} from '@/src/services/venues';
import { showAlert } from '@/src/components/AppAlert';

export interface VenueFormData {
    name: string;
    address: string;
    discount_coupon: string;
    discount_description: string;
}

const DEFAULT_AMENITIES: Record<string, boolean> = {
    'Estacionamiento': false,
    'WiFi': false,
    'Pet-Friendly': false,
    'Agua para mascotas': false,
    'Área de juegos': false,
    'Guardería': false,
};

export function useVenueForm(mode: 'create' | 'edit' = 'create') {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [formData, setFormData] = useState<VenueFormData>({
        name: '',
        address: '',
        discount_coupon: '',
        discount_description: '',
    });

    const [amenities, setAmenities] = useState<Record<string, boolean>>({ ...DEFAULT_AMENITIES });

    // Fetch existing venue for edit mode
    const { data: existingVenue, isLoading: isLoadingVenue } = useQuery<Venue>({
        queryKey: ['venue', id],
        queryFn: () => getVenue(id as string),
        enabled: mode === 'edit' && !!id,
    });

    // Populate form with existing venue data
    useEffect(() => {
        if (existingVenue && mode === 'edit') {
            setFormData({
                name: existingVenue.name || '',
                address: existingVenue.address || '',
                discount_coupon: existingVenue.discount_coupon || '',
                discount_description: existingVenue.discount_description || '',
            });
            if (existingVenue.amenities) {
                const mergedAmenities = { ...DEFAULT_AMENITIES };
                Object.entries(existingVenue.amenities).forEach(([key, value]) => {
                    mergedAmenities[key] = Boolean(value);
                });
                setAmenities(mergedAmenities);
            }
        }
    }, [existingVenue, mode]);

    // Create mutation
    const createMutation = useMutation<Venue, Error, VenueCreate>({
        mutationFn: (data) => createVenue(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            showAlert({
                type: 'success',
                title: '¡Establecimiento creado!',
                message: 'El establecimiento ha sido registrado exitosamente.',
            });
            router.back();
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo crear el establecimiento. Intenta de nuevo.',
            });
        },
    });

    // Update mutation
    const updateMutation = useMutation<Venue, Error, { id: string; data: VenueUpdate }>({
        mutationFn: ({ id: venueId, data }) => updateVenue(venueId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            queryClient.invalidateQueries({ queryKey: ['venue', id] });
            showAlert({
                type: 'success',
                title: '¡Actualizado!',
                message: 'El establecimiento ha sido actualizado exitosamente.',
            });
            router.back();
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo actualizar el establecimiento.',
            });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation<void, Error, string>({
        mutationFn: (venueId) => deleteVenue(venueId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['venues'] });
            showAlert({
                type: 'success',
                title: 'Eliminado',
                message: 'El establecimiento ha sido eliminado.',
            });
            router.replace('/establecimientos');
        },
        onError: () => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'No se pudo eliminar el establecimiento.',
            });
        },
    });

    const updateField = (field: keyof VenueFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleAmenity = (amenity: string) => {
        setAmenities(prev => ({ ...prev, [amenity]: !prev[amenity] }));
    };

    const getActiveAmenities = (): Record<string, any> => {
        const active: Record<string, any> = {};
        Object.entries(amenities).forEach(([key, value]) => {
            if (value) active[key] = true;
        });
        return active;
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'El nombre es requerido.' });
            return;
        }
        if (!formData.address.trim()) {
            showAlert({ type: 'error', title: 'Error', message: 'La dirección es requerida.' });
            return;
        }

        const venueData = {
            name: formData.name.trim(),
            address: formData.address.trim(),
            amenities: getActiveAmenities(),
            discount_coupon: formData.discount_coupon.trim() || undefined,
            discount_description: formData.discount_description.trim() || undefined,
        };

        if (mode === 'edit' && id) {
            updateMutation.mutate({ id, data: venueData });
        } else {
            createMutation.mutate(venueData);
        }
    };

    const handleDelete = () => {
        if (!id) return;
        showAlert({
            type: 'warning',
            title: 'Eliminar establecimiento',
            message: '¿Estás seguro de que deseas eliminar este establecimiento? Esta acción no se puede deshacer.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(id),
        });
    };

    return {
        // Form data
        formData,
        amenities,
        updateField,
        toggleAmenity,

        // Actions
        handleSubmit,
        handleDelete,

        // Loading states
        isLoadingVenue,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        isDeleting: deleteMutation.isPending,

        // Existing venue
        existingVenue,

        // Navigation
        router,
    };
}
