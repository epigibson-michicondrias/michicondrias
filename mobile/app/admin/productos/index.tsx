import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useAdminProducts, Product } from '@/src/hooks/admin';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import DataList from '@/src/components/data/DataList';
import SearchBar from '@/src/components/SearchBar';
import { Plus, ShoppingCart, Filter, Box } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';

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
                        onPress={() => showAlert({ type: 'info', title: 'Inventario', message: 'Abrir ajuste de stock' })}
                    >
                        <Box size={14} color={theme.textMuted} />
                        <Text style={[styles.manageBtnText, { color: theme.text }]}>Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
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
            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Filter size={20} color={theme.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Productos"
                gradient={[theme.primary, theme.primary + 'E6', theme.primary + 'CC']}
                actionIcon={Plus}
                onAction={() => showAlert({ type: 'info', title: 'Nuevo Producto', message: 'Formulario de alta' })}
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
        paddingHorizontal: 20, 
        paddingVertical: 12, 
        gap: 12, 
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
