/**
 * Subida de fotos de perfil de paseador/cuidador a URL firmada.
 * Los endpoints viven en los microservicios de paseadores y cuidadores.
 */
import { apiFetch } from "@/lib/api";
import { getFileExtension } from "@/utils/helpers";
import { uploadImageToPresignedUrl } from "@/utils/upload";

interface PresignedUrlResponse {
  url: string;
  object_key: string;
}

export type ProKind = "walk" | "sit";

async function getPresignedUrl(kind: ProKind, ext: string): Promise<PresignedUrlResponse> {
  const path = kind === "walk" ? `/walkers/presigned-url?ext=${ext}` : `/sitters/presigned-url?ext=${ext}`;
  return apiFetch<PresignedUrlResponse>(kind === "walk" ? "paseadores" : "cuidadores", path);
}

/** Sube la foto elegida y devuelve la clave del objeto (o null si no hay foto). */
export async function uploadProPhoto(kind: ProKind, file: File | null): Promise<string | null> {
  if (!file) return null;
  const ext = getFileExtension(file.name);
  const presigned = await getPresignedUrl(kind, ext);
  await uploadImageToPresignedUrl(URL.createObjectURL(file), presigned.url, ext);
  return presigned.object_key;
}
