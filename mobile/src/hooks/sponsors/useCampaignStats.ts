/**
 * useCampaignStats — Hook for campaign statistics dashboard
 * Fetches campaign stats, provides click recording, and computed metrics
 */
import { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCampaignStats,
    recordCampaignClick,
    getGeoTargetedCampaigns,
    CampaignWithStats,
    CampaignStats,
    SponsorCampaign,
} from '@/src/services/sponsors';

export interface CampaignMetrics {
    totalViews: number;
    totalClicks: number;
    averageCTR: number;
    totalSpent: number;
    totalBudget: number;
}

export function useCampaignStats() {
    const queryClient = useQueryClient();

    const {
        data: campaigns = [],
        isLoading,
        refetch,
        isRefetching,
    } = useQuery<CampaignWithStats[]>({
        queryKey: ['campaign-stats'],
        queryFn: () => getCampaignStats(),
    });

    const clickMutation = useMutation<CampaignStats, Error, string>({
        mutationFn: (campaignId) => recordCampaignClick(campaignId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaign-stats'] });
        },
    });

    const metrics = useMemo<CampaignMetrics>(() => {
        const totalViews = campaigns.reduce((acc, c) => acc + (c.stats?.views_count ?? 0), 0);
        const totalClicks = campaigns.reduce((acc, c) => acc + (c.stats?.clicks_count ?? 0), 0);
        const averageCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
        const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
        const totalBudget = campaigns.reduce((acc, c) => acc + c.budget_limit, 0);

        return { totalViews, totalClicks, averageCTR, totalSpent, totalBudget };
    }, [campaigns]);

    const handleRecordClick = (campaignId: string) => {
        clickMutation.mutate(campaignId);
    };

    // Geo-targeted campaigns
    const [geoParams, setGeoParams] = useState<{ lat: number; lng: number; radius?: number } | null>(null);

    const { data: geoCampaigns = [], isLoading: geoLoading } = useQuery<SponsorCampaign[]>({
        queryKey: ['geo-campaigns', geoParams?.lat, geoParams?.lng, geoParams?.radius],
        queryFn: () => getGeoTargetedCampaigns(geoParams!.lat, geoParams!.lng, geoParams!.radius),
        enabled: !!geoParams,
    });

    const fetchGeoCampaigns = useCallback((lat: number, lng: number, radius?: number) => {
        setGeoParams({ lat, lng, radius });
    }, []);

    return {
        campaigns,
        isLoading,
        refetch,
        isRefetching,
        metrics,
        handleRecordClick,
        // Geo-targeted
        geoCampaigns,
        geoLoading,
        fetchGeoCampaigns,
    };
}
