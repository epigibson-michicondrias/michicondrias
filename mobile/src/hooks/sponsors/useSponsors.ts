/**
 * useSponsors — Hook for sponsors screen
 * Extracts data fetching and search filtering from app/patrocinadores/index.tsx
 */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getActiveCampaigns, SponsorCampaign } from '@/src/services/sponsors';

export function useSponsors() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: campaigns = [], isLoading } = useQuery<SponsorCampaign[]>({
    queryKey: ['sponsor-campaigns'],
    queryFn: () => getActiveCampaigns(),
  });

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [campaigns, searchQuery],
  );

  return {
    // State
    searchQuery,
    setSearchQuery,

    // Data
    campaigns: filteredCampaigns,
    isLoading,

    // Navigation
    router,
  };
}
