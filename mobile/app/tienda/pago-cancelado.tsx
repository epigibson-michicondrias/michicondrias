import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { XCircle, ShoppingBag, Home } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { SUPPORT_EMAIL } from '@/src/constants/support';

/**
 * Pantalla de retorno del pago: no inventa datos del pedido; dirige al detalle real (estado actualizado desde el servidor).
 */
export default function PagoCanceladoScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const goToOrder = () => router.replace((orderId ? `/tienda/pedido/${orderId}` : '/tienda/compras') as any);

    return (
        <ScreenContainer>
            <ScreenHeader title="Pago no completado" onBack={() => router.replace('/(tabs)/tienda-tab' as any)} />
            <View style={styles.content}>
                <View style={[styles.iconBox, { backgroundColor: theme.errorLight }]}>
                    <XCircle size={72} color={theme.error} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>No se completó el pago</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>No se hizo ningún cargo a tu tarjeta. Tu pedido sigue pendiente por un tiempo: puedes pagarlo o cancelarlo desde su detalle.</Text>

                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={[styles.primary, { backgroundColor: theme.primary }]}
                        onPress={goToOrder}
                        accessibilityRole="button"
                        accessibilityLabel="Ir a mi pedido"
                    >
                        <ShoppingBag size={20} color="#fff" />
                        <Text style={styles.primaryText}>Ir a mi pedido</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.secondary, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => router.replace('/(tabs)/tienda-tab' as any)}
                        accessibilityRole="button"
                        accessibilityLabel="Volver a la tienda"
                    >
                        <Home size={20} color={theme.text} />
                        <Text style={[styles.secondaryText, { color: theme.text }]}>Volver a la tienda</Text>
                    </TouchableOpacity>
                </View>

                <Text style={[styles.help, { color: theme.textMuted }]}>¿Dudas? Escríbenos a {SUPPORT_EMAIL}</Text>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 60, gap: 14 },
    iconBox: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
    subtitle: { fontSize: 15, lineHeight: 22, textAlign: 'center', fontWeight: '500' },
    buttons: { width: '100%', gap: 12, marginTop: 16 },
    primary: { height: 56, borderRadius: 18, flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' },
    primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    secondary: { height: 52, borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' },
    secondaryText: { fontSize: 15, fontWeight: '700' },
    help: { fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});
