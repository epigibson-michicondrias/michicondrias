import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useCart } from '../../src/contexts/CartContext';

export default function CarritoScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const { items, cartTotal, removeFromCart, updateQuantity, checkout, isCheckingOut } = useCart();

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.cartItem, { backgroundColor: theme.surface }]}>
            <Image 
                source={{ uri: item.product.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=200' }} 
                style={styles.itemImage} 
            />
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
                    {item.product.name}
                </Text>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>
                    ${item.product.price.toFixed(2)}
                </Text>
                
                <View style={styles.quantityControls}>
                    <TouchableOpacity 
                        style={[styles.qtyBtn, { backgroundColor: theme.background }]}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                        <Minus size={16} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: theme.text }]}>{item.quantity}</Text>
                    <TouchableOpacity 
                        style={[styles.qtyBtn, { backgroundColor: theme.background }]}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                        <Plus size={16} color={theme.text} />
                    </TouchableOpacity>
                    
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity 
                        style={styles.deleteBtn}
                        onPress={() => removeFromCart(item.product.id)}
                    >
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Mi Bolsa</Text>
                <View style={{ width: 44 }} />
            </View>

            {items.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <ShoppingBag size={80} color={theme.textMuted} strokeWidth={1} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>Tu bolsa está vacía</Text>
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                        Explora el Michi-Shop y agrega productos para tu mejor amigo.
                    </Text>
                    <TouchableOpacity 
                        style={[styles.exploreBtn, { backgroundColor: theme.primary }]}
                        onPress={() => router.replace('/tienda')}
                    >
                        <Text style={styles.exploreBtnText}>Explorar Tienda</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.product.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />

                    <View style={[styles.footer, { backgroundColor: theme.surface }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Subtotal</Text>
                            <Text style={[styles.summaryValue, { color: theme.text }]}>${cartTotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Envío</Text>
                            <Text style={[styles.summaryValue, { color: '#10b981' }]}>Gratis</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <View style={styles.summaryRow}>
                            <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
                            <Text style={[styles.totalValue, { color: theme.primary }]}>${cartTotal.toFixed(2)}</Text>
                        </View>

                        <View style={styles.secureBadge}>
                            <ShieldCheck size={16} color="#10b981" />
                            <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '700' }}>Pago Seguro con Stripe</Text>
                        </View>

                        <TouchableOpacity 
                            style={[
                                styles.checkoutBtn, 
                                { backgroundColor: theme.primary },
                                isCheckingOut && { opacity: 0.7 }
                            ]}
                            onPress={checkout}
                            disabled={isCheckingOut}
                        >
                            {isCheckingOut ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.checkoutBtnText}>Proceder al Pago</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
    },
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
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
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
        fontWeight: '900',
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
        padding: 24,
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
        marginBottom: 12,
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
        fontWeight: '900',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '900',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginVertical: 16,
        backgroundColor: 'rgba(16,185,129,0.1)',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        gap: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '900',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    exploreBtn: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
    },
    exploreBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    }
});
