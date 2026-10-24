/**
 * useWalkRequests — solicitudes de paseo: entrantes si eres paseador, tus solicitudes si eres cliente.
 * Espejo de `mobile/src/hooks/paseadores/useWalkRequests.ts`.
 */
import { useProRequests } from "@/features/servicios-pro/useProRequests";

export const useWalkRequests = () => useProRequests("walk");
