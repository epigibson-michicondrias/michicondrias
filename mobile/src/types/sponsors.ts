/**
 * @module types/sponsors
 * @description Types for the sponsors/advertising domain — sponsor campaigns,
 * boosted alerts for lost pets, and campaign analytics.
 */

// ─── Sponsor Campaigns ──────────────────────────────────────────────────────────

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

// ─── Boosted Alerts ─────────────────────────────────────────────────────────────

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

// ─── Campaign Analytics ─────────────────────────────────────────────────────────

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
