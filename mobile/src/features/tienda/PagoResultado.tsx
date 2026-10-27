/**
 * PagoResultado — pantalla de vuelta desde Stripe (pago-exitoso / pago-cancelado). No inventa datos del pedido:
 * lleva al detalle real, cuyo estado viene del servidor. Las dos rutas existen porque el backend las abre por deep link.
 */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle, XCircle, ShoppingBag, Store, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCart } from '@/src/contexts/CartContext';
import { confirmPaymentIntent } from '@/src/services/ecommerce';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import Button from '@/src/components/Button';
import { SUPPORT_EMAIL } from '@/src/constants/support';
import { spacing, radius, type, layout } from '@/constants/design';

const COPY = {
    success: {
        header: 'Pago recibido',
        title: '¡Gracias por tu compra!',
        message: 'Estamos confirmando tu pago con Stripe. En unos segundos verás tu pedido como «Pagado».',
        cta: 'Ver mi pedido',
    },
    cancelled: {
        header: 'Pago no completado',
        title: 'No se completó el pago',
        message: 'No se hizo ningún cargo a tu tarjeta. Tu pedido sigue apartado: puedes reintentar el pago o cancelarlo.',
        cta: 'Reintentar pago',
    },
} as const;

export default function PagoResultado({ variant }: { variant: keyof typeof COPY }) {
    const router = useRouter();
    const { theme } = useTheme();
    // El deep link del backend usa `orderId`; el WebView de pago-nativo y el return_url embebido usan `order_id`.
    const params = useLocalSearchParams<{ orderId?: string; order_id?: string }>();
    const orderId = params.orderId ?? params.order_id;
    const { clearCart } = useCart();
    const copy = COPY[variant];
    const ok = variant === 'success';
    const Icon = ok ? CheckCircle : XCircle;

    // La bolsa se vacía cuando el pago se confirma (no al abrir la pasarela: si falla, se conserva)
    // y se confirma el cobro en el servidor (respaldo del webhook).
    const confirmedRef = useRef(false);
    useEffect(() => {
        if (!ok) return;
        clearCart();
        if (!orderId || confirmedRef.current) return;
        confirmedRef.current = true;
        confirmPaymentIntent(orderId, '').catch(() => {
            // El webhook o el refresco del detalle del pedido cierran el caso si esto falla
        });
    }, [ok, orderId, clearCart]);

    // Tras el pago no debe quedar carrito/checkout en el historial: si no, “atrás”
    // desde el pedido regresa al paso 1 de entrega.
    const leaveCheckout = () => {
        try {
            router.dismissAll();
        } catch {
            // dismissAll no hace nada si solo hay una pantalla en la pila
        }
    };

    const goToShop = () => {
        leaveCheckout();
        router.replace('/(tabs)/tienda-tab' as any);
    };

    const goToOrder = () => {
        leaveCheckout();
        if (!ok && orderId) {
            router.replace({ pathname: '/tienda/pago-nativo', params: { order_id: orderId } } as any);
            return;
        }
        router.push((orderId ? `/tienda/pedido/${orderId}` : '/tienda/compras') as any);
    };

    return (
        <ScreenContainer>
            <ScreenHeader title={copy.header} onBack={goToShop} />
            <View style={styles.content}>
                <View style={[styles.iconBox, { backgroundColor: ok ? theme.successLight : theme.errorLight }]}>
                    <Icon size={44} color={ok ? theme.success : theme.error} />
                </View>
                <Text style={[type.h1, styles.center, { color: theme.text }]}>{copy.title}</Text>
                <Text style={[type.body, styles.center, { color: theme.textMuted }]}>{copy.message}</Text>

                <View style={styles.buttons}>
                    <Button
                        label={copy.cta}
                        onPress={goToOrder}
                        size="lg"
                        fullWidth
                        icon={ok ? <ShoppingBag size={layout.icon.md} color={theme.background} /> : <RotateCcw size={layout.icon.md} color={theme.background} />}
                    />
                    <Button label="Volver a la tienda" onPress={goToShop} variant="secondary" fullWidth icon={<Store size={layout.icon.md} color={theme.text} />} />
                </View>

                <Text style={[type.caption, styles.center, { color: theme.textMuted }]}>¿Dudas? Escríbenos a {SUPPORT_EMAIL}</Text>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxxl,
        paddingBottom: spacing.huge,
        gap: spacing.md,
    },
    iconBox: {
        width: 96,
        height: 96,
        borderRadius: radius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    center: {
        textAlign: 'center',
    },
    buttons: {
        width: '100%',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
});
