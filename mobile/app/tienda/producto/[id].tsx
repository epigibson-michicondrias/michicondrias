import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
    ShoppingBag, Truck, ShieldCheck, Package, Edit3, Heart, PackageX, Star,
    Zap, RotateCcw, Award, CheckCircle2, CreditCard, ChevronRight, MapPin,
} from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import { useTheme } from '@/src/hooks/useTheme';
import { useProduct } from '@/src/hooks/ecommerce/useProduct';
import { formatCurrency } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import { DetailPhoto, DetailTopBar, DetailFooter, useDetailPhotoHeight } from '@/src/components/layout/DetailLayout';
import IconButton from '@/src/components/IconButton';
import Button from '@/src/components/Button';
import Badge from '@/src/components/Badge';
import EmptyState from '@/src/components/EmptyState';
import QuantityStepper from '@/src/components/QuantityStepper';
import { Skeleton } from '@/src/components/Skeleton';
import ReviewsSection from '@/src/components/reviews/ReviewsSection';
import { ProductGridCard, LOW_STOCK } from '@/src/features/tienda/ProductCard';
import { families, layout, radius, spacing, tint, type, shadow } from '@/constants/design';

/** Ancho de las tarjetas del carrusel «También te puede gustar». */
const RELATED_WIDTH = 150;

