import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ShieldCheck, AlertCircle, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { createPaymentIntent, getOrder, Order } from '@/src/services/ecommerce';
import { formatCurrency } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import CheckoutSteps from '@/src/features/tienda/CheckoutSteps';
import { WEB_URL } from '@/src/constants/support';
import { families, radius, spacing, type } from '@/constants/design';

export default function PagoNativoScreen() {
    const { order_id } = useLocalSearchParams<{ order_id: string }>();
    const router = useRouter();
    const { theme, isDark } = useTheme();

    const [order, setOrder] = useState<Order | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [publishableKey, setPublishableKey] = useState<string>('');
    const [showItems, setShowItems] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!order_id) {
            setErrorMsg('No se recibió el identificador del pedido.');
            setLoading(false);
            return;
        }

        let isMounted = true;
        (async () => {
            try {
                const [ord, session] = await Promise.all([
                    getOrder(order_id),
                    createPaymentIntent(order_id),
                ]);
                if (!isMounted) return;
                setOrder(ord);
                setClientSecret(session.clientSecret);
                setPublishableKey(session.publishableKey);
            } catch (err: any) {
                if (!isMounted) return;
                setErrorMsg(err?.message || 'No se pudo iniciar la pasarela de pago.');
            } finally {
                if (isMounted) setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [order_id]);

    const stripeAppearance = JSON.stringify({
        theme: isDark ? 'night' : 'stripe',
        variables: {
            colorPrimary: theme.primary,
            colorBackground: theme.surface,
            colorText: theme.text,
            colorDanger: theme.error,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            borderRadius: '12px',
            spacingUnit: '4px',
            colorTextSecondary: theme.textMuted,
            colorTextPlaceholder: theme.textMuted,
        },
        rules: {
            '.Tab': {
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                color: theme.text,
            },
            '.Tab--selected': {
                borderColor: theme.primary,
                backgroundColor: `${theme.primary}1f`,
                color: theme.text,
            },
            '.Input': {
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
                color: theme.text,
            },
            '.Input:focus': {
                borderColor: theme.primary,
                boxShadow: `0 0 0 1px ${theme.primary}`,
            },
            '.Block': {
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
            },
        },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Pago Seguro Michicondrias</title>
        <script src="https://js.stripe.com/v3/"></script>
        <style>
          * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
          html, body {
            margin: 0;
            padding: 0;
            background-color: ${theme.background};
            color: ${theme.text};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          #checkout-container {
            padding: 12px 14px 40px 14px;
            background-color: ${theme.background};
            min-height: 100vh;
          }
          .spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 16px;
            font-size: 14px;
            color: ${theme.textMuted};
            gap: 12px;
          }
          .loader {
            width: 32px;
            height: 32px;
            border: 3px solid ${isDark ? 'rgba(233, 200, 131, 0.16)' : '#ebe5d8'};
            border-top-color: ${theme.primary};
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .pay-button {
            margin-top: 20px;
            width: 100%;
            min-height: 52px;
            padding: 0 28px;
            background-color: ${theme.primary};
            color: ${theme.onPrimary};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: -0.005em;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: opacity 0.15s ease;
          }
          .pay-button:disabled {
            opacity: 0.55;
            cursor: not-allowed;
          }
          .pay-button:focus-visible {
            outline: 2px solid ${theme.primary};
            outline-offset: 2px;
          }
          .error-msg {
            margin-top: 12px;
            padding: 10px 12px;
            background: ${theme.errorLight};
            color: ${theme.error};
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            text-align: center;
            display: none;
          }
        </style>
      </head>
      <body>
        <div id="checkout-container">
          <form id="payment-form">
            <div id="payment-element">
              <div class="spinner">
                <div class="loader"></div>
                <span>Cargando métodos de pago seguros…</span>
              </div>
            </div>
            <div id="error-message" class="error-msg" role="alert" aria-live="assertive"></div>
            <button id="submit-btn" class="pay-button" disabled>
              <span>Confirmar y pagar ${order?.total_amount ? `· ${formatCurrency(order.total_amount)}` : ''}</span>
            </button>
          </form>
        </div>
        <script>
          const stripe = Stripe('${publishableKey}');
          let elements;
          async function init() {
            try {
              elements = stripe.elements({
                clientSecret: '${clientSecret}',
                appearance: ${stripeAppearance},
              });
              const paymentElement = elements.create('payment', {
                layout: 'tabs',
              });
              paymentElement.mount('#payment-element');
              paymentElement.on('ready', () => {
                document.getElementById('submit-btn').disabled = false;
              });
            } catch (e) {
              const errEl = document.getElementById('error-message');
              errEl.innerText = e.message;
              errEl.style.display = 'block';
            }
          }
          init();

          document.getElementById('payment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submit-btn');
            const errEl = document.getElementById('error-message');
            btn.disabled = true;
            btn.innerText = 'Procesando pago seguro…';
            errEl.style.display = 'none';

            const { error } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: '${WEB_URL.replace(/\/$/, '')}/tienda/pago-exitoso?orderId=${order_id}',
              },
            });

            if (error) {
              errEl.innerText = error.message || 'Error al procesar el pago.';
              errEl.style.display = 'block';
              btn.disabled = false;
              btn.innerText = 'Confirmar y pagar ${order?.total_amount ? `· ${formatCurrency(order.total_amount)}` : ''}';
            }
          });
        </script>
      </body>
    </html>
    `;

    const handleNavigationStateChange = (navState: any) => {
        const url = navState.url;
        if (url.includes('/tienda/pago-exitoso')) {
            router.replace({
                pathname: '/tienda/pago-exitoso',
                params: { orderId: order_id },
            } as any);
        } else if (url.includes('/tienda/pago-cancelado')) {
            router.replace({
                pathname: '/tienda/pago-cancelado',
                params: { orderId: order_id },
            } as any);
        }
    };

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Finalizar compra"
                subtitle="Paso 2 de 2: Pago protegido in-app"
            />

            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <CheckoutSteps current={2} />

                {order && (
                    <Card style={[styles.orderSummaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.orderRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[type.caption, { color: theme.textMuted }]}>Pedido #{order.id.slice(0, 8)}</Text>
                                <Text style={[type.bodyStrong, { color: theme.text, marginTop: 2 }]} numberOfLines={1}>
                                    {order.shipping_address ? `Entrega en: ${order.shipping_address}` : 'Envío a domicilio'}
                                </Text>
                            </View>
                            <Text style={[type.h2, { fontFamily: families.bold, color: theme.primary }]}>
                                {formatCurrency(order.total_amount)}
                            </Text>
                        </View>
                        {Boolean(order.items && order.items.length > 0) && (
                            <TouchableOpacity
                                onPress={() => setShowItems((prev) => !prev)}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: theme.divider }}
                                accessibilityRole="button"
                                accessibilityLabel={showItems ? 'Ocultar productos' : 'Ver productos del pedido'}
                            >
                                <Text style={[type.caption, { color: theme.primary, fontFamily: families.bold }]}>
                                    {showItems ? 'Ocultar productos' : `Ver productos (${order.items?.length || 0})`}
                                </Text>
                                <ChevronDown size={14} color={theme.primary} style={showItems ? { transform: [{ rotate: '180deg' }] } : undefined} />
                            </TouchableOpacity>
                        )}
                        {showItems && order.items && (
                            <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
                                {order.items.map((item) => (
                                    <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[type.caption, { color: theme.text, flex: 1 }]} numberOfLines={1}>
                                            {item.quantity}× {item.product?.name || 'Producto'}
                                        </Text>
                                        <Text style={[type.caption, { color: theme.textMuted }]}>
                                            {formatCurrency(item.price_at_purchase * item.quantity)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Card>
                )}

                {loading ? (
                    <View style={styles.skeletonBox} accessibilityLabel="Cargando pasarela de pago">
                        <Card style={[styles.orderSummaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <View style={styles.orderRow}>
                                <View style={{ flex: 1, gap: spacing.sm }}>
                                    <Skeleton width="40%" height={12} />
                                    <Skeleton width="80%" height={16} />
                                </View>
                                <Skeleton width={96} height={22} />
                            </View>
                        </Card>
                        <View style={[styles.webviewSkeleton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Skeleton width="70%" height={16} />
                            <Skeleton width="100%" height={44} borderRadius={radius.md} />
                            <Skeleton width="100%" height={44} borderRadius={radius.md} />
                            <Skeleton width="100%" height={48} borderRadius={radius.md} />
                            <Skeleton width="55%" height={12} />
                        </View>
                        <Text style={[type.body, { color: theme.textMuted, textAlign: 'center' }]}>
                            Cargando pasarela de pago segura de Michicondrias…
                        </Text>
                    </View>
                ) : errorMsg ? (
                    <Card style={styles.errorCard} accessibilityLabel={errorMsg}>
                        <AlertCircle size={32} color={theme.error} />
                        <Text style={[type.bodyStrong, { color: theme.error, textAlign: 'center', marginTop: spacing.sm }]}>
                            {errorMsg}
                        </Text>
                        <Button
                            label="Volver al carrito"
                            onPress={() => router.replace('/tienda/carrito')}
                            style={{ marginTop: spacing.md }}
                        />
                    </Card>
                ) : clientSecret ? (
                    <View style={[styles.webviewContainer, { borderColor: theme.border, backgroundColor: theme.background }]}>
                        <WebView
                            originWhitelist={['*']}
                            source={{ html: htmlContent, baseUrl: WEB_URL }}
                            onNavigationStateChange={handleNavigationStateChange}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={true}
                            renderLoading={() => (
                                <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                                    <Skeleton width={120} height={14} />
                                </View>
                            )}
                            style={{ flex: 1, backgroundColor: theme.background }}
                        />
                    </View>
                ) : null}

                <View style={[styles.guaranteeCard, { backgroundColor: theme.backgroundSecondary }]}>
                    <ShieldCheck size={18} color={theme.success} />
                    <Text style={[type.caption, { color: theme.textMuted, flex: 1 }]}>
                        Pagos cifrados de 256 bits procesados in-app con Stripe. Michicondrias nunca guarda los datos de tu tarjeta.
                    </Text>
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
        gap: spacing.md,
    },
    orderSummaryCard: {
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    skeletonBox: {
        gap: spacing.md,
    },
    webviewSkeleton: {
        minHeight: 480,
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: spacing.md,
        gap: spacing.md,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    errorCard: {
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.md,
    },
    webviewContainer: {
        flex: 1,
        borderRadius: radius.lg,
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 480,
    },
    guaranteeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        padding: spacing.sm,
        borderRadius: radius.md,
    },
});
