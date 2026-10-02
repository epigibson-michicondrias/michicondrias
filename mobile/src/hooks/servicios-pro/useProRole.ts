import { useAuth } from '@/src/contexts/AuthContext';

/**
 * Rol profesional del usuario. La API entrega "paseador" / "cuidador"; "walker" / "sitter" son alias heredados
 * (antes los hooks solo reconocían los alias y las pantallas de Mis Tareas y Perfil Pro quedaban vacías).
 */
export function useProRole() {
    const { user } = useAuth();
    const role = user?.role_name || '';
    const isWalker = role === 'paseador' || role === 'walker';
    const isSitter = role === 'cuidador' || role === 'sitter';
    return { role, isWalker, isSitter, isProvider: isWalker || isSitter };
}
