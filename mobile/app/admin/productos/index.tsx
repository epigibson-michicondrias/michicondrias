import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getProducts, Product } from '@/src/services/ecommerce';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Plus, ShoppingCart, Search, Filter, Box } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminProductosScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: () => getProducts(),
    });

    const renderItem = ({ item }: { item: Product }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Image 
                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=200' }} 
                style={styles.productImg} 
            />
            <View style={styles.productInfo}>
                <View style={styles.topRow}>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.stockBadge, { backgroundColor: item.stock > 0 ? '#10b98115' : '#ef444415' }]}>
                        <Text style={[styles.stockText, { color: item.stock > 0 ? '#10b981' : '#ef4444' }]}>
                            {item.stock > 0 ? `${item.stock} en stock` : 'Agotado'}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.price, { color: theme.primary }]}>${item.price.toFixed(2)}</Text>
                
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.manageBtn, { backgroundColor: theme.background }]}
                        onPress={() => Alert.alert("Inventario", "Abrir ajuste de stock")}
                    >
                        <Box size={14} color={theme.textMuted} />
                        <Text style={[styles.manageBtnText, { color: theme.text }]}>Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.manageBtn, { backgroundColor: theme.primary }]}
                        onPress={() => Alert.alert("Producto", `Gestionar: ${item.name}`)}
                    >
                        <Text style={[styles.manageBtnText, { color: '#fff' }]}>Editar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Premium */}
            <LinearGradient
                colors={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
                style={[styles.header, { paddingTop: insets.top + 12 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={[styles.backBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => router.back()}
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>Productos</Text>
                        <View style={styles.badgeContainer}>
                            <View style={styles.liveDot} />
                            <Text style={styles.subtitle}>Catálogo Maestro</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.headerAction, { backgroundColor: 'rgba(255,255,255,0.15)' }]} 
                        onPress={() => Alert.alert("Nuevo Producto", "Formulario de alta")}
                    >
                        <Plus size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.searchBar}>
                <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput 
                        placeholder="Buscar producto..." 
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                    />
                </View>
                <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Filter size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <ShoppingCart size={64} color={theme.textMuted} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No hay productos en el catálogo.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { 
        paddingHorizontal: 24, 
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 10,
    },
    headerTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    backBtn: { 
        width: 44, 
        height: 44, 
        borderRadius: 14, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerInfo: {
        flex: 1,
        alignItems: 'center',
        marginRight: 8,
    },
    headerAction: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: { 
        fontSize: 18, 
        fontWeight: '900', 
        color: '#fff', 
        letterSpacing: -0.5 
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    liveDot: { 
        width: 6, 
        height: 6, 
        borderRadius: 3, 
        backgroundColor: '#10b981' 
    },
    subtitle: { 
        fontSize: 12, 
        fontWeight: '700', 
        color: 'rgba(255,255,255,0.8)',
    },
    searchBar: { 
        flexDirection: 'row', 
        paddingHorizontal: 20, 
        paddingVertical: 16, 
        gap: 12, 
        marginTop: -18,
        zIndex: 20,
    },
    searchBox: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        height: 54, 
        borderRadius: 18, 
        borderWidth: 1.5, 
        gap: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    searchInput: { 
        flex: 1, 
        fontSize: 15, 
        fontWeight: '700' 
    },
    filterBtn: { 
        width: 54, 
        height: 54, 
        borderRadius: 18, 
        borderWidth: 1.5, 
        justifyContent: 'center', 
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    list: { 
        padding: 20, 
        paddingBottom: 100, 
        paddingTop: 8 
    },
    center: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 100 
    },
    empty: { 
        alignItems: 'center', 
        marginTop: 60, 
        paddingHorizontal: 40 
    },
    emptyText: { 
        fontSize: 14, 
        fontWeight: '700', 
        marginTop: 20,
        textAlign: 'center' 
    },
    card: { 
        flexDirection: 'row', 
        padding: 14, 
        borderRadius: 24, 
        marginBottom: 16, 
        borderWidth: 1, 
        gap: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    productImg: { 
        width: 100, 
        height: 100, 
        borderRadius: 18,
        backgroundColor: '#f1f5f9' 
    },
    productInfo: { 
        flex: 1, 
        justifyContent: 'space-between',
        paddingVertical: 4, 
    },
    topRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
    },
    productName: { 
        fontSize: 16, 
        fontWeight: '900', 
        flex: 1,
        marginRight: 8,
    },
    stockBadge: { 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 8 
    },
    stockText: { 
        fontSize: 9, 
        fontWeight: '900' 
    },
    price: { 
        fontSize: 18, 
        fontWeight: '900' 
    },
    actions: { 
        flexDirection: 'row', 
        gap: 8, 
        marginTop: 8 
    },
    manageBtn: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8, 
        height: 40, 
        borderRadius: 12 
    },
    manageBtnText: { 
        fontSize: 13, 
        fontWeight: '800' 
    }
});
