/**
 * useMyPrograms — programas propios del entrenador (`/entrenadores/gestion`).
 * Crear, editar y eliminar cursos. Espejo pendiente en web.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getMyPrograms, deleteProgram, TrainingProgram } from '@/src/services/training';
import { showAlert } from '@/src/components/AppAlert';

export function useMyPrograms() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        data: programs = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery<TrainingProgram[]>({
        queryKey: ['my-training-programs'],
        queryFn: getMyPrograms,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProgram(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-training-programs'] });
            queryClient.invalidateQueries({ queryKey: ['trainingPrograms'] });
            showAlert({ type: 'success', title: 'Programa eliminado', message: 'El programa ya no aparece en el catálogo.' });
        },
        onError: (e: Error) => {
            showAlert({
                type: 'error',
                title: 'No se pudo eliminar',
                message: e.message || 'Inténtalo de nuevo. Un programa con inscripciones no se puede eliminar.',
            });
        },
    });

    const handleDelete = (program: TrainingProgram) => {
        showAlert({
            type: 'warning',
            title: '¿Eliminar programa?',
            message: `Se eliminará "${program.title}". Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(program.id),
        });
    };

    return {
        programs,
        isLoading,
        isRefetching,
        refetch,
        handleDelete,
        goToNewProgram: () => router.push('/entrenadores/nuevo-programa'),
        goToEditProgram: (id: string) => router.push(`/entrenadores/nuevo-programa?editId=${id}`),
        deletingId: deleteMutation.isPending ? deleteMutation.variables : undefined,
    };
}

export type { TrainingProgram };
