/**
 * useReportActions — Hook for report matching, broadcasting, and tracker location updates
 * Wires up getReportMatches, broadcastReport, updateTrackerLocation from perdidas service
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportMatches, broadcastReport, updateTrackerLocation } from '@/src/services/perdidas';
import { showAlert } from '@/src/components/AppAlert';

export function useReportActions(reportId: string) {
    const queryClient = useQueryClient();

    const { data: matches = [], isLoading: matchesLoading } = useQuery({
        queryKey: ['report-matches', reportId],
        queryFn: () => getReportMatches(reportId),
        enabled: !!reportId,
    });

    const broadcastMutation = useMutation({
        mutationFn: () => broadcastReport(reportId),
        onSuccess: () => {
            showAlert({ type: 'success', title: '¡Difundido!', message: 'El reporte ha sido difundido a la comunidad cercana.' });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo difundir el reporte.' });
        },
    });

    const updateLocationMutation = useMutation({
        mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
            updateTrackerLocation(reportId, lat, lng),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['perdidas-report', reportId] });
        },
        onError: () => {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo actualizar la ubicación del rastreador.' });
        },
    });

    const handleBroadcast = () => {
        broadcastMutation.mutate();
    };

    const handleUpdateLocation = (lat: number, lng: number) => {
        updateLocationMutation.mutate({ lat, lng });
    };

    return {
        // Data
        matches,
        matchesLoading,

        // Actions
        handleBroadcast,
        isBroadcasting: broadcastMutation.isPending,
        handleUpdateLocation,
        isUpdatingLocation: updateLocationMutation.isPending,
    };
}
