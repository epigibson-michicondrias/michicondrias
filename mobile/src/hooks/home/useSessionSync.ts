/**
 * useSessionSync — mantiene sesión y rol al día sin reinstalar ni volver a iniciar sesión.
 * Pide un token nuevo (POST /users/me/refresh-token) al abrir la app y al volver a primer plano y siempre lo guarda:
 * así la sesión se renueva mientras se use (el JWT dura 7 días). El JWT lleva el rol; si un admin aprobó o cambió tu
 * rol, además recarga el usuario y las queries para que las herramientas profesionales funcionen al instante.
 * Se monta una sola vez en app/_layout.tsx.
 */
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { getStoredTokenRole, refreshToken } from '@/src/services/auth';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import { getRoleLabelFor, normalizeRole } from '@/src/constants/roles';

const MIN_INTERVAL_MS = 60_000;

export function useSessionSync() {
    const { user, refreshSession } = useAuth();
    const qc = useQueryClient();
    const last = useRef(0);
    const busy = useRef(false);
    // Usuario leído desde un ref: así recargarlo no recrea `sync` ni dispara otra renovación
    const userRef = useRef(user);
    userRef.current = user;

    const sync = useCallback(async (force = false) => {
        const current = userRef.current;
        if (!current?.id || busy.current) return;
        if (!force && Date.now() - last.current < MIN_INTERVAL_MS) return;
        busy.current = true;
        last.current = Date.now();
        try {
            // El rol del JWT guardado se lee ANTES de renovar: se compara con el que trae el token nuevo
            const tokenRole = normalizeRole(await getStoredTokenRole());
            const res = await refreshToken();
            const dbRole = normalizeRole(res.role_name);
            const roleChanged = tokenRole !== dbRole || normalizeRole(current.role_name) !== dbRole;
            const verifChanged = (current.verification_status || 'UNVERIFIED') !== res.verification_status;
            // Guardar token + recargar usuario (helper común de AuthContext): si la app abrió sin red con la copia
            // local, aquí se completa con el usuario del servidor.
            if (res.access_token) await refreshSession(res.access_token);
            if (roleChanged || verifChanged) {
                qc.invalidateQueries();
                if (roleChanged && dbRole !== 'consumidor') {
                    showAlert({
                        type: 'success',
                        title: 'Tu cuenta fue actualizada',
                        message: `Ahora tienes acceso como ${getRoleLabelFor(dbRole)}. Ya puedes usar tus herramientas desde Inicio.`,
                    });
                }
            }
        } catch {
            // sin red o sesión vencida: apiFetch ya maneja el cierre de sesión; no molestamos al usuario
        } finally {
            busy.current = false;
        }
    }, [refreshSession, qc]);

    const userId = user?.id;
    useEffect(() => {
        if (!userId) return;
        sync(true);
        const sub = AppState.addEventListener('change', (s) => { if (s === 'active') sync(); });
        return () => sub.remove();
    }, [sync, userId]);

    return { sync };
}
