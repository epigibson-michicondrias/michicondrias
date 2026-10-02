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
import { formatCurrency } from '@/src/utils/formatters';
import AppRefreshControl from '@/src/components/AppRefreshControl';

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
        <View style={[styles.productCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.productImage} />
            ) : (
                <View style={[styles.productImage, { backgroundColor: theme.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
                    <Package size={28} color={theme.textMuted} />
                </View>
            )}
            <View style={styles.productDetails}>
                <View style={styles.productHeader}>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity
                        onPress={() => toggleProductStatus(item.id, item.is_active)}
                        accessibilityRole="button"
                        accessibilityLabel={item.is_active ? 'Ocultar producto de la tienda' : 'Publicar producto en la tienda'}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        {item.is_active ? <Eye size={20} color={theme.primary} /> : <EyeOff size={20} color={theme.textMuted} />}
                    </TouchableOpacity>
                </View>

                <Text style={[styles.productPrice, { color: theme.primary }]}>{formatCurrency(item.price)}</Text>
                {item.is_approved === false ? (
                    <Text style={{ color: theme.warning, fontSize: 11, fontWeight: '800' }}>En revisión · aún no visible en la tienda</Text>
                ) : !item.is_active ? (
                    <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '800' }}>Oculto · no se vende</Text>
                ) : null}

                <View style={styles.stockRow}>
                    <View style={[styles.stockBadge, { backgroundColor: item.stock > 0 ? theme.successLight : theme.errorLight }]}>
                        <Text style={[styles.stockLabel, { color: item.stock > 0 ? theme.success : theme.error }]}>
                            {item.stock > 0 ? `Stock: ${item.stock}` : 'Agotado'}
                        </Text>
                    </View>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Editar producto" onPress={() => router.push(`/tienda/vendedor/productos/${item.id}` as any)}>
                            <Edit3 size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Eliminar producto" onPress={() => handleDelete(item.id)}>
                            <Trash2 size={18} color={theme.error} />
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
            refreshControl={<AppRefreshControl />}
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Package size={40} color={theme.textMuted} strokeWidth={1} />}
                            title="Aún no tienes productos"
                            subtitle="Publica tu primer producto con foto, precio y stock. Un admin lo revisa antes de mostrarlo en la tienda."
                            actionLabel="Agregar producto"
                            onAction={() => router.push('/tienda/vendedor/productos/nuevo' as any)}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    list: { padding: 24, paddingBottom: 100 },
    productCard: { flexDirection: 'row', borderRadius: 24, padding: 12, marginBottom: 16, borderWidth: 1, gap: 16 },
    productImage: { width: 90, height: 90, borderRadius: 16 },
    productDetails: { flex: 1, justifyContent: 'space-between', paddingVertical: 4 },
    productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    productName: { fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
    productPrice: { fontSize: 18, fontWeight: '800' },
    stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    stockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    stockLabel: { fontSize: 11, fontWeight: '800' },
    actions: { flexDirection: 'row', gap: 4 },
    iconBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
