import { apiFetch } from "../lib/api";

export interface KYCPresignedUrl {
    key: "id_front" | "id_back" | "proof_of_address";
    url: string;
    object_key: string;
}

export interface KYCPresignedUrlsResponse {
    urls: KYCPresignedUrl[];
}

export async function getKYCPresignedUrls(extensions: {
    id_front: string;
    id_back: string;
    proof_of_address: string;
}): Promise<KYCPresignedUrlsResponse> {
    const params = new URLSearchParams({
        id_front_ext: extensions.id_front,
        id_back_ext: extensions.id_back,
        proof_ext: extensions.proof_of_address,
    });
    return await apiFetch<KYCPresignedUrlsResponse>("core", `/users/me/kyc/presigned-urls?${params.toString()}`);
}

export async function finalizeKYC(data: {
    id_front_url: string;
    id_back_url: string;
    proof_of_address_url: string;
}): Promise<any> {
    return await apiFetch<any>("core", "/users/me/kyc/finalize", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
