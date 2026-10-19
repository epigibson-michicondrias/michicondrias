import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Truck, ShieldCheck, Package, Edit3, Heart, ChevronLeft, PackageX, Star } from 'lucide-react-native';
import { showAlert } from '@/src/components/AppAlert';
import { useTheme } from '@/src/hooks/useTheme';
import { useProduct } from '@/src/hooks/ecommerce/useProduct';
import { formatCurrency } from '@/src/utils/formatters';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import IconButton from '@/src/components/IconButton';
import Button from '@/src/components/Button';
import Badge from '@/src/components/Badge';
import EmptyState from '@/src/components/EmptyState';
import QuantityStepper from '@/src/components/QuantityStepper';
import { Skeleton } from '@/src/components/Skeleton';
import ReviewsSection from '@/src/components/reviews/ReviewsSection';
import { ProductGridCard, LOW_STOCK } from '@/src/features/tienda/ProductCard';
import { layout, radius, shadow, spacing, tint, type } from '@/constants/design';

/** Ancho de las tarjetas del carrusel «También te puede gustar». */
const RELATED_WIDTH = 150;

export default function ProductDetailScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const p = useProduct();
    const { product } = p;
    const [quantity, setQuantity] = useState(1);

    const stock = product?.stock ?? 0;
    const soldOut = stock <= 0;
    // Lo que ya está en la bolsa cuenta contra las existencias
    const available = Math.max(0, stock - p.inCart);
    const photoHeight = Math.min(width, 380);

    const handleAddToCart = () => {
        if (!product) return;
        const added = p.addToCart(product, quantity);
        if (!added) return;
        setQuantity(1);
        // Si se ajustó al stock, addToCart ya avisó cuántas se agregaron
        if (added < quantity) return;
        showAlert({
            type: 'success',
            title: 'Agregado a tu bolsa',
            message: `${added} × ${product.name}`,
            buttonText: 'Ver bolsa',
            onButtonPress: () => router.push('/tienda/carrito'),
            showCancel: true,
            cancelText: 'Seguir comprando',
        });
    };

    // Botones flotantes sobre la foto
    const topBar = (
        <View style={[styles.topBar, { top: insets.top + spacing.sm }]} pointerEvents="box-none">
            <IconButton icon={ChevronLeft} accessibilityLabel="Volver" onPress={p.goBack} variant="surface" size="sm" strokeWidth={2.5} />
            {product ? (
                <View style={styles.topActions}>
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
                </View>
            ) : null}
        </View>
    );

    if (p.isLoading) {
        return (
            <ScreenContainer>
                <Skeleton height={photoHeight} borderRadius={0} />
                <View style={styles.content}>
                    <Skeleton width="80%" height={22} />
                    <Skeleton width="35%" height={20} />
                    <Skeleton height={60} />
                    <Skeleton height={120} />
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
    const stockBadge = soldOut
        ? <Badge label="Agotado" color={theme.textMuted} variant="solid" />
        : stock <= LOW_STOCK
            ? <Badge label={`¡Últimas ${stock} ${stock === 1 ? 'pieza' : 'piezas'}!`} color={theme.warning} />
            : <Badge label="Disponible" color={theme.success} />;

    return (
        <ScreenContainer>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <View style={[styles.photo, { height: photoHeight, backgroundColor: theme.backgroundSecondary }]}>
                    {product.image_url ? (
                        <Image source={{ uri: product.image_url }} style={styles.photoImage} resizeMode="contain" accessibilityLabel={product.name} />
                    ) : (
                        <Package size={layout.icon.xl * 2.5} color={theme.textMuted} strokeWidth={1.25} />
                    )}
                </View>

                <View style={styles.content}>
                    {/* Nombre, precio, calificación y existencias */}
                    <View style={styles.titleBlock}>
                        {product.category?.name ? (
                            <Text style={[type.label, { color: theme.textMuted }]}>{product.category.name}</Text>
                        ) : null}
                        <Text style={[type.h1, { color: theme.text }]}>{product.name}</Text>
                        <View style={styles.priceRow}>
                            <Text style={[type.display, styles.price, { color: theme.primary }]}>{formatCurrency(product.price)}</Text>
                            {stockBadge}
                        </View>
                        <View style={styles.ratingRow}>
                            <Star size={layout.icon.sm} color={theme.accent} fill={hasReviews ? theme.accent : 'transparent'} />
                            <Text style={[type.caption, { color: theme.textMuted }]}>
                                {hasReviews
                                    ? `${product.average_rating.toFixed(1)} · ${product.review_count} ${product.review_count === 1 ? 'opinión' : 'opiniones'}`
                                    : 'Sin opiniones aún'}
                            </Text>
                        </View>
                    </View>

                    {/* Beneficios reales del checkout */}
                    <View style={[styles.benefits, { backgroundColor: theme.success + tint.faint, borderColor: theme.success + tint.medium }]}>
                        <View style={styles.benefit}>
                            <Truck size={layout.icon.sm} color={theme.success} />
                            <Text style={[type.caption, styles.benefitText, { color: theme.text }]}>Envío gratis</Text>
                        </View>
                        <View style={styles.benefit}>
                            <ShieldCheck size={layout.icon.sm} color={theme.success} />
                            <Text style={[type.caption, styles.benefitText, { color: theme.text }]}>Pago seguro con Stripe</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[type.title, { color: theme.text }]}>Descripción</Text>
                        <Text style={[type.body, { color: theme.textMuted }]}>
                            {product.description || 'El vendedor aún no agregó una descripción para este producto.'}
                        </Text>
                    </View>

                    {product.specifications ? (
                        <View style={styles.section}>
                            <Text style={[type.title, { color: theme.text }]}>Especificaciones</Text>
                            <Text style={[type.body, { color: theme.textMuted }]}>{product.specifications}</Text>
                        </View>
                    ) : null}

                    <ReviewsSection
                        title="Opiniones"
                        average={product.average_rating}
                        count={product.review_count}
                        // Solo opina quien lo compró: cada reseña es de una compra verificada
                        reviews={p.reviews.map((r) => ({ ...r, author_name: 'Compra verificada', is_mine: r.user_id === p.userId }))}
                        canReview={p.canReview}
                        submitting={p.isCreatingReview}
                        onSubmit={(rating, comment) => p.handleCreateReview({ rating, comment: comment || undefined })}
                        formPrompt="Ya lo compraste: ¿qué te pareció?"
                        style={styles.reviews}
                    />
                </View>

                {p.related.length > 0 ? (
                    <View style={styles.section}>
                        <Text style={[type.title, styles.relatedTitle, { color: theme.text }]}>También te puede gustar</Text>
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

            {/* Acción principal */}
            <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.surface, paddingBottom: insets.bottom + spacing.md }]}>
                {p.isOwner ? (
                    <Button
                        label="Editar mi producto"
                        icon={<Edit3 size={layout.icon.sm} color={theme.onPrimary} />}
                        onPress={() => router.push(`/tienda/vendedor/productos/${product.id}`)}
                        size="lg"
                        fullWidth
                    />
                ) : (
                    <>
                        {!soldOut && available > 0 ? (
                            <QuantityStepper
                                value={quantity}
                                onChange={setQuantity}
                                max={available}
                                itemLabel={product.name}
                                onMaxReached={() => showAlert({
                                    type: 'info',
                                    title: 'No hay más piezas',
                                    message: p.inCart > 0
                                        ? `Hay ${stock} en total y ya tienes ${p.inCart} en tu bolsa.`
                                        : `Solo hay ${stock} ${stock === 1 ? 'pieza disponible' : 'piezas disponibles'}.`,
                                })}
                            />
                        ) : null}
                        <Button
                            label={soldOut
                                ? 'Agotado'
                                : available === 0
                                    ? 'Ya está todo en tu bolsa'
                                    : `Agregar · ${formatCurrency(product.price * quantity)}`}
                            icon={<ShoppingBag size={layout.icon.sm} color={theme.onPrimary} />}
                            onPress={available === 0 && !soldOut ? () => router.push('/tienda/carrito') : handleAddToCart}
                            disabled={soldOut}
                            size="lg"
                            style={styles.flex}
                        />
                    </>
                )}
            </View>

            {topBar}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    center: { justifyContent: 'center' },
    flex: { flex: 1 },
    scroll: { paddingBottom: spacing.xxl },
    photo: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: radius.xxl,
        borderBottomRightRadius: radius.xxl,
        overflow: 'hidden',
    },
    photoImage: { width: '100%', height: '100%' },
    topBar: {
        position: 'absolute',
        left: layout.screenPadding,
        right: layout.screenPadding,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    topActions: { flexDirection: 'row', gap: spacing.sm },
    content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.xl, gap: spacing.xl },
    titleBlock: { gap: spacing.xs },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.xs },
    price: { fontWeight: '800' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    benefits: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.lg,
        borderWidth: 1,
        gap: spacing.sm,
    },
    benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    benefitText: { fontWeight: '700' },
    section: { gap: spacing.sm },
    reviews: { marginHorizontal: 0, marginBottom: 0 },
    relatedTitle: { paddingHorizontal: layout.screenPadding, marginTop: spacing.xl },
    related: { gap: spacing.md, paddingHorizontal: layout.screenPadding, paddingBottom: spacing.sm },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        ...shadow.raised,
    },
});
