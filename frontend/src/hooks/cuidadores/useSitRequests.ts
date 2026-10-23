/**
 * useSitRequests — solicitudes de cuidado: entrantes si eres cuidador, tus solicitudes si eres cliente.
 * Espejo de `mobile/src/hooks/cuidadores/useSitRequests.ts`.
 */
import { useProRequests } from "@/features/servicios-pro/useProRequests";

export const useSitRequests = () => useProRequests("sit");
