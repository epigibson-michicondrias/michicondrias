/**
 * useEnrollment — Hook for training enrollment logic
 * Handles fetching client enrollments, user pets, and enrollment mutation
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import {
    enrollPet,
    getClientEnrollments,
    getAllPrograms,
    TrainingEnrollment,
    TrainingEnrollmentCreate,
    TrainingProgram,
} from '@/src/services/training';
import { getUserPets, Pet } from '@/src/services/mascotas';
import { showAlert } from '@/src/components/AppAlert';

export function useEnrollment() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { programId } = useLocalSearchParams<{ programId: string }>();

    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

    // Fetch user's pets
    const {
        data: pets = [],
        isLoading: isPetsLoading,
    } = useQuery<Pet[]>({
        queryKey: ['user-pets', user?.id],
        queryFn: () => getUserPets(user!.id),
        enabled: !!user?.id,
    });

    // Fetch all programs to find the selected one
    const {
        data: programs = [],
        isLoading: isProgramsLoading,
    } = useQuery<TrainingProgram[]>({
        queryKey: ['trainingPrograms'],
        queryFn: () => getAllPrograms(),
    });

    // Fetch client enrollments
    const {
        data: enrollments = [],
        isLoading: isEnrollmentsLoading,
        refetch: refetchEnrollments,
        isRefetching: isRefetchingEnrollments,
    } = useQuery<TrainingEnrollment[]>({
        queryKey: ['clientEnrollments'],
        queryFn: () => getClientEnrollments(),
        enabled: !!user,
    });

    const program = programs.find(p => p.id === programId);

    const enrollMutation = useMutation({
        mutationFn: (data: TrainingEnrollmentCreate) => enrollPet(data),
        onSuccess: () => {
            showAlert({
                type: 'success',
                title: '¡Inscripción exitosa!',
                message: 'Tu mascota ha sido inscrita en el programa de entrenamiento.',
            });
            queryClient.invalidateQueries({ queryKey: ['clientEnrollments'] });
            router.back();
        },
        onError: (error: any) => {
            showAlert({
                type: 'error',
                title: 'Error',
                message: error.message || 'No se pudo completar la inscripción.',
            });
        },
    });

    const handleEnroll = () => {
        if (!selectedPetId) {
            showAlert({ type: 'warning', title: 'Selecciona una mascota', message: 'Debes seleccionar una mascota para inscribir.' });
            return;
        }
        if (!programId) {
            showAlert({ type: 'error', title: 'Error', message: 'No se encontró el programa.' });
            return;
        }

        showAlert({
            type: 'info',
            title: 'Confirmar inscripción',
            message: `¿Deseas inscribir a tu mascota en "${program?.title || 'este programa'}"?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Inscribir',
            onButtonPress: () => {
                enrollMutation.mutate({
                    pet_id: selectedPetId,
                    program_id: programId,
                    start_date: new Date().toISOString().split('T')[0],
                });
            },
        });
    };

    /** Enrich enrollments with program info */
    const enrichedEnrollments = enrollments.map(enrollment => {
        const prog = programs.find(p => p.id === enrollment.program_id);
        const pet = pets.find(p => p.id === enrollment.pet_id);
        return {
            ...enrollment,
            programTitle: prog?.title || 'Programa desconocido',
            petName: pet?.name || 'Mascota',
        };
    });

    return {
        // Enrollment form
        program,
        pets,
        selectedPetId,
        setSelectedPetId,
        handleEnroll,
        isEnrolling: enrollMutation.isPending,
        isLoading: isPetsLoading || isProgramsLoading,

        // Client enrollments list
        enrollments: enrichedEnrollments,
        isEnrollmentsLoading: isEnrollmentsLoading || isProgramsLoading || isPetsLoading,
        refetchEnrollments,
        isRefetchingEnrollments,
    };
}
