import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Dimensions, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { useTheme } from '@/src/hooks/useTheme';
import { useProduct } from '@/src/hooks/ecommerce';
import { formatCurrency } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { useCart } from '@/src/contexts/CartContext';
import { ShoppingCart, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus, Heart } from 'lucide-react-native';
import BackButton from '@/src/components/BackButton';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const { product, reviews, isLoading, goBack, handleCreateReview, isCreatingReview } = useProduct();
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [formRating, setFormRating] = useState(5);
    const [formComment, setFormComment] = useState('');
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity);
        showAlert({ type: 'success', title: 'Agregado', message: 'El producto se ha añadido a tu bolsa de compras.' });
        router.back();
    };

    if (isLoading) return <ScreenContainer style={styles.center}><LoadingOverlay /></ScreenContainer>;
    if (!product) return (
        <ScreenContainer style={styles.center}>
            <Text style={{ color: theme.text }}>Producto no encontrado</Text>
        </ScreenContainer>
    );

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.imageSection, { backgroundColor: theme.surface }]}>
                    <Image source={{ uri: product.image_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000' }} style={styles.productImage} />
                    <View style={styles.headerActions}>
                        <BackButton onPress={goBack} color={theme.text} style={[styles.circleBtn, { backgroundColor: theme.border, borderColor: theme.border }]} />
                        <TouchableOpacity style={[styles.circleBtn, { backgroundColor: theme.border, borderColor: theme.border }]} onPress={() => setIsFavorite(!isFavorite)}>
                            <Heart size={24} color={isFavorite ? '#ef4444' : theme.text} fill={isFavorite ? '#ef4444' : 'transparent'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <Text style={[styles.title, { color: theme.text }]}>{product.name}</Text>
                        <View style={styles.priceRow}>
                            <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(product.price)}</Text>
                            <View style={styles.ratingBox}>
                                <Star size={16} color="#facc15" fill="#facc15" />
                                <Text style={[styles.ratingText, { color: theme.text }]}>{product.average_rating?.toFixed(1) || '5.0'}</Text>
                                <Text style={[styles.reviewCount, { color: theme.textMuted }]}>({product.review_count || 0} reviews)</Text>
                            </View>
                        </View>
                        
                        {/* Stock / Availability */}
                        <View style={styles.stockRow}>
                            <Text style={[styles.stockLabel, { color: theme.textMuted }]}>Disponibilidad: </Text>
                            <Text 
                                style={[
                                    styles.stockValue, 
                                    { color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: '800' }
                                ]}
                            >
                                {product.stock > 0 ? `En Stock (${product.stock} unidades)` : 'Agotado'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <View style={styles.quantitySection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Cantidad</Text>
                        <View style={[styles.quantityPicker, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
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

                    {product.specifications ? (
                        <View style={styles.tabsSection}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Especificaciones Técnicas</Text>
                            <Text style={[styles.description, { color: theme.textMuted }]}>
                                {product.specifications}
                            </Text>
                        </View>
                    ) : null}

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

                    {/* Sección de Reseñas y Calificaciones */}
                    <View style={styles.reviewsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>Reseñas y Opiniones</Text>
                        
                        {/* Tarjeta de Resumen */}
                        <View style={[styles.ratingSummaryCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <View style={styles.summaryLeft}>
                                <Text style={[styles.bigRating, { color: theme.text }]}>
                                    {product.average_rating?.toFixed(1) || '5.0'}
                                </Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((s) => {
                                        const isFilled = s <= Math.round(product.average_rating || 5);
                                        return <Star key={s} size={14} color="#facc15" fill={isFilled ? "#facc15" : "transparent"} />;
                                    })}
                                </View>
                                <Text style={[styles.totalReviewsText, { color: theme.textMuted }]}>
                                    {product.review_count || 0} {product.review_count === 1 ? 'opinión' : 'opiniones'}
                                </Text>
                            </View>
                            <View style={[styles.summarySeparator, { backgroundColor: theme.borderLight }]} />
                            <View style={styles.summaryRight}>
                                <Text style={[styles.summaryDescription, { color: theme.textMuted }]}>
                                    Calificaciones reales proporcionadas por clientes verificados en Michi-Shop.
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
                                                <Star key={s} size={12} color="#facc15" fill={s <= review.rating ? "#facc15" : "transparent"} />
                                            ))}
                                        </View>
                                        <Text style={[styles.reviewDate, { color: theme.textMuted }]}>{new Date(review.created_at).toLocaleDateString()}</Text>
                                    </View>
                                    {review.comment ? (
                                        <Text style={[styles.reviewComment, { color: theme.text }]}>{review.comment}</Text>
                                    ) : null}
                                </View>
                            ))
                        ) : (
                            <Text style={[styles.emptyReviews, { color: theme.textMuted }]}>
                                Aún no hay opiniones para este producto. ¡Sé el primero en calificarlo!
                            </Text>
                        )}

                        {/* Formulario de Calificación */}
                        <View style={[styles.writeReviewCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
                            <Text style={[styles.writeReviewTitle, { color: theme.text }]}>Calificar este producto</Text>
                            <Text style={[styles.writeReviewSubtitle, { color: theme.textMuted }]}>Toca las estrellas para calificar y deja tu comentario</Text>
                            
                            <View style={styles.interactiveStars}>
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                    <TouchableOpacity 
                                        key={starVal} 
                                        onPress={() => setFormRating(starVal)}
                                        style={styles.starTouch}
                                    >
                                        <Star 
                                            size={30} 
                                            color="#facc15" 
                                            fill={starVal <= formRating ? "#facc15" : "transparent"} 
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
                                onPress={() => {
                                    handleCreateReview({ rating: formRating, comment: formComment.trim() || undefined });
                                    setFormComment('');
                                }}
                                disabled={isCreatingReview}
                            >
                                <Text style={styles.submitReviewBtnText}>Publicar Reseña</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
                <TouchableOpacity
                    style={[styles.cartBtn, { borderColor: theme.primary }]}
                    onPress={handleAddToCart}
                >
                    <ShoppingCart size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.buyBtn, { backgroundColor: theme.primary }]}
                    onPress={handleAddToCart}
                >
                    <Text style={styles.buyBtnText}>Agregar a la Bolsa</Text>
                </TouchableOpacity>
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
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
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
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    stockLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    stockValue: {
        fontSize: 14,
    },
    ratingSummaryCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 20,
        alignItems: 'center',
    },
    summaryLeft: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 16,
        minWidth: 90,
    },
    bigRating: {
        fontSize: 36,
        fontWeight: '900',
        lineHeight: 42,
    },
    totalReviewsText: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },
    summarySeparator: {
        width: 1,
        height: '80%',
        marginHorizontal: 4,
    },
    summaryRight: {
        flex: 1,
        paddingLeft: 12,
    },
    summaryDescription: {
        fontSize: 12,
        lineHeight: 18,
    },
    emptyReviews: {
        fontSize: 14,
        textAlign: 'center',
        marginVertical: 20,
        fontStyle: 'italic',
    },
    writeReviewCard: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginTop: 20,
        gap: 12,
    },
    writeReviewTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    writeReviewSubtitle: {
        fontSize: 12,
        lineHeight: 18,
    },
    interactiveStars: {
        flexDirection: 'row',
        gap: 8,
        marginVertical: 4,
    },
    starTouch: {
        padding: 4,
    },
    commentInput: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitReviewBtn: {
        borderRadius: 16,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    submitReviewBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});
