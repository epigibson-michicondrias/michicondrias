/**
 * useSitterDetail — Hook for sitter detail screen
 * Manages sitter data fetching, favorite state, requestSit mutation, and registration
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { getSitter, requestSit, registerAsSitter, getSitterReviews, createSitterReview, Sitter, SitRequest, SitterReview } from '@/src/services/cuidadores';
import { getUserPets } from '@/src/services/mascotas';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';

export function useSitterDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [isFavorite, setIsFavorite] = useState(false);
    const [sitModalVisible, setSitModalVisible] = useState(false);
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sitNotes, setSitNotes] = useState('');

    const { data: sitter, isLoading, error } = useQuery<Sitter>({
        queryKey: ['sitter', id],
        queryFn: () => getSitter(id as string),
        enabled: !!id,
    });

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<SitterReview[]>({
        queryKey: ['sitter-reviews', id],
        queryFn: () => getSitterReviews(id as string),
        enabled: !!id,
    });

    const { data: myPets = [] } = useQuery({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    const requestSitMutation = useMutation({
        mutationFn: (data: Partial<SitRequest>) => requestSit(id as string, data),
        onSuccess: () => {
            setSitModalVisible(false);
            resetSitForm();
            showAlert({ type: 'success', title: '¡Solicitud Enviada!', message: 'Tu solicitud de cuidado ha sido enviada.' });
            queryClient.invalidateQueries({ queryKey: ['my-sit-requests'] });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo enviar la solicitud.' });
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: Partial<Sitter>) => registerAsSitter(data),
        onSuccess: () => {
            setRegisterModalVisible(false);
            showAlert({ type: 'success', title: '¡Registro Exitoso!', message: 'Te has registrado como cuidador. Tu perfil será revisado.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo completar el registro.' });
        },
    });

    const createReviewMutation = useMutation({
        mutationFn: ({ requestId, data }: { requestId: string; data: { rating: number; comment: string } }) =>
            createSitterReview(id as string, requestId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sitter-reviews', id] });
            showAlert({ type: 'success', title: '¡Reseña Enviada!', message: 'Tu reseña ha sido publicada.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo enviar la reseña.' });
        },
    });

    const resetSitForm = () => {
        setSelectedPetId(null);
        setStartDate('');
        setEndDate('');
        setSitNotes('');
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleContact = () => {
        showAlert({
            type: 'info',
            title: 'Contactar Cuidador',
            message: '¿Cómo deseas contactar a este cuidador?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Mensaje',
            onButtonPress: () => {
                showAlert({ type: 'info', title: 'Mensaje', message: 'Abriendro chat con el cuidador...' });
            },
        });
    };

    const handleBook = (_serviceType: string) => {
        setSitModalVisible(true);
    };

    const handleSubmitSitRequest = () => {
        if (!selectedPetId) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona una mascota.' });
            return;
        }
        if (!startDate || !endDate) {
            showAlert({ type: 'error', title: 'Error', message: 'Selecciona las fechas de inicio y fin.' });
            return;
        }
        requestSitMutation.mutate({
            pet_id: selectedPetId,
            service_type: sitter?.service_type || 'daycare',
            start_date: startDate,
            end_date: endDate,
            notes: sitNotes || undefined,
        });
    };

    const handleRegisterAsSitter = (data: Partial<Sitter>) => {
        registerMutation.mutate(data);
    };

    const handleCreateReview = (requestId: string, data: { rating: number; comment: string }) => {
        createReviewMutation.mutate({ requestId, data });
    };

    const getServiceName = (type: string) => {
        switch (type) {
            case 'daycare': return 'Guardería Diaria';
            case 'boarding': return 'Hospedaje Nocturno';
            default: return 'Cuidado Completo';
        }
    };

    return {
        sitter,
        isLoading,
        error,
        isFavorite,
        toggleFavorite,
        handleContact,
        handleBook,
        getServiceName,
        // Sit request
        sitModalVisible,
        setSitModalVisible,
        selectedPetId,
        setSelectedPetId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        sitNotes,
        setSitNotes,
        myPets,
        handleSubmitSitRequest,
        isRequestingSit: requestSitMutation.isPending,
        // Registration
        registerModalVisible,
        setRegisterModalVisible,
        handleRegisterAsSitter,
        isRegistering: registerMutation.isPending,
        // Reviews
        reviews,
        reviewsLoading,
        handleCreateReview,
        isCreatingReview: createReviewMutation.isPending,
    };
}
