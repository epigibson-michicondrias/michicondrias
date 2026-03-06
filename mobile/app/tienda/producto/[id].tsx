import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProduct, getReviews, createOrder } from '../../../src/services/ecommerce';
import Colors from '../../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id as string),
    });

    const { data: reviews = [] } = useQuery({
        queryKey: ['product-reviews', id],
        queryFn: () => getReviews(id as string),
    });

    const buyMutation = useMutation({
        mutationFn: () => createOrder({
            items: [{ product_id: id as string, quantity }]
        }),
        onSuccess: (order) => {
            Alert.alert("Orden Creada", `¡Gracias por tu compra! Orden #${order.id.slice(0, 8)}`);
            router.back();
        },
        onError: () => {
            Alert.alert("Error", "No pudimos procesar tu compra. Inténtalo de nuevo.");
        }
    });

    if (isLoading) return <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={theme.primary} /></View>;
    if (!product) return <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.text }}>Producto no encontrado</Text></View>;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.imageSection, { backgroundColor: theme.surface }]}>
                    <Image source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000' }} style={styles.productImage} />

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
                            <ChevronLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.circleBtn} onPress={() => setIsFavorite(!isFavorite)}>
                            <Heart size={24} color={isFavorite ? '#ef4444' : theme.text} fill={isFavorite ? '#ef4444' : 'transparent'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <Text style={[styles.title, { color: theme.text }]}>{product.name}</Text>
                        <View style={styles.priceRow}>
                            <Text style={[styles.price, { color: theme.primary }]}>${product.price.toFixed(2)}</Text>
                            <View style={styles.ratingBox}>
                                <Star size={16} color="#facc15" fill="#facc15" />
                                <Text style={[styles.ratingText, { color: theme.text }]}>{product.average_rating?.toFixed(1) || '5.0'}</Text>
                                <Text style={[styles.reviewCount, { color: theme.textMuted }]}>({product.review_count || 0} reviews)</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.quantitySection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cantidad</Text>
                        <View style={[styles.quantityPicker, { backgroundColor: theme.surface }]}>
                            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                                <Minus size={20} color={theme.text} />
                            </TouchableOpacity>
                            <Text style={[styles.quantityValue, { color: theme.text }]}>{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                                <Plus size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.tabsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Descripción</Text>
                        <Text style={[styles.description, { color: theme.textMuted }]}>
                            {product.description || 'Este producto de alta calidad está diseñado pensando en el bienestar de tu mascota. Fabricado con materiales premium y seguros.'}
                        </Text>
                    </View>

                    <View style={styles.benefitSection}>
                        <View style={styles.benefitItem}>
                            <Truck size={20} color={theme.primary} />
                            <Text style={[styles.benefitText, { color: theme.text }]}>Envío Gratis</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <ShieldCheck size={20} color={theme.primary} />
                            <Text style={[styles.benefitText, { color: theme.text }]}>Garantía Michi</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <RotateCcw size={20} color={theme.primary} />
                            <Text style={[styles.benefitText, { color: theme.text }]}>30 Días Devo</Text>
                        </View>
                    </View>

                    {reviews.length > 0 && (
                        <View style={styles.reviewsSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Reseñas</Text>
                                <TouchableOpacity>
                                    <Text style={{ color: theme.primary, fontWeight: '700' }}>Ver todas</Text>
                                </TouchableOpacity>
                            </View>
                            {reviews.slice(0, 2).map((review) => (
                                <View key={review.id} style={[styles.reviewItem, { backgroundColor: theme.surface }]}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.starsRow}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={12} color="#facc15" fill={s <= review.rating ? "#facc15" : "transparent"} />
                                            ))}
                                        </View>
                                        <Text style={[styles.reviewDate, { color: theme.textMuted }]}>{new Date(review.created_at).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={[styles.reviewComment, { color: theme.text }]}>{review.comment}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity style={[styles.cartBtn, { borderColor: theme.primary }]}>
                    <ShoppingCart size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.buyBtn, { backgroundColor: theme.primary }]}
                    onPress={() => buyMutation.mutate()}
                    disabled={buyMutation.isPending}
                >
                    {buyMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buyBtnText}>Comprar Ahora</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageSection: {
        height: 400,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    headerActions: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    content: {
        padding: 24,
    },
    mainInfo: {
        gap: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 28,
        fontWeight: '900',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '800',
    },
    reviewCount: {
        fontSize: 12,
    },
    divider: {
        height: 1,
        marginBottom: 24,
    },
    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    tabsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    quantityPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    quantityValue: {
        fontSize: 18,
        fontWeight: '800',
        minWidth: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        marginTop: 12,
        marginBottom: 24,
    },
    benefitSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 16,
        borderRadius: 20,
    },
    benefitItem: {
        alignItems: 'center',
        gap: 8,
    },
    benefitText: {
        fontSize: 11,
        fontWeight: '700',
    },
    reviewsSection: {
        marginBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reviewItem: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewDate: {
        fontSize: 10,
    },
    reviewComment: {
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: 16,
    },
    cartBtn: {
        width: 64,
        height: 64,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyBtn: {
        flex: 1,
        height: 64,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    }
});
