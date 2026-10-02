/**
 * RoleGuard — protege una pantalla para ciertos roles.
 *   <RoleGuard roles={['vendedor']}> ...contenido... </RoleGuard>
 * El admin siempre pasa (igual que require_role en el backend). Si el rol no coincide muestra un aviso
 * con salida clara en lugar de dejar ver una pantalla que luego falla con 403.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTheme } from '@/src/hooks/useTheme';
import { normalizeRole } from '@/src/constants/roles';
import Button from '@/src/components/Button';
import { spacing, type } from '@/constants/design';

interface RoleGuardProps {
    roles: string[];
    children: React.ReactNode;
    /** Mensaje opcional. */
    message?: string;
}

export default function RoleGuard({ roles, children, message }: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const { theme } = useTheme();
    const router = useRouter();
    if (isLoading) return null;
    const role = normalizeRole(user?.role_name);
    if (role === 'admin' || roles.map(normalizeRole).includes(role)) return <>{children}</>;
    return (
        <View style={[styles.box, { backgroundColor: theme.background }]}>
            <Lock size={40} color={theme.textMuted} />
            <Text style={[type.title, { color: theme.text, textAlign: 'center' }]}>Sección no disponible para tu cuenta</Text>
            <Text style={[type.body, { color: theme.textMuted, textAlign: 'center' }]}>
                {message || 'Esta herramienta es solo para cuentas con el rol correspondiente.'}
            </Text>
            <Button label="Volver" variant="secondary" fullWidth={false} onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)' as any))} />
        </View>
    );
}

const styles = StyleSheet.create({
    box: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.huge, gap: spacing.md },
});