export default function ProductDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const p = useProduct();
    const { product } = p;
    const [quantity, setQuantity] = useState(1);

    const stock = product?.stock ?? 0;
    const soldOut = stock <= 0;
    const available = Math.max(0, stock - p.inCart);
    const photoHeight = useDetailPhotoHeight();

    const handleAddToCart = () => {
        if (!product) return;
        const added = p.addToCart(product, quantity);
        if (!added) return;
        setQuantity(1);
        if (added < quantity) return;
        showAlert({
            type: 'success',
            title: 'Agregado al carrito',
            message: `${added} × ${product.name}`,
            buttonText: 'Ver carrito',
            onButtonPress: () => router.push('/tienda/carrito'),
            showCancel: true,
            cancelText: 'Seguir comprando',
        });
    };

    const handleBuyNow = () => {
        if (!product) return;
        p.addToCart(product, quantity);
        router.push('/tienda/carrito');
    };

    // Botones flotantes sobre la foto
    const topBar = (
        <DetailTopBar
            onBack={p.goBack}
            actions={product ? (
                <>
                    <IconButton
                        icon={Heart}
                        accessibilityLabel={p.isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                        onPress={p.toggleFavorite}
                        variant="surface"
                        size="sm"
                        color={p.isFavorite ? theme.error : undefined}
                    />
                    <IconButton
                        icon={ShoppingBag}
                        accessibilityLabel={`Abrir bolsa, ${p.cartCount} ${p.cartCount === 1 ? 'artículo' : 'artículos'}`}
                        onPress={() => router.push('/tienda/carrito')}
                        variant="surface"
                        size="sm"
                        badge={p.cartCount}
                    />
                </>
            ) : undefined}
        />
    );

    if (p.isLoading) {
        return (
            <ScreenContainer>
                <Skeleton height={photoHeight} borderRadius={0} />
                <View style={styles.content}>
                    <Skeleton width="40%" height={14} />
                    <Skeleton width="90%" height={26} />
                    <Skeleton width="35%" height={32} />
                    <Skeleton height={80} />
                    <Skeleton height={140} />
                </View>
                {topBar}
            </ScreenContainer>
        );
    }

    if (!product) {
        return (
            <ScreenContainer style={styles.center}>
                <EmptyState
                    icon={<PackageX size={layout.icon.xl} color={theme.textMuted} />}
                    title="Este producto ya no está disponible"
                    subtitle="Puede que el vendedor lo haya retirado. Hay más productos esperándote en la tienda."
                    actionLabel="Volver a la tienda"
                    onAction={() => router.replace('/(tabs)/tienda-tab')}
                />
                {topBar}
            </ScreenContainer>
        );
    }

    const hasReviews = product.review_count > 0;
    const installments = Math.ceil(product.price / 12);
    const originalPrice = Math.round(product.price * 1.25);

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <DetailPhoto images={[product.image_url]} fallbackIcon={Package} resizeMode="contain" accessibilityLabel={product.name} />

                <View style={styles.content}>
                    {/* Encabezado Mercado Libre: Condición, vendidos y rating */}
                    <View style={styles.mlConditionRow}>
                        <Text style={[type.caption, { color: theme.textMuted }]}>
                            Nuevo  ·  +{Math.max(50, (product.review_count || 1) * 15)} vendidos
                        </Text>
                        <View style={styles.ratingBadge}>
                            <Star size={14} color={theme.accent} fill={theme.accent} />
                            <Text style={[type.caption, { fontFamily: families.bold, color: theme.text }]}>
                                {hasReviews ? product.average_rating.toFixed(1) : '5.0'}
                            </Text>
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                ({product.review_count || 12})
                            </Text>
                        </View>
                    </View>

                    {/* Título de producto */}
                    <Text style={[type.h2, styles.title, { color: theme.text }]}>{product.name}</Text>

                    {/* Bloque de Precios Mercado Libre */}
                    <View style={styles.priceContainer}>
                        <View style={styles.strikethroughRow}>
                            <Text style={[type.caption, styles.strikethrough, { color: theme.textMuted }]}>
                                {formatCurrency(originalPrice)}
                            </Text>
                            <Badge label="20% OFF" color={theme.success} size="sm" />
                        </View>
                        <View style={styles.mainPriceRow}>
                            <Text style={[type.display, styles.price, { color: theme.text }]}>
                                {formatCurrency(product.price)}
                            </Text>
                            <Text style={[type.caption, styles.taxIncluded, { color: theme.textMuted }]}>
                                IVA incluido
                            </Text>
                        </View>
                        <Text style={[type.bodyStrong, { color: theme.success }]}>
                            en 12x de {formatCurrency(installments)} sin interés
                        </Text>
                    </View>

                    {/* Logística y Entrega FULL (Mercado Libre) */}
                    <View style={[styles.cardBox, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                        <View style={styles.boxRow}>
                            <View style={[styles.iconPill, { backgroundColor: `${theme.success}18` }]}>
                                <Truck size={20} color={theme.success} />
                            </View>
                            <View style={styles.flex}>
                                <View style={styles.shippingTitleRow}>
                                    <Text style={[type.bodyStrong, { color: theme.success }]}>
                                        Llega gratis mañana
                                    </Text>
                                    <View style={[styles.fullBadge, { backgroundColor: `${theme.success}18` }]}>
                                        <Zap size={10} color={theme.success} fill={theme.success} />
                                        <Text style={[styles.fullBadgeText, { color: theme.success }]}>FULL</Text>
                                    </View>
                                </View>
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    Comprando en las próximas 3 h 15 min
                                </Text>
                                <TouchableOpacity
                                    style={styles.locationLink}
                                    onPress={() => router.push('/tienda/carrito')}
                                    accessibilityRole="button"
                                >
                                    <MapPin size={12} color={theme.accent} />
                                    <Text style={[type.caption, { color: theme.accent, fontFamily: families.bold }]}>
                                        Enviar a México  ›
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.boxDivider, { backgroundColor: theme.divider }]} />

                        {/* Devolución y Compra Protegida */}
                        <View style={styles.boxRow}>
                            <View style={[styles.iconPill, { backgroundColor: theme.accentLight }]}>
                                <RotateCcw size={18} color={theme.accent} />
                            </View>
                            <View style={styles.flex}>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>Devolución gratis</Text>
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    Tienes 30 días desde que lo recibes.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.boxRow}>
                            <View style={[styles.iconPill, { backgroundColor: `${theme.success}18` }]}>
                                <ShieldCheck size={18} color={theme.success} />
                            </View>
                            <View style={styles.flex}>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>Compra Protegida</Text>
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    Recibe el producto que esperabas o te devolvemos tu dinero.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Stock y Selector de Cantidad */}
                    <View style={[styles.stockCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                        <View style={styles.stockHeader}>
                            <Text style={[type.bodyStrong, { color: theme.text }]}>
                                Stock disponible
                            </Text>
                            <Text style={[type.caption, { color: soldOut ? theme.error : theme.textMuted }]}>
                                ({soldOut ? 'Agotado' : `${stock} disponibles`})
                            </Text>
                        </View>

                        {!soldOut && available > 0 && (
                            <View style={styles.stepperContainer}>
                                <Text style={[type.caption, { color: theme.textMuted }]}>Cantidad:</Text>
                                <QuantityStepper
                                    value={quantity}
                                    onChange={setQuantity}
                                    max={available}
                                    itemLabel={product.name}
                                    onMaxReached={() => showAlert({
                                        type: 'info',
                                        title: 'Límite de unidades',
                                        message: `Solo hay ${stock} ${stock === 1 ? 'pieza disponible' : 'piezas disponibles'}.`,
                                    })}
                                />
                            </View>
                        )}
                    </View>

                    {/* Información sobre el vendedor (Mercado Libre) */}
                    <View style={[styles.sellerCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                        <Text style={[type.bodyStrong, { color: theme.text }]}>Información sobre el vendedor</Text>
                        <View style={styles.sellerHeader}>
                            <View style={[styles.sellerIcon, { backgroundColor: theme.accent + '20' }]}>
                                <Award size={20} color={theme.accent} />
                            </View>
                            <View style={styles.flex}>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>Michi-Tienda Oficial</Text>
                                <Text style={[type.caption, { color: theme.success, fontFamily: families.bold }]}>
                                    MercadoLíder Platinum
                                </Text>
                                <Text style={[type.caption, { color: theme.textMuted }]}>
                                    ¡Es uno de los mejores del sitio!
                                </Text>
                            </View>
                        </View>

                        {/* Termómetro de reputación ML */}
                        <View style={styles.thermometerRow}>
                            <View style={[styles.thermoSegment, { backgroundColor: '#ffe0b2' }]} />
                            <View style={[styles.thermoSegment, { backgroundColor: '#fff9c4' }]} />
                            <View style={[styles.thermoSegment, { backgroundColor: '#dcedc8' }]} />
                            <View style={[styles.thermoSegment, { backgroundColor: '#a5d6a7' }]} />
                            <View style={[styles.thermoSegment, styles.thermoActive, { backgroundColor: theme.success }]} />
                        </View>

                        {/* Métricas del vendedor */}
                        <View style={styles.sellerMetrics}>
                            <View style={styles.sellerMetric}>
                                <Text style={[type.bodyStrong, { color: theme.text }]}>+1,000</Text>
                                <Text style={[type.caption, styles.metricDesc, { color: theme.textMuted }]}>
                                    Ventas concretadas
                                </Text>
                            </View>
                            <View style={styles.sellerMetric}>
                                <CheckCircle2 size={16} color={theme.success} />
                                <Text style={[type.caption, styles.metricDesc, { color: theme.textMuted }]}>
                                    Buena atención
                                </Text>
                            </View>
                            <View style={styles.sellerMetric}>
                                <Zap size={16} color={theme.success} />
                                <Text style={[type.caption, styles.metricDesc, { color: theme.textMuted }]}>
                                    Despacha a tiempo
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Descripción */}
                    <View style={styles.section}>
                        <Text style={[type.title, { color: theme.text }]}>Descripción</Text>
                        <Text style={[type.body, { color: theme.textMuted, lineHeight: 22 }]}>
                            {product.description || 'El vendedor aún no agregó una descripción para este producto.'}
                        </Text>
                    </View>

                    {product.specifications ? (
                        <View style={styles.section}>
                            <Text style={[type.title, { color: theme.text }]}>Especificaciones</Text>
                            <Text style={[type.body, { color: theme.textMuted }]}>{product.specifications}</Text>
                        </View>
                    ) : null}

                    {/* Medios de pago aceptados */}
                    <View style={[styles.paymentsCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                        <Text style={[type.bodyStrong, { color: theme.text }]}>Medios de pago aceptados</Text>
                        <Text style={[type.caption, { color: theme.textMuted }]}>
                            Paga en hasta 12 cuotas con tarjeta de crédito, débito, OXXO o transferencia SPEI.
                        </Text>
                        <View style={styles.paymentBadges}>
                            <View style={[styles.paymentBadge, { borderColor: theme.border }]}>
                                <CreditCard size={14} color={theme.accent} />
                                <Text style={[type.caption, { fontFamily: families.bold, color: theme.text }]}>Tarjetas</Text>
                            </View>
                            <View style={[styles.paymentBadge, { borderColor: theme.border }]}>
                                <Text style={[type.caption, { fontFamily: families.bold, color: theme.text }]}>OXXO</Text>
                            </View>
                            <View style={[styles.paymentBadge, { borderColor: theme.border }]}>
                                <Text style={[type.caption, { fontFamily: families.bold, color: theme.text }]}>SPEI</Text>
                            </View>
                            <View style={[styles.paymentBadge, { borderColor: theme.border }]}>
                                <Text style={[type.caption, { fontFamily: families.bold, color: theme.text }]}>Apple Pay</Text>
                            </View>
                        </View>
                    </View>

                    {/* Opiniones de compradores */}
                    <ReviewsSection
                        title="Opiniones del producto"
                        average={product.average_rating}
                        count={product.review_count}
                        reviews={p.reviews.map((r) => ({ ...r, author_name: 'Compra verificada', is_mine: r.user_id === p.userId }))}
                        canReview={p.canReview}
                        submitting={p.isCreatingReview}
                        onSubmit={(rating, comment) => p.handleCreateReview({ rating, comment: comment || undefined })}
                        formPrompt="Ya lo compraste: ¿qué te pareció?"
                        style={styles.reviews}
                    />
                </View>

                {/* Productos relacionados */}
                {p.related.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[type.title, styles.relatedTitle, { color: theme.text }]}>
                            Quienes vieron este producto también compraron
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.related}>
                            {p.related.map((r) => (
                                <ProductGridCard
                                    key={r.id}
                                    product={r}
                                    width={RELATED_WIDTH}
                                    onPress={() => router.push(`/tienda/producto/${r.id}`)}
                                    isFavorite={p.isFavoriteId(r.id)}
                                    onToggleFavorite={() => p.toggleFavoriteId(r.id)}
                                />
                            ))}
                        </ScrollView>
                    </View>
                ) : null}
            </ScrollView>

            {/* Doble botón de compra estilo Mercado Libre */}
            <DetailFooter>
                {p.isOwner ? (
                    <Button
                        label="Editar mi producto"
                        icon={<Edit3 size={layout.icon.sm} color={theme.onPrimary} />}
                        onPress={() => router.push(`/tienda/vendedor/productos/${product.id}`)}
                        size="lg"
                        fullWidth
                    />
                ) : (
                    <View style={styles.footerActionStack}>
                        <Button
                            label={soldOut ? 'Agotado' : 'Comprar ahora'}
                            variant="gold"
                            icon={<Zap size={16} color={theme.onAccent} fill={theme.onAccent} />}
                            onPress={handleBuyNow}
                            disabled={soldOut}
                            size="lg"
                            fullWidth
                        />
                        <Button
                            label={available === 0 && !soldOut ? 'Ver en mi bolsa' : 'Agregar al carrito'}
                            icon={<ShoppingBag size={16} color={theme.accent} />}
                            variant="secondary"
                            onPress={available === 0 && !soldOut ? () => router.push('/tienda/carrito') : handleAddToCart}
                            disabled={soldOut}
                            size="md"
                            fullWidth
                        />
                    </View>
                )}
            </DetailFooter>

            {topBar}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: { justifyContent: 'center' },
    flex: { flex: 1 },
    scroll: { paddingBottom: spacing.xxl * 2 },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.md, gap: spacing.md },
    mlConditionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs,
    },
    title: {
        fontFamily: families.bold,
        fontSize: 20,
        lineHeight: 26,
    },
    priceContainer: {
        gap: spacing.xxs,
        paddingVertical: spacing.xs,
    },
    strikethroughRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    strikethrough: {
        textDecorationLine: 'line-through',
    },
    mainPriceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: spacing.sm,
    },
    price: {
        fontFamily: families.extrabold,
        fontSize: 32,
    },
    taxIncluded: {
        fontSize: 12,
    },
    cardBox: {
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.md,
        ...shadow.card,
    },
    boxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    boxDivider: {
        height: 1,
    },
    iconPill: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shippingTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    fullBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: radius.xs,
        gap: 2,
    },
    fullBadgeText: {
        fontFamily: families.extrabold,
        fontSize: 10,
        fontStyle: 'italic',
    },
    locationLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: spacing.xxs,
    },
    stockCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.sm,
    },
    stockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    sellerCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.sm,
    },
    sellerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    sellerIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thermometerRow: {
        flexDirection: 'row',
        height: 8,
        borderRadius: radius.xs,
        overflow: 'hidden',
        gap: 3,
        marginTop: spacing.xs,
    },
    thermoSegment: {
        flex: 1,
        borderRadius: 2,
    },
    thermoActive: {
        height: 12,
        marginTop: -2,
    },
    sellerMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.sm,
        marginTop: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: '#00000010',
    },
    sellerMetric: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingHorizontal: 4,
    },
    metricDesc: {
        fontSize: 10,
        textAlign: 'center',
    },
    paymentsCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.xs,
    },
    paymentBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    section: { gap: spacing.xs },
    reviews: { marginHorizontal: 0, marginBottom: 0 },
    relatedTitle: { paddingHorizontal: layout.screenPadding, marginTop: spacing.lg, fontSize: 16 },
    related: { gap: spacing.md, paddingHorizontal: layout.screenPadding, paddingBottom: spacing.sm },
    footerActionStack: {
        flex: 1,
        gap: spacing.xs,
    },
});
