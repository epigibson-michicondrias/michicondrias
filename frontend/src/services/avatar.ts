import { apiFetch } from "../lib/api";

export interface AvatarPresign {
    url: string;
    object_key: string;
    public_url: string;
}

export async function getMyAvatar(): Promise<{ avatar_url: string | null }> {
    return apiFetch<{ avatar_url: string | null }>("core", "/users/me/avatar");
}

export async function getAvatarPresignedUrl(ext: string): Promise<AvatarPresign> {
    return apiFetch<AvatarPresign>("core", `/users/me/avatar/presigned-url?ext=${ext}`);
}

export async function setMyAvatar(objectKey: string): Promise<{ avatar_url: string }> {
    return apiFetch<{ avatar_url: string }>("core", "/users/me/avatar", {
        method: "PUT",
        body: JSON.stringify({ object_key: objectKey }),
    });
}
