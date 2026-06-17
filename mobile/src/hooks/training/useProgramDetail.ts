/**
 * useProgramDetail — Hook for training program detail screen
 * Fetches program list and finds the matching program by route param ID
 */
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAllPrograms, TrainingProgram } from '@/src/services/training';
import { showAlert } from '@/src/components/AppAlert';

export function useProgramDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: programs = [], isLoading, error } = useQuery<TrainingProgram[]>({
        queryKey: ['trainingPrograms'],
        queryFn: () => getAllPrograms(),
    });

    const program = programs.find(p => p.id === id);

    const handleEnroll = () => {
        showAlert({
            type: 'info',
            title: 'Inscribir mascota',
            message: '¿Deseas inscribir a tu mascota en este programa?',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Inscribir',
            onButtonPress: () => {
                if (id) {
                    router.push({ pathname: '/entrenadores/inscribir/[programId]', params: { programId: id } } as any);
                }
            },
        });
    };

    return {
        program,
        isLoading,
        error,
        handleEnroll,
    };
}
