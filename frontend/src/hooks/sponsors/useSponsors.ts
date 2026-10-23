/**
 * useSponsors — campañas activas con búsqueda (`(app)/patrocinadores`).
 * Espejo de `mobile/src/hooks/sponsors/useSponsors.ts`.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveCampaigns, recordCampaignClick, type SponsorCampaign } from "@/services/sponsors";

export function useSponsors() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: campaigns = [], isLoading } = useQuery<SponsorCampaign[]>({
    queryKey: ["sponsor-campaigns"],
    queryFn: () => getActiveCampaigns(),
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? campaigns.filter((c) => c.title.toLowerCase().includes(q)) : campaigns;
  }, [campaigns, searchQuery]);

  /** Registra el clic y abre el enlace de la campaña en otra pestaña. */
  const openCampaign = (campaign: SponsorCampaign) => {
    if (!campaign.target_link) return;
    recordCampaignClick(campaign.id).catch(() => {});
    window.open(campaign.target_link, "_blank", "noopener,noreferrer");
  };

  return { searchQuery, setSearchQuery, campaigns: filtered, isLoading, openCampaign };
}
