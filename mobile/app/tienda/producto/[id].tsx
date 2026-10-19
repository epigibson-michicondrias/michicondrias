import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { useTheme } from '@/src/hooks/useTheme';
import { useProduct } from '@/src/hooks/ecommerce/useProduct';
import { formatCurrency } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { useCart } from '@/src/contexts/CartContext';
import { ShoppingCart, Star, ShieldCheck, Truck, Minus, Plus, Package, Edit3 } from 'lucide-react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/BackButton';
import { font, spacing } from '@/constants/design';


export default function ProductDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { product, reviews, isLoading, goBack, canReview, handleCreateReview, isCreatingReview } = useProduct();
    const [quantity, setQuantity] = useState(1);
    const [formRating, setFormRating] = useState(5);
    const [formComment, setFormComment] = useState('');
    const { addToCart, cartCount } = useCart();
    const { user } = useAuth();

    const stock = product?.stock ?? 0;
    const soldOut = !product || stock <= 0;
    const isOwner = !!product && !!user && product.seller_id === user.id;
    const hasReviews = (product?.review_count || 0) > 0;
    const rating = product?.average_rating || 0;

    const handleAddToCart = () => {
        if (!product) return;
        if (!addToCart(product, quantity)) return;
        showAlert({
            type: 'success',
            title: 'Agregado a tu bolsa',
            message: `${quantity} × ${product.name}`,
            buttonText: 'Ver bolsa',
            onButtonPress: () => router.push('/tienda/carrito' as any),
            showCancel: true,
            cancelText: 'Seguir comprando',
        });
    };

    if (isLoading) return <ScreenContainer style={styles.center}><LoadingOverlay /></ScreenContainer>;
    if (!product) return (
        <ScreenContainer style={styles.center}>
            <Package size={44} color={theme.textMuted} />
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: font.xl, marginTop: spacing.md }}>Este producto ya no está disponible</Text>
            <TouchableOpacity onPress={goBack} style={{ marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: 14, backgroundColor: theme.primary }}>
                <Text style={{ color: theme.onPrimary, fontWeight: '800' }}>Volver a la tienda</Text>
            </TouchableOpacity>
        </ScreenContainer>
    );

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.imageSection, { backgroundColor: theme.surface }]}>
                    {product.image_url ? (
                        <Image source={{ uri: product.image_url }} style={styles.productImage} accessibilityLabel={product.name} />
                    ) : (
                        <Package size={72} color={theme.textMuted} />
                    )}
                    <View style={styles.headerActions}>
                        <BackButton onPress={goBack} color={theme.text} style={[styles.circleBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} />
                        <TouchableOpacity
                            style={[styles.circleBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                            onPress={() => router.push('/tienda/carrito' as any)}
                            accessibilityRole="button"
                            accessibilityLabel={`Abrir bolsa, ${cartCount} artículos`}
                        >
                            <ShoppingCart size={20} color={theme.text} />
                            {cartCount > 0 ? (
                                <View style={[styles.cartBadge, { backgroundColor: theme.error }]}>
                                    <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                                </View>
                            ) : null}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <Text style={[styles.title, { color: theme.text }]}>{product.name}</Text>
                        <View style={styles.priceRow}>
                            <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(product.price)}</Text>
                            <View style={styles.ratingBox}>
                                {hasReviews ? (
                                    <>
                                        <Star size={16} color={theme.accent} fill={theme.accent} />
                                        <Text style={[styles.ratingText, { color: theme.text }]}>{rating.toFixed(1)}</Text>
                                        <Text style={[styles.reviewCount, { color: theme.textMuted }]}>({product.review_count} {product.review_count === 1 ? 'opinión' : 'opiniones'})</Text>
                                    </>
                                ) : (
                                    <Text style={[styles.reviewCount, { color: theme.textMuted }]}>Sin opiniones aún</Text>
                                )}
                            </View>
                        </View>
                        
                        {/* Stock / Availability */}
                        <View style={styles.stockRow}>
                            <Text style={[styles.stockLabel, { color: theme.textMuted }]}>Disponibilidad: </Text>
                            <Text 
                                style={[
                                    styles.stockValue, 
                                    { color: stock > 0 ? theme.success : theme.error, fontWeight: '800' }
                                ]}
                            >
                                {stock > 0 ? (stock <= 5 ? `¡Últimas ${stock} ${stock === 1 ? 'unidad' : 'unidades'}!` : `En stock (${stock} unidades)`) : 'Agotado'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.quantitySection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cantidad</Text>
                        <View style={[styles.quantityPicker, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <TouchableOpacity
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                accessibilityRole="button"
                                accessibilityLabel="Disminuir cantidad"
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Minus size={20} color={theme.text} />
                            </TouchableOpacity>
                            <Text style={[styles.quantityValue, { color: theme.text }]} accessibilityLabel={`Cantidad ${quantity}`}>{quantity}</Text>
                            <TouchableOpacity
                                onPress={() => setQuantity(Math.min(Math.max(stock, 1), quantity + 1))}
                                style={quantity >= stock ? { opacity: 0.4 } : undefined}
                                accessibilityRole="button"
                                accessibilityLabel="Aumentar cantidad"
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Plus size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.tabsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Descripción</Text>
                        <Text style={[styles.description, { color: theme.textMuted }]}>
                            {product.description || 'El vendedor aún no agregó una descripción para este producto.'}
                        </Text>
                    </View>

                    {product.specifications ? (
                        <View style={styles.tabsSection}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Especificaciones Técnicas</Text>
                            <Text style={[styles.description, { color: theme.textMuted }]}>
                                {product.specifications}
                            </Text>
                        </View>
                    ) : null}

                    <View style={[styles.benefitSection, { backgroundColor: theme.overlay, borderColor: theme.borderLight }]}>
                        <View style={styles.benefitItem}>
                            <Truck size={20} color={theme.primary} />
                            <Text style={[styles.benefitText, { color: theme.text }]}>Envío gratis</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <ShieldCheck size={20} color={theme.primary} />
                            <Text style={[styles.benefitText, { color: theme.text }]}>Pago seguro con Stripe</Text>
                        </View>
                    </View>

                    {/* Sección de Reseñas y Calificaciones */}
                    <View style={styles.reviewsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: spacing.md }]}>Reseñas y Opiniones</Text>
                        
                        {/* Tarjeta de Resumen */}
                        <View style={[styles.ratingSummaryCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <View style={styles.summaryLeft}>
                                <Text style={[styles.bigRating, { color: theme.text }]}>
                                    {hasReviews ? rating.toFixed(1) : '–'}
                                </Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((s) => {
                                        const isFilled = hasReviews && s <= Math.round(rating);
                                        return <Star key={s} size={14} color={theme.accent} fill={isFilled ? theme.accent : "transparent"} />;
                                    })}
                                </View>
                                <Text style={[styles.totalReviewsText, { color: theme.textMuted }]}>
                                    {product.review_count || 0} {product.review_count === 1 ? 'opinión' : 'opiniones'}
                                </Text>
                            </View>
                            <View style={[styles.summarySeparator, { backgroundColor: theme.borderLight }]} />
                            <View style={styles.summaryRight}>
                                <Text style={[styles.summaryDescription, { color: theme.textMuted }]}>
                                    Opiniones de quienes compraron este producto en Michi-Shop.
                                </Text>
                            </View>
                        </View>

                        {/* Listado de opiniones */}
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <View key={review.id} style={[styles.reviewItem, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.starsRow}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={12} color={theme.accent} fill={s <= review.rating ? theme.accent : "transparent"} />
                                            ))}
                                        </View>
                                        <Text style={[styles.reviewDate, { color: theme.textMuted }]}>{new Date(review.created_at).toLocaleDateString('es-MX')}</Text>
                                    </View>
                                    {review.comment ? (
                                        <Text style={[styles.reviewComment, { color: theme.text }]}>{review.comment}</Text>
                                    ) : null}
                                </View>
                            ))
                        ) : (
                            <Text style={[styles.emptyReviews, { color: theme.textMuted }]}>
                                Aún no hay opiniones de este producto.
                            </Text>
                        )}

                        {/* Formulario de Calificación: solo quien compró y aún no opinó (F19) */}
                        {canReview && (
                        <View style={[styles.writeReviewCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <Text style={[styles.writeReviewTitle, { color: theme.text }]}>Calificar este producto</Text>
                            <Text style={[styles.writeReviewSubtitle, { color: theme.textMuted }]}>Ya lo compraste: cuéntanos qué te pareció</Text>
                            
                            <View style={styles.interactiveStars}>
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                    <TouchableOpacity 
                                        key={starVal} 
                                        onPress={() => setFormRating(starVal)}
                                        style={styles.starTouch}
                                    >
                                        <Star 
                                            size={30} 
                                            color={theme.accent} 
                                            fill={starVal <= formRating ? theme.accent : "transparent"} 
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={[styles.commentInput, { 
                                    backgroundColor: theme.background, 
                                    borderColor: theme.borderLight, 
                                    color: theme.text 
                                }]}
                                placeholder="Escribe tu opinión aquí (opcional)..."
                                placeholderTextColor={theme.textMuted}
                                value={formComment}
                                onChangeText={setFormComment}
                                multiline
                                numberOfLines={3}
                            />

                            <TouchableOpacity 
                                style={[styles.submitReviewBtn, { backgroundColor: theme.primary }]}
                                onPress={() => handleCreateReview(
                                    { rating: formRating, comment: formComment.trim() || undefined },
                                    () => setFormComment(''),
                                )}
                                disabled={isCreatingReview}
                                accessibilityRole="button"
                                accessibilityLabel="Publicar reseña"
                            >
                                {isCreatingReview ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={styles.submitReviewBtnText}>Publicar reseña</Text>}
                            </TouchableOpacity>
                        </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
                {isOwner ? (
                    <TouchableOpacity
                        style={[styles.buyBtn, { backgroundColor: theme.primary }]}
                        onPress={() => router.push(`/tienda/vendedor/productos/${product.id}` as any)}
                        accessibilityRole="button"
                        accessibilityLabel="Editar mi producto"
                    >
                        <Edit3 size={20} color={theme.onPrimary} />
                        <Text style={styles.buyBtnText}>Editar mi producto</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.buyBtn, { backgroundColor: theme.primary }, soldOut && { opacity: 0.5 }]}
                        onPress={handleAddToCart}
                        disabled={soldOut}
                        accessibilityRole="button"
                        accessibilityLabel={soldOut ? 'Producto agotado' : 'Agregar a la bolsa'}
                        accessibilityState={{ disabled: soldOut }}
                    >
                        <ShoppingCart size={20} color={theme.onPrimary} />
                        <Text style={styles.buyBtnText}>{soldOut ? 'Agotado' : `Agregar a la bolsa · ${formatCurrency(product.price * quantity)}`}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
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
        top: 52,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    content: {
        padding: spacing.xxl,
    },
    mainInfo: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: font.h1,
        fontWeight: '800',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: font.h1,
        fontWeight: '800',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    ratingText: {
        fontSize: font.xl,
        fontWeight: '800',
    },
    reviewCount: {
        fontSize: font.md,
    },
    divider: {
        height: 1,
        marginBottom: spacing.xxl,
    },
    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    tabsSection: {
        marginBottom: spacing.xxl,
    },
    sectionTitle: {
        fontSize: font.xxl,
        fontWeight: '800',
    },
    quantityPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xl,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 16,
        borderWidth: 1,
    },
    quantityValue: {
        fontSize: font.xxl,
        fontWeight: '800',
        minWidth: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: font.lg,
        lineHeight: 24,
        marginTop: spacing.md,
        marginBottom: spacing.xxl,
    },
    benefitSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.xxxl,
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
    },
    benefitItem: {
        alignItems: 'center',
        gap: spacing.sm,
    },
    benefitText: {
        fontSize: font.sm,
        fontWeight: '700',
    },
    reviewsSection: {
        marginBottom: spacing.huge,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    reviewItem: {
        padding: spacing.lg,
        borderRadius: 20,
        marginBottom: spacing.md,
        borderWidth: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    starsRow: {
        flexDirection: 'row',
        gap: spacing.xxs,
    },
    reviewDate: {
        fontSize: font.xs,
    },
    reviewComment: {
        fontSize: font.base,
        lineHeight: 20,
    },
    footer: {
        padding: spacing.xxl,
        paddingBottom: spacing.huge,
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: spacing.lg,
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
        height: 60,
        borderRadius: 22,
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        paddingHorizontal: spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: font.xs,
        fontWeight: '800',
    },
    buyBtnText: {
        color: '#fff',
        fontSize: font.xl,
        fontWeight: '800',
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    stockLabel: {
        fontSize: font.base,
        fontWeight: '600',
    },
    stockValue: {
        fontSize: font.base,
    },
    ratingSummaryCard: {
        flexDirection: 'row',
        padding: spacing.lg,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    summaryLeft: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: spacing.lg,
        minWidth: 90,
    },
    bigRating: {
        fontSize: 36,
        fontWeight: '800',
        lineHeight: 42,
    },
    totalReviewsText: {
        fontSize: font.sm,
        fontWeight: '600',
        marginTop: spacing.xs,
    },
    summarySeparator: {
        width: 1,
        height: '80%',
        marginHorizontal: spacing.xs,
    },
    summaryRight: {
        flex: 1,
        paddingLeft: spacing.md,
    },
    summaryDescription: {
        fontSize: font.md,
        lineHeight: 18,
    },
    emptyReviews: {
        fontSize: font.base,
        textAlign: 'center',
        marginVertical: spacing.xl,
        fontStyle: 'italic',
    },
    writeReviewCard: {
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    writeReviewTitle: {
        fontSize: font.xl,
        fontWeight: '800',
    },
    writeReviewSubtitle: {
        fontSize: font.md,
        lineHeight: 18,
    },
    interactiveStars: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginVertical: spacing.xs,
    },
    starTouch: {
        padding: spacing.xs,
    },
    commentInput: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: font.base,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitReviewBtn: {
        borderRadius: 16,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    submitReviewBtnText: {
        color: '#fff',
        fontSize: font.base,
        fontWeight: '700',
    },
});
