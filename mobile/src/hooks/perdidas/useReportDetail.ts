/**
 * useReportDetail — Hook for lost/found pet report detail screen
 * Manages report fetching, resolve mutation, and owner checks
 */
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportById, resolveReport } from '@/src/services/perdidas';
import { useAuth } from '@/src/contexts/AuthContext';
import { Linking } from 'react-native';
import { showAlert } from '@/src/components/AppAlert';

export function useReportDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: report, isLoading, error } = useQuery({
        queryKey: ['perdidas-report', id],
        queryFn: () => getReportById(id?.toString() || ''),
        enabled: !!id,
        refetchInterval: (query) => (query.state.data?.has_tracker ? 5000 : false),
    });

    const resolveMutation = useMutation({
        mutationFn: () => resolveReport(id?.toString() || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perdidas-report', id] });
            showAlert({
                type: 'success',
                title: '¡Felicidades!',
                message: 'Nos alegra mucho que este michi haya regresado a casa. ❤️',
            });
        },
    });

    const isOwner = user?.id === report?.reporter_id;

    const handleResolve = () => {
        showAlert({
            type: 'info',
            title: '¿Ya regresó a casa?',
            message: 'Esto marcará el reporte como RESUELTO y se notificará a la comunidad.',
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: '¡SÍ, YA REGRESÓ!',
            onButtonPress: () => resolveMutation.mutate(),
        });
    };

    const handleCall = () => {
        Linking.openURL(`tel:${report?.contact_phone || '5551234567'}`);
    };

    const goBack = () => router.back();

    return {
        // Data
        report,
        isLoading,
        error,
        isOwner,

        // Actions
        handleResolve,
        handleCall,
        goBack,
    };
}
