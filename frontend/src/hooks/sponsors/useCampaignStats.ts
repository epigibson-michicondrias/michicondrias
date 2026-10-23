/**
 * useCampaignStats — métricas de las campañas del patrocinador (`(app)/patrocinadores/estadisticas`).
 * Espejo de `mobile/src/hooks/sponsors/useCampaignStats.ts` (sin la parte geo, que la web no usa).
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCampaignStats, type CampaignWithStats } from "@/services/sponsors";

export interface CampaignMetrics {
  totalViews: number;
  totalClicks: number;
  averageCTR: number;
  totalSpent: number;
  totalBudget: number;
}

export function useCampaignStats() {
  const { data: campaigns = [], isLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["campaign-stats"],
    queryFn: () => getCampaignStats(),
  });

  const metrics = useMemo<CampaignMetrics>(() => {
    const totalViews = campaigns.reduce((acc, c) => acc + (c.stats?.views_count ?? 0), 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + (c.stats?.clicks_count ?? 0), 0);
    return {
      totalViews,
      totalClicks,
      averageCTR: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
      totalSpent: campaigns.reduce((acc, c) => acc + c.spent, 0),
      totalBudget: campaigns.reduce((acc, c) => acc + c.budget_limit, 0),
    };
  }, [campaigns]);

  return { campaigns, isLoading, metrics };
}
