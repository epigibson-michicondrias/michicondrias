/**
 * useWalkRequests — solicitudes de paseo: entrantes si eres paseador, tus solicitudes si eres cliente.
 */
import { useProRequests } from '@/src/hooks/servicios-pro/useProRequests';

export const useWalkRequests = () => useProRequests('walk');
