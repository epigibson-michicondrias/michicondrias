/**
 * useSitterDetail — Hook for sitter detail screen
 * Manages sitter data fetching, favorite state, requestSit mutation, and registration
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { getSitter, requestSit, registerAsSitter, getSitterReviews, createSitterReview, getMySitRequests, Sitter, SitRequest, SitterReview } from '@/src/services/cuidadores';
import { getUserPets } from '@/src/services/mascotas';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import { errorMessage, toLocalIsoDate } from '@/src/hooks/servicios-pro/requestStatus';

export function useSitterDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [isFavorite, setIsFavorite] = useState(false);
    const [sitModalVisible, setSitModalVisible] = useState(false);
    const [registerModalVisible, setRegisterModalVisible] = useState(false);
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(toLocalIsoDate(new Date()));
    const [endDate, setEndDate] = useState(toLocalIsoDate(new Date()));
    const [sitServiceType, setSitServiceType] = useState<'hosting' | 'visiting'>('hosting');
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

    const { data: mySitRequests = [] } = useQuery<SitRequest[]>({
        queryKey: ['my-sit-requests'],
        queryFn: getMySitRequests,
        enabled: !!user?.id,
    });

    const unreviewedCompletedRequests = mySitRequests.filter(
        (req) =>
            req.sitter_id === id &&
            req.status === 'completed' &&
            !reviews.some((rev) => rev.sit_request_id === req.id)
    );

    const requestSitMutation = useMutation({
        mutationFn: (data: Partial<SitRequest>) => requestSit(id as string, data),
        onSuccess: () => {
            setSitModalVisible(false);
            resetSitForm();
            showAlert({ type: 'success', title: '¡Solicitud Enviada!', message: 'Tu solicitud de cuidado ha sido enviada.' });
            queryClient.invalidateQueries({ queryKey: ['my-sit-requests'] });
            queryClient.invalidateQueries({ queryKey: ['sitter-requests'] });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo enviar', message: errorMessage(e, 'No se pudo enviar la solicitud.') });
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
            queryClient.invalidateQueries({ queryKey: ['sitter', id] });
            queryClient.invalidateQueries({ queryKey: ['sitters'] });
            queryClient.invalidateQueries({ queryKey: ['my-sit-requests'] });
            showAlert({ type: 'success', title: '¡Reseña Enviada!', message: 'Tu reseña ha sido publicada.' });
        },
        onError: (e) => {
            showAlert({ type: 'error', title: 'No se pudo enviar', message: errorMessage(e, 'No se pudo enviar la reseña.') });
        },
    });

    const resetSitForm = () => {
        setSelectedPetId(null);
        setStartDate(toLocalIsoDate(new Date()));
        setEndDate(toLocalIsoDate(new Date()));
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
        if (endDate < startDate) {
            showAlert({ type: 'error', title: 'Fechas inválidas', message: 'La fecha de fin no puede ser anterior a la de inicio.' });
            return;
        }
        requestSitMutation.mutate({
            pet_id: selectedPetId,
            service_type: sitter?.service_type === 'both' ? sitServiceType : (sitter?.service_type || sitServiceType),
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
            case 'hosting': return 'Hospedaje en casa del cuidador';
            case 'visiting': return 'Visitas a domicilio';
            default: return 'Hospedaje y visitas';
        }
    };

    const isOwnProfile = !!sitter && sitter.user_id === user?.id;

    return {
        isOwnProfile,
        sitServiceType,
        setSitServiceType,
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
        unreviewedCompletedRequests,
    };
}
