import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminProducts, type Product } from '@/src/hooks/admin/useAdminProducts';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import { ShoppingCart, Box } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import { font, spacing } from '@/constants/design';

export default function AdminProductosScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { products, isLoading, isFetching, refetch, searchText, setSearchText } = useAdminProducts();

    const renderItem = ({ item }: { item: Product }) => (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Image 
                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=200' }} 
                style={styles.productImg} 
            />
            <View style={styles.productInfo}>
                <View style={styles.topRow}>
                    <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.stockBadge, { backgroundColor: item.stock > 0 ? theme.success + '15' : theme.error + '15' }]}>
                        <Text style={[styles.stockText, { color: item.stock > 0 ? theme.success : theme.error }]}>
                            {item.stock > 0 ? `${item.stock} en stock` : 'Agotado'}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.price, { color: theme.primary }]}>${item.price.toFixed(2)}</Text>
                
                <View style={styles.actions}>
                    <TouchableOpacity accessibilityRole="button" 
                        style={[styles.manageBtn, { backgroundColor: theme.background }]}
                        onPress={() => showAlert({ type: 'info', title: 'Inventario', message: 'Abrir ajuste de stock' })}
                    >
                        <Box size={14} color={theme.textMuted} />
                        <Text style={[styles.manageBtnText, { color: theme.text }]}>Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityRole="button" 
                        style={[styles.manageBtn, { backgroundColor: theme.primary }]}
                        onPress={() => showAlert({ type: 'info', title: 'Producto', message: `Gestionar: ${item.name}` })}
                    >
                        <Text style={[styles.manageBtnText, { color: '#fff' }]}>Editar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const ListHeader = (
        <View style={styles.searchBar}>
            <View style={{ flex: 1 }}>
                <SearchBar
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Buscar producto..."
                />
            </View>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Productos"
            />

            <DataList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                isLoading={isLoading}
                loadingMessage="Cargando productos..."
                onRefresh={() => refetch()}
                isRefreshing={isFetching}
                emptyIcon={<ShoppingCart size={48} color={theme.textMuted} strokeWidth={1} />}
                emptyTitle="No hay productos"
                emptySubtitle="No hay productos en el catálogo."
                contentStyle={styles.list}
                header={ListHeader}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    searchBar: { 
        flexDirection: 'row', 
        paddingHorizontal: spacing.xl, 
        paddingVertical: spacing.md, 
        gap: spacing.md, 
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
        padding: spacing.xl, 
        paddingBottom: 100, 
        paddingTop: spacing.sm 
    },
    card: { 
        flexDirection: 'row', 
        padding: spacing.lg, 
        borderRadius: 24, 
        marginBottom: spacing.lg, 
        borderWidth: 1, 
        gap: spacing.lg,
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
        paddingVertical: spacing.xs, 
    },
    topRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start' 
    },
    productName: { 
        fontSize: font.xl, 
        fontWeight: '800', 
        flex: 1,
        marginRight: spacing.sm,
    },
    stockBadge: { 
        paddingHorizontal: spacing.sm, 
        paddingVertical: spacing.xs, 
        borderRadius: 8 
    },
    stockText: { 
        fontSize: font.xs, 
        fontWeight: '800' 
    },
    price: { 
        fontSize: font.xxl, 
        fontWeight: '800' 
    },
    actions: { 
        flexDirection: 'row', 
        gap: spacing.sm, 
        marginTop: spacing.sm 
    },
    manageBtn: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: spacing.sm, 
        height: 40, 
        borderRadius: 12 
    },
    manageBtnText: { 
        fontSize: font.base, 
        fontWeight: '800' 
    }
});
