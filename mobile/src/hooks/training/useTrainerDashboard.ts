/**
 * useTrainerDashboard — Hook for trainer/provider dashboard
 * Handles provider enrollments, program creation, and goal management
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getProviderEnrollments, createProgram, createGoal, updateGoal, reviewGoalVideo, updateEnrollmentStatus, TrainingEnrollment, TrainingProgramCreate, PetTrainingGoalCreate, PetTrainingGoalUpdate } from '@/src/services/training';
import { showAlert } from '@/src/components/AppAlert';

export interface ProgramFormData {
    title: string;
    description: string;
    price: string;
    duration_weeks: string;
}

const PROGRAM_FORM_DEFAULTS: ProgramFormData = {
    title: '',
    description: '',
    price: '',
    duration_weeks: '',
};

export interface GoalFormData {
    goal_name: string;
    progress_notes: string;
}

const GOAL_FORM_DEFAULTS: GoalFormData = {
    goal_name: '',
    progress_notes: '',
};

export function useTrainerDashboard() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id: enrollmentId } = useLocalSearchParams<{ id: string }>();

    // Program creation form state
    const [programForm, setProgramForm] = useState<ProgramFormData>({ ...PROGRAM_FORM_DEFAULTS });

    // Goal form state
    const [goalForm, setGoalForm] = useState<GoalFormData>({ ...GOAL_FORM_DEFAULTS });
    const [reviewNotes, setReviewNotes] = useState('');

    // Fetch provider enrollments
    const {
        data: enrollments = [],
        isLoading: isEnrollmentsLoading,
        refetch: refetchEnrollments,
        isRefetching: isRefetchingEnrollments,
    } = useQuery<TrainingEnrollment[]>({
        queryKey: ['providerEnrollments'],
        queryFn: () => getProviderEnrollments(),
    });

    // — Mutations —

    const createProgramMutation = useMutation({
        mutationFn: (data: TrainingProgramCreate) => createProgram(data),
        onSuccess: () => {
            showAlert({ type: 'success', title: '¡Programa creado!', message: 'El programa de entrenamiento ha sido creado exitosamente.' });
            queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
            setProgramForm({ ...PROGRAM_FORM_DEFAULTS });
            router.back();
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo crear el programa.' }),
    });

    const createGoalMutation = useMutation({
        mutationFn: (data: PetTrainingGoalCreate) => createGoal(data),
        onSuccess: () => {
            showAlert({ type: 'success', title: '¡Meta creada!', message: 'La meta de entrenamiento ha sido asignada.' });
            queryClient.invalidateQueries({ queryKey: ['trainingGoals'] });
            queryClient.invalidateQueries({ queryKey: ['providerEnrollments'] });
            queryClient.invalidateQueries({ queryKey: ['clientEnrollments'] });
            setGoalForm({ ...GOAL_FORM_DEFAULTS });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo crear la meta.' }),
    });

    const updateGoalMutation = useMutation({
        mutationFn: ({ goalId, data }: { goalId: string; data: PetTrainingGoalUpdate }) => updateGoal(goalId, data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Meta actualizada', message: 'El progreso ha sido guardado.' });
            queryClient.invalidateQueries({ queryKey: ['trainingGoals'] });
            queryClient.invalidateQueries({ queryKey: ['providerEnrollments'] });
            queryClient.invalidateQueries({ queryKey: ['clientEnrollments'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo actualizar la meta.' }),
    });

    const reviewVideoMutation = useMutation({
        mutationFn: ({ goalId, approved, notes }: { goalId: string; approved: boolean; notes: string }) =>
            reviewGoalVideo(goalId, approved, notes),
        onSuccess: (_data, variables) => {
            const action = variables.approved ? 'aprobado' : 'rechazado';
            showAlert({ type: 'success', title: `Video ${action}`, message: `El video de evidencia ha sido ${action}.` });
            queryClient.invalidateQueries({ queryKey: ['trainingGoals'] });
            setReviewNotes('');
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo revisar el video.' }),
    });

    const enrollmentStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateEnrollmentStatus(id, status),
        onSuccess: (_d, v) => {
            showAlert({ type: 'success', title: v.status === 'completed' ? 'Programa finalizado' : 'Inscripción cancelada', message: 'El cambio ya es visible para ambas partes.' });
            queryClient.invalidateQueries({ queryKey: ['providerEnrollments'] });
            queryClient.invalidateQueries({ queryKey: ['clientEnrollments'] });
            queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
        },
        onError: (error: any) => showAlert({ type: 'error', title: 'Error', message: error.message || 'No se pudo actualizar la inscripción.' }),
    });

    // — Handlers —

    const updateProgramField = <K extends keyof ProgramFormData>(field: K, value: ProgramFormData[K]) => {
        setProgramForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateProgram = () => {
        if (!programForm.title.trim()) {
            showAlert({ type: 'warning', title: 'Campo requerido', message: 'El nombre del programa es obligatorio.' });
            return;
        }
        if (!programForm.price.trim()) {
            showAlert({ type: 'warning', title: 'Campo requerido', message: 'El precio es obligatorio.' });
            return;
        }

        const price = parseFloat(programForm.price.replace(',', '.'));
        if (!Number.isFinite(price) || price <= 0) {
            showAlert({ type: 'warning', title: 'Precio inválido', message: 'Escribe un precio mayor a 0.' });
            return;
        }
        const weeks = programForm.duration_weeks ? parseInt(programForm.duration_weeks, 10) : undefined;
        if (weeks !== undefined && (!Number.isFinite(weeks) || weeks < 1)) {
            showAlert({ type: 'warning', title: 'Duración inválida', message: 'Las semanas deben ser al menos 1.' });
            return;
        }
        createProgramMutation.mutate({
            title: programForm.title.trim(),
            description: programForm.description.trim() || undefined,
            price: parseFloat(programForm.price.replace(',', '.')),
            duration_weeks: weeks,
        });
    };

    const handleCreateGoal = (petId: string, programId?: string) => {
        if (!goalForm.goal_name.trim()) {
            showAlert({ type: 'warning', title: 'Campo requerido', message: 'El nombre de la meta es obligatorio.' });
            return;
        }
        createGoalMutation.mutate({
            pet_id: petId,
            program_id: programId,
            goal_name: goalForm.goal_name.trim(),
            progress_notes: goalForm.progress_notes.trim() || undefined,
        });
    };

    const handleUpdateGoal = (goalId: string, data: PetTrainingGoalUpdate) => {
        updateGoalMutation.mutate({ goalId, data });
    };

    const handleReviewVideo = (goalId: string, approved: boolean) => {
        showAlert({
            type: approved ? 'info' : 'warning',
            title: approved ? 'Aprobar video' : 'Rechazar video',
            message: `¿Confirmar ${approved ? 'aprobación' : 'rechazo'} del video de evidencia?`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Confirmar',
            onButtonPress: () => {
                reviewVideoMutation.mutate({
                    goalId,
                    approved,
                    notes: reviewNotes.trim(),
                });
            },
        });
    };

    return {
        setEnrollmentStatus: (id: string, status: string) => enrollmentStatusMutation.mutate({ id, status }),
        isUpdatingEnrollment: enrollmentStatusMutation.isPending,
        // Provider enrollments
        enrollments,
        isEnrollmentsLoading,
        refetchEnrollments,
        isRefetchingEnrollments,

        // Program creation
        programForm,
        updateProgramField,
        handleCreateProgram,
        isCreatingProgram: createProgramMutation.isPending,

        // Goal management
        goalForm,
        setGoalForm,
        reviewNotes,
        setReviewNotes,
        handleCreateGoal,
        handleUpdateGoal,
        handleReviewVideo,
        isCreatingGoal: createGoalMutation.isPending,
        isUpdatingGoal: updateGoalMutation.isPending,
        isReviewingVideo: reviewVideoMutation.isPending,
    };
}
