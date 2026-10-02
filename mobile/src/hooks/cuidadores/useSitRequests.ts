/**
 * useSitRequests — solicitudes de cuidado: entrantes si eres cuidador, tus solicitudes si eres cliente.
 */
import { useProRequests } from '@/src/hooks/servicios-pro/useProRequests';

export const useSitRequests = () => useProRequests('sit');
