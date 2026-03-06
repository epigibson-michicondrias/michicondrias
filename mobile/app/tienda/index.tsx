import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList, TextInput, Dimensions, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, Product, Category } from '../../src/services/ecommerce';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Search, ShoppingCart, Filter, Star, ChevronRight, ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2;

export default function TiendaIndexScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: categories = [], isLoading: loadingCats } = useQuery({
        queryKey: ['ecommerce-categories'],
        queryFn: getCategories,
    });

    const { data: products = [], isLoading: loadingProducts } = useQuery({
        queryKey: ['ecommerce-products', selectedCategory],
        queryFn: () => getProducts(selectedCategory || undefined),
    });

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: theme.surface }]}
            onPress={() => router.push(`/tienda/producto/${item.id}` as any)}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=500' }}
                    style={styles.productImage}
                />
                <View style={styles.ratingBadge}>
                    <Star size={10} color="#facc15" fill="#facc15" />
                    <Text style={styles.ratingText}>{item.average_rating?.toFixed(1) || '5.0'}</Text>
                </View>
            </View>

            <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={[styles.productPrice, { color: theme.primary }]}>
                    ${item.price.toFixed(2)}
                </Text>

                <View style={styles.cardFooter}>
                    <Text style={[styles.sellerInfo, { color: theme.textMuted }]}>
                        {item.stock > 0 ? 'En Stock' : 'Agotado'}
                    </Text>
                    <TouchableOpacity style={[styles.cartBtn, { backgroundColor: theme.primary + '15' }]}>
                        <ShoppingCart size={16} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Michi-Shop</Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>Todo para tu mejor amigo</Text>
                </View>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]}>
                    <ShoppingBag size={24} color={theme.text} />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>0</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput
                        placeholder="Busca premios, juguetes, camas..."
                        placeholderTextColor={theme.textMuted}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity>
                        <Filter size={20} color={theme.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.categoriesSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
                    <TouchableOpacity
                        style={[
                            styles.categoryItem,
                            !selectedCategory && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Text style={[styles.categoryText, { color: !selectedCategory ? '#fff' : theme.textMuted }]}>
                            Todos
                        </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryItem,
                                selectedCategory === cat.name && { backgroundColor: theme.primary }
                            ]}
                            onPress={() => setSelectedCategory(cat.name)}
                        >
                            <Text style={[styles.categoryText, { color: selectedCategory === cat.name ? '#fff' : theme.textMuted }]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loadingProducts ? (
                <View style={styles.loadingContainer}>
                    <Text style={{ color: theme.textMuted }}>Cargando catálogo...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProductItem}
                    numColumns={2}
                    contentContainerStyle={styles.gridContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={{ color: theme.textMuted, textAlign: 'center' }}>No hay productos disponibles por ahora.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    iconBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    categoriesSection: {
        marginBottom: 20,
    },
    categoriesList: {
        paddingHorizontal: 24,
        gap: 12,
    },
    categoryItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '700',
    },
    gridContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    productCard: {
        flex: 1,
        margin: 8,
        borderRadius: 24,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    imageContainer: {
        width: '100%',
        height: 140,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginBottom: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    productInfo: {
        gap: 4,
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        height: 38,
    },
    productPrice: {
        fontSize: 17,
        fontWeight: '800',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    sellerInfo: {
        fontSize: 11,
        fontWeight: '600',
    },
    cartBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        paddingTop: 60,
    }
});
