import { apiFetch } from "../lib/api";
import type { Notification, UnreadCountResponse, MarkAllReadResponse } from "../types/notifications";

export type { Notification };

export async function getMyNotifications(): Promise<Notification[]> {
    return apiFetch<Notification[]>("core", "/notifications/me");
}

export async function getUnreadNotificationCount(): Promise<number> {
    const res = await apiFetch<UnreadCountResponse>("core", "/notifications/me/unread-count");
    return res.count;
}

export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
    return apiFetch<Notification>("core", `/notifications/${notificationId}/read`, {
        method: "PATCH",
    });
}

export async function markAllNotificationsAsRead(): Promise<MarkAllReadResponse> {
    return apiFetch<MarkAllReadResponse>("core", "/notifications/me/read-all", {
        method: "PATCH",
    });
}
