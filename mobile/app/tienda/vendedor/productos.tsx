import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProducts, deleteProduct, updateProduct, Product } from '@/src/services/ecommerce';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, Edit3, Trash2, Eye, EyeOff, Package, Search, Filter, MoreVertical } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function VendedorProductosScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['my-products'],
        queryFn: getMyProducts,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            Alert.alert("Éxito", "Producto eliminado correctamente");
        },
        onError: () => Alert.alert("Error", "No se pudo eliminar el producto"),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, active }: { id: string; active: boolean }) => updateProduct(id, { is_active: !active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
        },
    });

    const handleDelete = (id: string) => {
        Alert.alert(
            "Eliminar Producto",
            "¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderItem = ({ item }: { item: Product }) => (
        <View style={[styles.productCard, { backgroundColor: theme.surface }]}>
            <Image
                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400' }}
                style={styles.productImage}
            />
            <View style={styles.productDetails}>
                <View style={styles.productHeader}>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity onPress={() => toggleStatusMutation.mutate({ id: item.id, active: item.is_active })}>
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.titleBox}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Mi Catálogo</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>{products.length} Productos</Text>
                </View>
                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/tienda/vendedor/productos/nuevo' as any)}
                >
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Package size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No se encontraron productos</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 24, fontWeight: '900' },
    headerSubtitle: { fontSize: 13, fontWeight: '600' },
    addBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
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
    empty: { paddingTop: 100, alignItems: 'center', gap: 20 },
    emptyText: { fontSize: 16, fontWeight: '600', textAlign: 'center' }
});
