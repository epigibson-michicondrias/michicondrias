/**
 * QueryErrorBanner — aviso flotante cuando una consulta de la pantalla falla y no hay datos que mostrar.
 * Vive dentro de ScreenContainer, así que cubre todas las pantallas sin tocarlas una por una.
 * Distingue "sin conexión" de otros errores y ofrece "Reintentar".
 */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useQueryClient, type Query } from '@tanstack/react-query';
import { NavigationContext } from '@react-navigation/native';
import { WifiOff, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { layout, radius, shadow, spacing, type, press } from '@/constants/design';
import { ApiError } from '@/src/lib/api';

const NETWORK_ERROR = /network request failed|failed to fetch|tiempo de espera|timeout|conexi[oó]n/i;

/** Verdadero mientras la pantalla está enfocada (las pantallas anteriores de la pila siguen montadas). */
function useScreenFocused(): boolean {
    const navigation = useContext(NavigationContext);
    const [focused, setFocused] = useState<boolean>(navigation ? navigation.isFocused() : true);
    useEffect(() => {
        if (!navigation) return;
        const onFocus = navigation.addListener('focus', () => setFocused(true));
        const onBlur = navigation.addListener('blur', () => setFocused(false));
        return () => {
            onFocus();
            onBlur();
        };
    }, [navigation]);
    return focused;
}

export default function QueryErrorBanner() {
    const queryClient = useQueryClient();
    const { theme } = useTheme();
    const focused = useScreenFocused();
    const [failed, setFailed] = useState<{ count: number; offline: boolean }>({ count: 0, offline: false });
    const [retrying, setRetrying] = useState(false);

    // No cuentan: sesión vencida (ya avisa AuthContext y se va a /login) ni consultas secundarias marcadas con
    // `meta: { silentError: true }` (p. ej. el badge de notificaciones), cuya falla no debe tapar la pantalla.
    const isFailed = (q: Query) =>
        q.state.status === 'error' &&
        q.state.data === undefined &&
        q.state.fetchStatus !== 'fetching' &&
        !q.meta?.silentError &&
        !(q.state.error instanceof ApiError && q.state.error.sessionExpired);

    useEffect(() => {
        const cache = queryClient.getQueryCache();
        const update = () => {
            const errors = cache.findAll({ type: 'active', predicate: isFailed });
            setFailed({
                count: errors.length,
                offline: errors.some((q) => NETWORK_ERROR.test(String((q.state.error as Error | null)?.message ?? ''))),
            });
        };
        let alive = true;
        // El cache avisa mientras otra pantalla se está dibujando: actualizar el estado ahí es ilegal en React
        // ("Cannot update a component while rendering a different component"), así que se difiere un tick.
        const deferredUpdate = () => queueMicrotask(() => { if (alive) update(); });
        update();
        const unsubscribe = cache.subscribe(deferredUpdate);
        return () => {
            alive = false;
            unsubscribe();
        };
    }, [queryClient]);

    const retry = useCallback(async () => {
        setRetrying(true);
        try {
            await queryClient.refetchQueries({ type: 'active', predicate: isFailed });
        } finally {
            setRetrying(false);
        }
    }, [queryClient]);

    if (!focused || failed.count === 0) return null;

    const Icon = failed.offline ? WifiOff : AlertCircle;
    return (
        <View pointerEvents="box-none" style={styles.wrap}>
            <View
                accessibilityRole="alert"
                style={[styles.banner, { backgroundColor: theme.surface, borderColor: theme.error }]}
            >
                <Icon size={layout.icon.md} color={theme.error} />
                <View style={styles.textCol}>
                    <Text style={[type.bodyStrong, { color: theme.text }]}>
                        {failed.offline ? 'Sin conexión' : 'No pudimos cargar la información'}
                    </Text>
                    <Text style={[type.caption, styles.subtitle, { color: theme.textMuted }]}>
                        {failed.offline ? 'Revisa tu internet y vuelve a intentar.' : 'Inténtalo de nuevo en unos segundos.'}
                    </Text>
                </View>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Reintentar la carga"
                    accessibilityState={{ disabled: retrying, busy: retrying }}
                    onPress={retry}
                    disabled={retrying}
                    activeOpacity={press.normal}
                    style={[styles.retry, { backgroundColor: theme.primary, opacity: retrying ? 0.6 : 1 }]}
                >
                    <RefreshCw size={layout.icon.sm} color={theme.onPrimary} />
                    <Text style={[type.button, styles.retryText, { color: theme.onPrimary }]}>{retrying ? 'Cargando…' : 'Reintentar'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        ...shadow.floating,
    },
    textCol: { flex: 1 },
    subtitle: { marginTop: spacing.xxs },
    retry: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        minHeight: layout.minTouch - 6,
        borderRadius: radius.md,
        justifyContent: 'center',
    },
    retryText: {},
});
