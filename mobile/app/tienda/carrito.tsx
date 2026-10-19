import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, ShoppingBag, ShieldCheck, MapPin, Lock } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCart } from '@/src/contexts/CartContext';
import { useCheckout } from '@/src/hooks/ecommerce/useCheckout';
import { useCartProducts } from '@/src/hooks/ecommerce/useCartProducts';
import { formatCurrency } from '@/src/utils/formatters';
import { showAlert } from '@/src/components/AppAlert';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import EmptyState from '@/src/components/EmptyState';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import CartItemRow from '@/src/features/tienda/CartItemRow';
import { layout, shadow, spacing, type } from '@/constants/design';

const MIN_ADDRESS_LENGTH = 10;

export default function CarritoScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { items, cartTotal, cartCount, updateQuantity, clearCart, savedAddress, rememberAddress } = useCart();
    const { checkout, isCheckingOut } = useCheckout();
    // Precio y stock frescos al abrir la bolsa (el snapshot guardado puede quedar viejo)
    useCartProducts();
    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState<string | null>(null);

    // Recuerda la última dirección usada para no pedirla en cada compra
    useEffect(() => {
        if (savedAddress) setAddress((current) => current || savedAddress);
    }, [savedAddress]);

    const handleCheckout = () => {
        const trimmed = address.trim();
        if (trimmed.length < MIN_ADDRESS_LENGTH) {
            setAddressError('Escribe calle, número, colonia, ciudad y C.P. para que el vendedor pueda enviarte el pedido.');
            return;
        }
        setAddressError(null);
        rememberAddress(trimmed);
        checkout(trimmed);
    };

    const confirmClear = () => showAlert({
        type: 'warning',
        title: '¿Vaciar la bolsa?',
        message: `Se quitarán ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}.`,
        buttonText: 'Vaciar',
        onButtonPress: clearCart,
        showCancel: true,
        cancelText: 'Cancelar',
    });

    const itemsLabel = `${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}`;

    if (items.length === 0) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Mi bolsa" />
                <EmptyState
                    icon={<ShoppingBag size={layout.icon.xl} color={theme.textMuted} strokeWidth={1.5} />}
                    title="Tu bolsa está vacía"
                    subtitle="Explora el Michi-Shop y agrega productos para tu mejor amigo."
                    actionLabel="Ir a la tienda"
                    onAction={() => router.replace('/(tabs)/tienda-tab')}
                />
            </ScreenContainer>
        );
    }

    const footer = (
        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.footerTotal}>
                <Text style={[type.caption, { color: theme.textMuted }]}>Total · {itemsLabel}</Text>
                <Text style={[type.h2, styles.bold, { color: theme.text }]}>{formatCurrency(cartTotal)}</Text>
            </View>
            <Button
                label="Pagar"
                icon={<Lock size={layout.icon.sm} color={theme.onPrimary} />}
                onPress={handleCheckout}
                loading={isCheckingOut}
                size="lg"
                style={styles.payBtn}
                accessibilityLabel={`Pagar ${formatCurrency(cartTotal)}`}
            />
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mi bolsa"
                subtitle={itemsLabel}
                actions={[{ icon: Trash2, label: 'Vaciar bolsa', onPress: confirmClear }]}
            />

            <KeyboardScreen contentContainerStyle={styles.content} footer={footer}>
                <View style={styles.items}>
                    {items.map((item) => (
                        <CartItemRow
                            key={item.product.id}
                            item={item}
                            onOpen={() => router.push(`/tienda/producto/${item.product.id}`)}
                            onChangeQuantity={(q) => updateQuantity(item.product.id, q)}
                            onMaxReached={() => showAlert({
                                type: 'info',
                                title: 'No hay más piezas',
                                message: `Solo hay ${item.product.stock} ${item.product.stock === 1 ? 'pieza disponible' : 'piezas disponibles'} de este producto.`,
                            })}
                        />
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionTitle}>
                        <MapPin size={layout.icon.sm} color={theme.primary} />
                        <Text style={[type.title, { color: theme.text }]}>Envío</Text>
                    </View>
                    <FormField
                        label="Dirección de envío"
                        value={address}
                        onChangeText={(v) => { setAddress(v); if (addressError) setAddressError(null); }}
                        placeholder="Calle, número, colonia, ciudad y C.P."
                        multiline
                        autoComplete="street-address"
                        textContentType="fullStreetAddress"
                        error={addressError}
                        hint={savedAddress && address === savedAddress ? 'La misma de tu última compra.' : undefined}
                    />
                </View>

                <Card>
                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={[type.body, { color: theme.textMuted }]}>Subtotal</Text>
                            <Text style={[type.bodyStrong, { color: theme.text }]}>{formatCurrency(cartTotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[type.body, { color: theme.textMuted }]}>Envío</Text>
                            <Text style={[type.bodyStrong, { color: theme.success }]}>Gratis</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[type.title, { color: theme.text }]}>Total</Text>
                            <Text style={[type.title, styles.bold, { color: theme.primary }]}>{formatCurrency(cartTotal)}</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.secure}>
                    <ShieldCheck size={layout.icon.sm} color={theme.success} />
                    <Text style={[type.caption, styles.flex, { color: theme.textMuted }]}>
                        Pagas con tarjeta en la página segura de Stripe. Tus productos quedan apartados mientras completas el pago.
                    </Text>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xl, gap: spacing.xl },
    items: { gap: spacing.sm },
    section: { gap: spacing.sm },
    sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    summary: { gap: spacing.sm },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    divider: { height: 1, marginVertical: spacing.xs },
    secure: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    flex: { flex: 1 },
    bold: { fontWeight: '800' },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        ...shadow.raised,
    },
    footerTotal: { flex: 1 },
    payBtn: { flex: 1.2 },
});
