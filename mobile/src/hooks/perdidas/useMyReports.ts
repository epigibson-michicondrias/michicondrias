/**
 * useMyReports — Mis reportes de mascotas perdidas/encontradas: ver, editar, marcar como resuelto y eliminar.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { deleteReport, getMyReports } from '@/src/services/perdidas';
import { showAlert } from '@/src/components/AppAlert';
import type { LostPetReport } from '@/src/services/perdidas';

export function useMyReports() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['my-lost-reports'],
        queryFn: getMyReports,
    });

    // Activos primero, luego los más recientes
    const reports = [...data].sort((a, b) =>
        Number(a.is_resolved) - Number(b.is_resolved)
        || new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());

    const deleteMutation = useMutation({
        mutationFn: deleteReport,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['my-lost-reports'] });
            queryClient.invalidateQueries({ queryKey: ['lost-pet-reports'] });
            queryClient.invalidateQueries({ queryKey: ['lost-pet-resolved'] });
            queryClient.removeQueries({ queryKey: ['perdidas-report', id] });
            showAlert({ type: 'success', title: 'Reporte eliminado', message: 'Ya no aparece en el listado ni en el mapa.' });
        },
        onError: (e: Error) => showAlert({ type: 'error', title: 'No se pudo eliminar', message: e.message || 'Inténtalo de nuevo.' }),
    });

    const handleDelete = (report: LostPetReport) => showAlert({
        type: 'warning',
        title: `¿Eliminar el reporte de ${report.pet_name}?`,
        message: report.is_resolved
            ? 'Se borrará del historial.'
            : 'Dejará de mostrarse a la comunidad. Si ya regresó a casa, mejor márcalo como reunido desde el reporte.',
        showCancel: true,
        cancelText: 'Cancelar',
        buttonText: 'Eliminar',
        onButtonPress: () => deleteMutation.mutate(report.id),
    });

    const active = data.filter((x) => !x.is_resolved).length;

    return {
        reports,
        activeLabel: active === 0 ? 'Sin reportes activos' : `${active} ${active === 1 ? 'activo' : 'activos'}`,
        isLoading,
        refetch,
        isRefetching,
        deletingId: deleteMutation.isPending ? deleteMutation.variables : undefined,
        handleDelete,
        openReport: (id: string) => router.push(`/perdidas/${id}`),
        editReport: (id: string) => router.push(`/perdidas/editar/${id}`),
        goToNew: () => router.push('/perdidas/nuevo'),
    };
}
