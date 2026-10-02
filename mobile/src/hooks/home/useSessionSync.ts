/**
 * useSessionSync — mantiene sesión y rol al día sin reinstalar ni volver a iniciar sesión.
 * El JWT lleva el rol; si un admin aprueba/cambia tu rol, el token guardado queda desactualizado
 * y los servicios profesionales responderían 403. Este hook pide un token nuevo
 * (POST /users/me/refresh-token) al abrir la app y al volver a primer plano, y si el rol cambió
 * guarda el token, vacía la caché y recarga el usuario.
 */
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch, clearApiCache, getToken, setToken } from '@/src/lib/api';
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

    const sync = useCallback(async (force = false) => {
        if (!user?.id || busy.current) return;
        if (!force && Date.now() - last.current < MIN_INTERVAL_MS) return;
        busy.current = true;
        last.current = Date.now();
        try {
            const res = await apiFetch<{ access_token: string; role_name: string; verification_status: string }>(
                'core', '/users/me/refresh-token', { method: 'POST' },
            );
            const tokenRole = normalizeRole(jwtRole(await getToken()));
            const dbRole = normalizeRole(res.role_name);
            const roleChanged = tokenRole !== dbRole || normalizeRole(user.role_name) !== dbRole;
            const verifChanged = (user.verification_status || 'UNVERIFIED') !== res.verification_status;
            if (tokenRole !== dbRole) {
                await setToken(res.access_token);
                try { await SecureStore.setItemAsync('user_role', res.role_name); } catch { /* web */ }
            }
            if (roleChanged || verifChanged) {
                clearApiCache();
                await reloadUser();
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
    }, [user?.id, user?.role_name, user?.verification_status, reloadUser, qc]);

    useEffect(() => {
        sync(true);
        const sub = AppState.addEventListener('change', (s) => { if (s === 'active') sync(); });
        return () => sub.remove();
    }, [sync]);

    return { sync };
}
