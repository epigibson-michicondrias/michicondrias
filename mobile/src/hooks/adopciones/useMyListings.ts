/**
 * useMyListings — Hook for fetching user's own adoption listings
 * Extracts data fetching from app/adopciones/mis-publicaciones.tsx
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getMyListings, updateListing, deleteListing } from '@/src/services/adopciones';
import { showAlert } from '@/src/components/AppAlert';
import type { Listing } from '@/src/types/adopciones';

export function useMyListings() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        data: listings = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ['my-adopciones'],
        queryFn: getMyListings,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Listing> }) => updateListing(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-adopciones'] });
            queryClient.invalidateQueries({ queryKey: ['adopciones-listings'] });
            showAlert({ type: 'success', title: 'Actualizado', message: 'La publicación se actualizó correctamente.' });
        },
        onError: (e: Error) => {
            showAlert({ type: 'error', title: 'No se pudo actualizar', message: e.message || 'Inténtalo de nuevo.' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteListing(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-adopciones'] });
            queryClient.invalidateQueries({ queryKey: ['adopciones-listings'] });
            queryClient.invalidateQueries({ queryKey: ['user-listings-with-requests'] });
            showAlert({ type: 'success', title: 'Eliminada', message: 'La publicación ha sido eliminada.' });
        },
        onError: (e: Error) => {
            showAlert({ type: 'error', title: 'No se pudo eliminar', message: e.message || 'Inténtalo de nuevo.' });
        },
    });

    const goToNewListing = () => router.push('/adopciones/nuevo');
    const goToRequests = (listingId: string) => router.push(`/adopciones/ver-solicitudes/${listingId}`);
    const goToEditListing = (listingId: string) => router.push(`/adopciones/nuevo?editId=${listingId}`);

    const handleUpdate = (id: string, data: Partial<Listing>) => {
        updateMutation.mutate({ id, data });
    };

    const handleDelete = (id: string, petName: string) => {
        showAlert({
            type: 'warning',
            title: '¿Eliminar publicación?',
            message: `Se eliminará la publicación de "${petName}". Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(id),
        });
    };

    return {
        listings,
        isLoading,
        isRefetching,
        refetch,
        goToNewListing,
        goToRequests,
        goToEditListing,
        handleUpdate,
        handleDelete,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        deletingId: deleteMutation.isPending ? deleteMutation.variables : undefined,
    };
}

export type { Listing };
