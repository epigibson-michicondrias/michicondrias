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
import { apiFetch, getToken, setToken } from '@/src/lib/api';
import { useAuth } from '@/src/contexts/AuthContext';
import { showAlert } from '@/src/components/AppAlert';
import { getRoleLabelFor, normalizeRole } from '@/src/constants/roles';

const MIN_INTERVAL_MS = 60_000;

function jwtRole(token: string | null): string | null {
    try {
        if (!token) return null;
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(b64)).role ?? null;
    } catch {
        return null;
    }
}

export function useSessionSync() {
    const { user, reloadUser } = useAuth();
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
            const res = await apiFetch<{ access_token: string; role_name: string; verification_status: string }>(
                'core', '/users/me/refresh-token', { method: 'POST' },
            );
            const tokenRole = normalizeRole(jwtRole(await getToken()));
            const dbRole = normalizeRole(res.role_name);
            const roleChanged = tokenRole !== dbRole || normalizeRole(current.role_name) !== dbRole;
            const verifChanged = (current.verification_status || 'UNVERIFIED') !== res.verification_status;
            if (res.access_token) await setToken(res.access_token);
            // Siempre se recarga el usuario: si la app abrió sin red con la copia local, aquí se completa.
            await reloadUser();
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
    }, [reloadUser, qc]);

    const userId = user?.id;
    useEffect(() => {
        if (!userId) return;
        sync(true);
        const sub = AppState.addEventListener('change', (s) => { if (s === 'active') sync(); });
        return () => sub.remove();
    }, [sync, userId]);

    return { sync };
}
