/**
 * useWalkerDetail — Hook for walker detail screen
 * Manages walker data fetching, favorite state, requestWalk mutation, and registration
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { getWalker, requestWalk, registerAsWalker, getWalkerReviews, createWalkerReview, Walker, WalkRequest, WalkerReview } from '@/src/services/paseadores';
import { getUserPets } from '@/src/services/mascotas';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export function useWalkerDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [isFavorite, setIsFavorite] = useState(false);
    const [walkModalVisible, setWalkModalVisible] = useState(false);
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [walkDate, setWalkDate] = useState('');
    const [walkNotes, setWalkNotes] = useState('');
    const [walkDuration, setWalkDuration] = useState(30);

    const { data: walker, isLoading, error } = useQuery<Walker>({
        queryKey: ['walker', id],
        queryFn: () => getWalker(id as string),
        enabled: !!id,
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<WalkerReview[]>({
        queryKey: ['walker-reviews', id],
        queryFn: () => getWalkerReviews(id as string),
        enabled: !!id,
    });

    const { data: myPets = [] } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    const requestWalkMutation = useMutation({
        mutationFn: (data: Partial<WalkRequest>) => requestWalk(id as string, data),
        onSuccess: () => {
            setWalkModalVisible(false);
            resetWalkForm();
            showAlert({ type: 'success', title: '¡Solicitud Enviada!', message: 'Tu solicitud de paseo ha sido enviada al paseador.' });
            queryClient.invalidateQueries({ queryKey: ['my-walk-requests'] });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo enviar la solicitud de paseo.' });
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: Partial<Walker>) => registerAsWalker(data),
        onSuccess: () => {
            setRegisterModalVisible(false);
            showAlert({ type: 'success', title: '¡Registro Exitoso!', message: 'Te has registrado como paseador. Tu perfil será revisado.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo completar el registro.' });
        },
    });

    const createReviewMutation = useMutation({
        mutationFn: ({ requestId, data }: { requestId: string; data: { rating: number; comment: string } }) =>
            createWalkerReview(id as string, requestId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['walker-reviews', id] });
            showAlert({ type: 'success', title: '¡Reseña Enviada!', message: 'Tu reseña ha sido publicada.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo enviar la reseña.' });
        },
    });

    const resetWalkForm = () => {
        setSelectedPetId(null);
        setWalkDate('');
        setWalkNotes('');
        setWalkDuration(30);
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleContact = () => {
        showAlert({
            type: 'info',
            title: 'Contactar Paseador',
            message: '¿Cómo deseas contactar a este paseador?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Mensaje',
            onButtonPress: () => {
                showAlert({ type: 'info', title: 'Mensaje', message: 'Abriendro chat con el paseador...' });
            },
        });
    };

    const handleBook = () => {
        setWalkModalVisible(true);
    };

    const handleSubmitWalkRequest = () => {
        if (!selectedPetId) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona una mascota para el paseo.' });
            return;
        }
        requestWalkMutation.mutate({
            pet_id: selectedPetId,
            requested_date: walkDate || new Date().toISOString().split('T')[0],
            duration_minutes: walkDuration,
            notes: walkNotes || undefined,
        });
    };

    const handleRegisterAsWalker = (data: Partial<Walker>) => {
        registerMutation.mutate(data);
    };

    const handleCreateReview = (requestId: string, data: { rating: number; comment: string }) => {
        createReviewMutation.mutate({ requestId, data });
    };

    return {
        walker,
        isLoading,
        error,
        isFavorite,
        toggleFavorite,
        handleContact,
        handleBook,
        // Walk request
        walkModalVisible,
        setWalkModalVisible,
        selectedPetId,
        setSelectedPetId,
        walkDate,
        setWalkDate,
        walkNotes,
        setWalkNotes,
        walkDuration,
        setWalkDuration,
        myPets,
        handleSubmitWalkRequest,
        isRequestingWalk: requestWalkMutation.isPending,
        // Registration
        registerModalVisible,
        setRegisterModalVisible,
        handleRegisterAsWalker,
        isRegistering: registerMutation.isPending,
        // Reviews
        reviews,
        reviewsLoading,
        handleCreateReview,
        isCreatingReview: createReviewMutation.isPending,
    };
}
