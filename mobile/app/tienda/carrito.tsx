import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trash2, Plus, Minus, ShoppingBag, ShieldCheck, Package, MapPin } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { useCart } from '../../src/contexts/CartContext';
import { formatCurrency } from '@/src/utils/formatters';
import { showAlert } from '@/src/components/AppAlert';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';

const ADDRESS_KEY = '@michicondrias_shipping_address';
const MIN_ADDRESS_LENGTH = 10;

export default function CarritoScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { items, cartTotal, cartCount, removeFromCart, updateQuantity, checkout, isCheckingOut } = useCart();
    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState(false);

    // Recuerda la última dirección usada para no pedirla en cada compra
    useEffect(() => {
        AsyncStorage.getItem(ADDRESS_KEY).then(v => { if (v) setAddress(v); }).catch(() => {});
    }, []);

    const handleCheckout = () => {
        const trimmed = address.trim();
        if (trimmed.length < MIN_ADDRESS_LENGTH) {
            setAddressError(true);
            showAlert({
                type: 'warning',
                title: 'Falta la dirección de envío',
                message: 'Escribe calle, número, colonia, ciudad y código postal para que el vendedor pueda enviarte el pedido.',
            });
            return;
        }
        setAddressError(false);
        AsyncStorage.setItem(ADDRESS_KEY, trimmed).catch(() => {});
        checkout(trimmed);
    };

    const renderItem = ({ item }: { item: any }) => {
        const stock = item.product.stock ?? 0;
        const atLimit = stock > 0 && item.quantity >= stock;
        return (
            <View style={[styles.cartItem, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Ver ${item.product.name}`}
                    onPress={() => router.push(`/tienda/producto/${item.product.id}` as any)}
                >
                    {item.product.image_url ? (
                        <Image source={{ uri: item.product.image_url }} style={styles.itemImage} />
                    ) : (
                        <View style={[styles.itemImage, styles.itemImagePlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                            <Package size={28} color={theme.textMuted} />
                        </View>
                    )}
                </TouchableOpacity>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
                        {item.product.name}
                    </Text>
                    <Text style={[styles.itemPrice, { color: theme.primary }]}>
                        {formatCurrency(item.product.price * item.quantity)}
                        {item.quantity > 1 ? (
                            <Text style={[styles.itemUnit, { color: theme.textMuted }]}>{`  (${formatCurrency(item.product.price)} c/u)`}</Text>
                        ) : null}
                    </Text>

                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={[styles.qtyBtn, { backgroundColor: theme.backgroundSecondary }]}
                            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                            accessibilityRole="button"
                            accessibilityLabel={`Quitar una unidad de ${item.product.name}`}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Minus size={16} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.qtyText, { color: theme.text }]} accessibilityLabel={`Cantidad ${item.quantity}`}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={[styles.qtyBtn, { backgroundColor: theme.backgroundSecondary }, atLimit && { opacity: 0.4 }]}
                            onPress={() => {
                                if (atLimit) {
                                    showAlert({ type: 'info', title: 'Stock máximo', message: `Solo hay ${stock} ${stock === 1 ? 'unidad disponible' : 'unidades disponibles'} de este producto.` });
                                    return;
                                }
                                updateQuantity(item.product.id, item.quantity + 1);
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Agregar una unidad de ${item.product.name}`}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Plus size={16} color={theme.text} />
                        </TouchableOpacity>

                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => removeFromCart(item.product.id)}
                            accessibilityRole="button"
                            accessibilityLabel={`Quitar ${item.product.name} de la bolsa`}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Trash2 size={20} color={theme.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer>
            <ScreenHeader title="Mi Bolsa" subtitle={cartCount > 0 ? `${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}` : undefined} />

            {items.length === 0 ? (
                <DataList
                    data={[]}
                    renderItem={() => null}
                    emptyIcon={<ShoppingBag size={40} color={theme.textMuted} strokeWidth={1} />}
                    emptyTitle="Tu bolsa está vacía"
                    emptySubtitle="Explora el Michi-Shop y agrega productos para tu mejor amigo."
                    emptyActionLabel="Explorar Tienda"
                    onEmptyAction={() => router.replace('/tienda')}
                    keyExtractor={() => 'empty'}
                />
            ) : (
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <DataList
                        data={items}
                        keyExtractor={(item) => item.product.id}
                        renderItem={renderItem}
                        contentStyle={styles.list}
                        keyboardShouldPersistTaps="handled"
                    />

                    <View style={[styles.footer, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                        <View style={styles.addressHeader}>
                            <MapPin size={16} color={theme.primary} />
                            <Text style={[styles.addressLabel, { color: theme.text }]}>Dirección de envío</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.addressInput,
                                { color: theme.text, backgroundColor: theme.inputBg, borderColor: addressError ? theme.error : theme.inputBorder },
                            ]}
                            value={address}
                            onChangeText={(v) => { setAddress(v); if (addressError) setAddressError(false); }}
                            placeholder="Calle, número, colonia, ciudad y C.P."
                            placeholderTextColor={theme.textMuted}
                            multiline
                            accessibilityLabel="Dirección de envío"
                        />
                        {addressError ? (
                            <Text style={[styles.addressHint, { color: theme.error }]}>Escribe una dirección completa para continuar.</Text>
                        ) : null}

                        <View style={[styles.summaryRow, { marginTop: 14 }]}>
                            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Subtotal</Text>
                            <Text style={[styles.summaryValue, { color: theme.text }]}>{formatCurrency(cartTotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Envío</Text>
                            <Text style={[styles.summaryValue, { color: theme.success }]}>Gratis</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
                            <Text style={[styles.totalValue, { color: theme.primary }]}>{formatCurrency(cartTotal)}</Text>
                        </View>

                        <View style={[styles.secureBadge, { backgroundColor: theme.successLight }]}>
                            <ShieldCheck size={16} color={theme.success} />
                            <Text style={{ fontSize: 12, color: theme.success, fontWeight: '700' }}>Pago seguro con Stripe</Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.checkoutBtn,
                                { backgroundColor: theme.primary },
                                isCheckingOut && { opacity: 0.7 }
                            ]}
                            onPress={handleCheckout}
                            disabled={isCheckingOut}
                            accessibilityRole="button"
                            accessibilityLabel="Proceder al pago"
                            accessibilityState={{ disabled: isCheckingOut, busy: isCheckingOut }}
                        >
                            {isCheckingOut ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.checkoutBtnText}>Proceder al pago</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cartItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 20,
        marginBottom: 16,
        gap: 16,
        borderWidth: 1,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    itemImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemUnit: {
        fontSize: 11,
        fontWeight: '600',
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    addressLabel: {
        fontSize: 14,
        fontWeight: '800',
    },
    addressInput: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minHeight: 48,
        maxHeight: 90,
        fontSize: 14,
        fontWeight: '600',
    },
    addressHint: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 6,
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '700',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '800',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '700',
    },
    deleteBtn: {
        padding: 4,
    },
    footer: {
        padding: 20,
        borderWidth: 1,
        borderBottomWidth: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginVertical: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    checkoutBtn: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
});
