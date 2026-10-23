import { apiFetch } from "../lib/api";

export interface SponsorCampaign {
    id: string;
    sponsor_id: string;
    title: string;
    banner_url: string;
    target_link?: string;
    budget_limit: number;
    spent: number;
    active: boolean;
    created_at?: string;
}

export interface SponsorCampaignCreate {
    title: string;
    banner_url: string;
    target_link?: string;
    budget_limit: number;
}

export interface BoostedAlert {
    id: string;
    campaign_id?: string;
    lost_pet_report_id: string;
    extra_radius_meters: number;
    amount_paid: number;
}

export interface BoostedAlertCreate {
    campaign_id?: string;
    lost_pet_report_id: string;
    extra_radius_meters?: number;
    amount_paid: number;
}

export interface CampaignStats {
    id: string;
    campaign_id: string;
    views_count: number;
    clicks_count: number;
    last_tracked_at: string;
}

export interface CampaignWithStats extends SponsorCampaign {
    stats?: CampaignStats;
}

export async function createCampaign(data: SponsorCampaignCreate): Promise<SponsorCampaign> {
    return apiFetch<SponsorCampaign>("patrocinadores", "/campaigns", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function createBoostedAlert(data: BoostedAlertCreate): Promise<BoostedAlert> {
    return apiFetch<BoostedAlert>("patrocinadores", "/boost-alert", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getActiveCampaigns(): Promise<SponsorCampaign[]> {
    return apiFetch<SponsorCampaign[]>("patrocinadores", "/campaigns/active");
}

export async function recordCampaignClick(campaignId: string): Promise<CampaignStats> {
    return apiFetch<CampaignStats>("patrocinadores", `/campaigns/${campaignId}/click`, {
        method: "POST",
    });
}

export async function getCampaignStats(): Promise<CampaignWithStats[]> {
    return apiFetch<CampaignWithStats[]>("patrocinadores", "/campaigns/stats");
}

export async function getGeoTargetedCampaigns(lat: number, lng: number, radiusMeters?: number): Promise<SponsorCampaign[]> {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    if (radiusMeters) params.append("radius_meters", String(radiusMeters));
    return apiFetch<SponsorCampaign[]>("patrocinadores", `/campaigns/geo-target?${params}`);
}
