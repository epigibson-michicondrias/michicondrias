import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useSellerProducts } from '@/src/hooks/ecommerce';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import EmptyState from '@/src/components/EmptyState';
import { Plus, Edit3, Trash2, Eye, EyeOff, Package } from 'lucide-react-native';
import { Product } from '@/src/services/ecommerce';

export default function VendedorProductosScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const {
        products,
        filteredProducts,
        isLoading,
        handleDelete,
        toggleProductStatus,
    } = useSellerProducts();

    const renderItem = ({ item }: { item: Product }) => (
        <View style={[styles.productCard, { backgroundColor: theme.surface }]}>
            <Image
                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400' }}
                style={styles.productImage}
            />
            <View style={styles.productDetails}>
                <View style={styles.productHeader}>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity onPress={() => toggleProductStatus(item.id, item.is_active)}>
                        {item.is_active ? <Eye size={20} color={theme.primary} /> : <EyeOff size={20} color={theme.textMuted} />}
                    </TouchableOpacity>
                </View>

                <Text style={[styles.productPrice, { color: theme.primary }]}>${item.price.toLocaleString()}</Text>

                <View style={styles.stockRow}>
                    <View style={[styles.stockBadge, { backgroundColor: item.stock > 0 ? '#10b98115' : '#ef444415' }]}>
                        <Text style={[styles.stockLabel, { color: item.stock > 0 ? '#10b981' : '#ef4444' }]}>
                            En Stock: {item.stock}
                        </Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push(`/tienda/vendedor/productos/${item.id}` as any)}>
                            <Edit3 size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item.id)}>
                            <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Mi Catálogo"
                subtitle={`${products.length} Productos`}
                actionIcon={Plus}
                onAction={() => router.push('/tienda/vendedor/productos/nuevo' as any)}
            />

            {isLoading ? (
                <View style={styles.center}>
                    <LoadingOverlay />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Package size={40} color={theme.textMuted} strokeWidth={1} />}
                            title="No se encontraron productos"
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { padding: 24, paddingBottom: 100 },
    productCard: { flexDirection: 'row', borderRadius: 24, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 16 },
    productImage: { width: 90, height: 90, borderRadius: 16 },
    productDetails: { flex: 1, justifyContent: 'space-between', paddingVertical: 4 },
    productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    productName: { fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
    productPrice: { fontSize: 18, fontWeight: '900' },
    stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    stockLabel: { fontSize: 11, fontWeight: '800' },
    actions: { flexDirection: 'row', gap: 4 },
    iconBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
