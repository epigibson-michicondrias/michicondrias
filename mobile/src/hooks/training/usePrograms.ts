import { useQuery } from '@tanstack/react-query';
import { getAllPrograms, TrainingProgram } from '@/src/services/training';

export function usePrograms() {
    const {
        data: programs = [],
        isLoading,
        refetch,
        isRefetching,
    } = useQuery<TrainingProgram[]>({
        queryKey: ['trainingPrograms'],
        queryFn: () => getAllPrograms(),
    });

    return {
        programs,
        isLoading,
        refetch,
        isRefetching,
    };
}
