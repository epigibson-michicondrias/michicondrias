import { apiFetch } from "../lib/api";

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export async function getMyNotifications(): Promise<Notification[]> {
    return apiFetch<Notification[]>("core", "/notifications/me");
}

export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
    return apiFetch<Notification>("core", `/notifications/${notificationId}/read`, {
        method: "PATCH",
    });
}
