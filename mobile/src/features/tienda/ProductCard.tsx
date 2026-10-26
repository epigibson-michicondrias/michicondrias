/**
 * Producto de la tienda con diseño y acomodo visual estilo Mercado Libre:
 * - Card limpia con imagen cuadrada centrada sobre fondo neutro
 * - Insignia "MÁS VENDIDO" / "OFERTA" / Stock
 * - Título claro de 2 líneas
 * - Calificación con estrellas compacta
 * - Precio prominente con símbolo de moneda
 * - Renglón de cuotas: "en 12x de $... sin interés"
 * - Renglón de entrega: "Envío gratis" + distintivo "⚡ FULL"
 * - Botón de favoritos y botón "+" para agregar a la bolsa al instante
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Check, Heart, Package, Plus, Star, Zap } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { formatCurrency } from '@/src/utils/formatters';
import { haptic } from '@/src/utils/haptics';
import type { Product } from '@/src/types/ecommerce';
import { families, layout, radius, shadow, spacing, type } from '@/constants/design';

export const LOW_STOCK = 5;

interface ProductCardProps {
    product: Product;
    onPress: () => void;
    onQuickAdd?: () => boolean;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

/** Calcula mensualidades simuladas estilo Mercado Libre (12 MSI para >$499, 3 o 6 MSI para >$299). */
function getInstallmentsInfo(price: number): { count: number; amount: number } | null {
    if (price >= 600) {
        return { count: 12, amount: Math.ceil(price / 12) };
    }
    if (price >= 300) {
        return { count: 6, amount: Math.ceil(price / 6) };
    }
    if (price >= 150) {
        return { count: 3, amount: Math.ceil(price / 3) };
    }
    return null;
}

export function ProductGridCard({
    product,
    width,
    onPress,
    onQuickAdd,
    isFavorite,
    onToggleFavorite,
}: ProductCardProps & { width: number }) {
    const { theme } = useTheme();
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (!added) return;
        const t = setTimeout(() => setAdded(false), 1200);
        return () => clearTimeout(t);
    }, [added]);

    const isOutOfStock = product.stock <= 0;
    const isLowStock = !isOutOfStock && product.stock <= LOW_STOCK;
    const isBestSeller = !isOutOfStock && product.price >= 500 && (product.review_count || 0) >= 1;
    const installments = getInstallmentsInfo(product.price);
    const hasFreeShipping = product.price >= 299 && !isOutOfStock;
    const rating = Number(product.average_rating || 5.0).toFixed(1);
    const reviews = product.review_count || 1;

    const handleQuickAddPress = (e: any) => {
        e.stopPropagation?.();
        if (onQuickAdd && !isOutOfStock) {
            haptic.selection();
            const ok = onQuickAdd();
            if (ok) setAdded(true);
        }
    };

    const handleFavPress = (e: any) => {
        e.stopPropagation?.();
        if (onToggleFavorite) {
            haptic.selection();
            onToggleFavorite();
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.gridCard,
                {
                    width,
                    backgroundColor: theme.surface,
                    borderColor: theme.borderLight,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`${product.name}, ${formatCurrency(product.price)}`}
        >
            {/* Contenedor de Imagen */}
            <View style={[styles.gridImageContainer, { backgroundColor: '#FFFFFF' }]}>
                {product.image_url ? (
                    <Image
                        source={{ uri: product.image_url }}
                        style={styles.gridImage}
                        contentFit="contain"
                        transition={200}
                    />
                ) : (
                    <View style={styles.gridPlaceholder}>
                        <Package size={36} color={theme.textMuted} strokeWidth={1.5} />
                    </View>
                )}

                {/* Badge Superior Izquierdo estilo Mercado Libre */}
                {isOutOfStock ? (
                    <View style={[styles.tagBadge, { backgroundColor: '#555555' }]}>
                        <Text style={styles.tagBadgeText}>AGOTADO</Text>
                    </View>
                ) : isLowStock ? (
                    <View style={[styles.tagBadge, { backgroundColor: '#F97316' }]}>
                        <Text style={styles.tagBadgeText}>{`ÚLTIMAS ${product.stock}`}</Text>
                    </View>
                ) : isBestSeller ? (
                    <View style={[styles.tagBadge, { backgroundColor: '#2563EB' }]}>
                        <Text style={styles.tagBadgeText}>MÁS VENDIDO</Text>
                    </View>
                ) : null}

                {/* Botón Favorito Flotante */}
                {onToggleFavorite && (
                    <TouchableOpacity
                        style={[styles.favoriteBtn, { backgroundColor: 'rgba(255,255,255,0.92)' }]}
                        onPress={handleFavPress}
                        hitSlop={8}
                    >
                        <Heart
                            size={16}
                            color={isFavorite ? '#EF4444' : '#6B7280'}
                            fill={isFavorite ? '#EF4444' : 'transparent'}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* Detalles del Producto Estilo Mercado Libre */}
            <View style={styles.gridBody}>
                {/* Título en 2 líneas */}
                <Text
                    style={[type.caption, styles.productTitle, { color: theme.text }]}
                    numberOfLines={2}
                >
                    {product.name}
                </Text>

                {/* Calificación y Reseñas */}
                <View style={styles.ratingRow}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.ratingNumber, { color: theme.text }]}>{rating}</Text>
                    <Text style={[styles.ratingCount, { color: theme.textMuted }]}>({reviews})</Text>
                </View>

                {/* Precio Prominente */}
                <View style={styles.priceContainer}>
                    <Text style={[styles.currencySymbol, { color: theme.text }]}>$</Text>
                    <Text style={[styles.mainPrice, { color: theme.text }]}>
                        {Math.floor(product.price).toLocaleString('es-MX')}
                    </Text>
                </View>

                {/* Renglón de Cuotas (MSI) */}
                {installments && !isOutOfStock && (
                    <Text style={[styles.installmentsText, { color: theme.success }]}>
                        en {installments.count}x {formatCurrency(installments.amount)} sin interés
                    </Text>
                )}

                {/* Renglón de Envío y FULL */}
                <View style={styles.shippingRow}>
                    {hasFreeShipping ? (
                        <>
                            <Text style={[styles.freeShippingText, { color: theme.success }]}>
                                Envío gratis
                            </Text>
                            <View style={styles.fullBadge}>
                                <Zap size={10} color="#059669" fill="#059669" />
                                <Text style={styles.fullText}>FULL</Text>
                            </View>
                        </>
                    ) : (
                        <Text style={[styles.standardShippingText, { color: theme.textMuted }]}>
                            Envío estándar
                        </Text>
                    )}
                </View>

                {/* Fila Inferior con Agregar Rápido */}
                {onQuickAdd && !isOutOfStock && (
                    <View style={styles.bottomRow}>
                        <TouchableOpacity
                            style={[
                                styles.quickAddBtn,
                                { backgroundColor: added ? theme.success : theme.primary },
                            ]}
                            onPress={handleQuickAddPress}
                            hitSlop={6}
                        >
                            {added ? (
                                <Check size={14} color={theme.onPrimary} strokeWidth={2.5} />
                            ) : (
                                <Plus size={14} color={theme.onPrimary} strokeWidth={2.5} />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export function ProductListRow({
    product,
    onPress,
    onQuickAdd,
    isFavorite,
    onToggleFavorite,
}: ProductCardProps) {
    const { theme } = useTheme();
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (!added) return;
        const t = setTimeout(() => setAdded(false), 1200);
        return () => clearTimeout(t);
    }, [added]);

    const isOutOfStock = product.stock <= 0;
    const isLowStock = !isOutOfStock && product.stock <= LOW_STOCK;
    const installments = getInstallmentsInfo(product.price);
    const hasFreeShipping = product.price >= 299 && !isOutOfStock;
    const rating = Number(product.average_rating || 5.0).toFixed(1);
    const reviews = product.review_count || 1;

    const handleQuickAddPress = (e: any) => {
        e.stopPropagation?.();
        if (onQuickAdd && !isOutOfStock) {
            haptic.selection();
            const ok = onQuickAdd();
            if (ok) setAdded(true);
        }
    };

    const handleFavPress = (e: any) => {
        e.stopPropagation?.();
        if (onToggleFavorite) {
            haptic.selection();
            onToggleFavorite();
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.listCard,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderLight,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.88}
        >
            {/* Foto Cuadrada a la Izquierda */}
            <View style={[styles.listImageContainer, { backgroundColor: '#FFFFFF' }]}>
                {product.image_url ? (
                    <Image
                        source={{ uri: product.image_url }}
                        style={styles.listImage}
                        contentFit="contain"
                        transition={200}
                    />
                ) : (
                    <View style={styles.gridPlaceholder}>
                        <Package size={28} color={theme.textMuted} strokeWidth={1.5} />
                    </View>
                )}

                {isOutOfStock ? (
                    <View style={[styles.tagBadgeSmall, { backgroundColor: '#555555' }]}>
                        <Text style={styles.tagBadgeTextSmall}>AGOTADO</Text>
                    </View>
                ) : isLowStock ? (
                    <View style={[styles.tagBadgeSmall, { backgroundColor: '#F97316' }]}>
                        <Text style={styles.tagBadgeTextSmall}>ÚLTIMAS</Text>
                    </View>
                ) : null}
            </View>

            {/* Contenido Vertical Estilo Mercado Libre */}
            <View style={styles.listContent}>
                <View style={styles.listHeaderRow}>
                    <Text
                        style={[type.caption, styles.productListTitle, { color: theme.text }]}
                        numberOfLines={2}
                    >
                        {product.name}
                    </Text>
                    {onToggleFavorite && (
                        <TouchableOpacity
                            style={styles.listFavBtn}
                            onPress={handleFavPress}
                            hitSlop={8}
                        >
                            <Heart
                                size={17}
                                color={isFavorite ? '#EF4444' : '#9CA3AF'}
                                fill={isFavorite ? '#EF4444' : 'transparent'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Rating */}
                <View style={styles.ratingRow}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.ratingNumber, { color: theme.text }]}>{rating}</Text>
                    <Text style={[styles.ratingCount, { color: theme.textMuted }]}>({reviews})</Text>
                </View>

                {/* Precio Grande */}
                <View style={styles.priceContainer}>
                    <Text style={[styles.currencySymbol, { color: theme.text }]}>$</Text>
                    <Text style={[styles.mainPriceList, { color: theme.text }]}>
                        {Math.floor(product.price).toLocaleString('es-MX')}
                    </Text>
                </View>

                {/* Cuotas sin interés */}
                {installments && !isOutOfStock && (
                    <Text style={[styles.installmentsText, { color: theme.success }]}>
                        en {installments.count}x {formatCurrency(installments.amount)} sin interés
                    </Text>
                )}

                {/* Envío + Botón Agregar */}
                <View style={styles.listFooterRow}>
                    <View style={styles.shippingRow}>
                        {hasFreeShipping ? (
                            <>
                                <Text style={[styles.freeShippingText, { color: theme.success }]}>
                                    Envío gratis
                                </Text>
                                <View style={styles.fullBadge}>
                                    <Zap size={10} color="#059669" fill="#059669" />
                                    <Text style={styles.fullText}>FULL</Text>
                                </View>
                            </>
                        ) : (
                            <Text style={[styles.standardShippingText, { color: theme.textMuted }]}>
                                Envío estándar
                            </Text>
                        )}
                    </View>

                    {onQuickAdd && !isOutOfStock && (
                        <TouchableOpacity
                            style={[
                                styles.quickAddBtnList,
                                { backgroundColor: added ? theme.success : theme.primary },
                            ]}
                            onPress={handleQuickAddPress}
                            hitSlop={6}
                        >
                            {added ? (
                                <Check size={14} color={theme.onPrimary} strokeWidth={2.5} />
                            ) : (
                                <Plus size={14} color={theme.onPrimary} strokeWidth={2.5} />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    gridCard: {
        borderRadius: radius.md,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: spacing.xs,
        ...shadow.card,
    },
    gridImageContainer: {
        width: '100%',
        height: 155,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: spacing.xs,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: radius.xs,
    },
    tagBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontFamily: families.bold,
        letterSpacing: 0.5,
    },
    tagBadgeSmall: {
        position: 'absolute',
        top: 4,
        left: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: radius.xs,
    },
    tagBadgeTextSmall: {
        color: '#FFFFFF',
        fontSize: 8,
        fontFamily: families.bold,
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.raised,
    },
    gridBody: {
        padding: spacing.sm,
        gap: 3,
    },
    productTitle: {
        lineHeight: 16,
        fontFamily: families.regular,
        minHeight: 32,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    ratingNumber: {
        fontSize: 11,
        fontFamily: families.medium,
    },
    ratingCount: {
        fontSize: 11,
        fontFamily: families.regular,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 3,
    },
    currencySymbol: {
        fontSize: 13,
        fontFamily: families.bold,
        marginRight: 2,
    },
    mainPrice: {
        fontSize: 18,
        fontFamily: families.bold,
        letterSpacing: -0.5,
    },
    mainPriceList: {
        fontSize: 19,
        fontFamily: families.bold,
        letterSpacing: -0.5,
    },
    installmentsText: {
        fontSize: 11,
        fontFamily: families.medium,
        marginTop: 1,
    },
    shippingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    freeShippingText: {
        fontSize: 11,
        fontFamily: families.bold,
    },
    standardShippingText: {
        fontSize: 10,
        fontFamily: families.regular,
    },
    fullBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: radius.xs,
    },
    fullText: {
        fontSize: 9,
        fontFamily: families.bold,
        color: '#059669',
        fontStyle: 'italic',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
    },
    quickAddBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.raised,
    },
    // Lista
    listCard: {
        flexDirection: 'row',
        borderRadius: radius.md,
        borderWidth: 1,
        overflow: 'hidden',
        padding: spacing.sm,
        gap: spacing.md,
        ...shadow.card,
    },
    listImageContainer: {
        width: 105,
        height: 105,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: spacing.xs,
    },
    listImage: {
        width: '100%',
        height: '100%',
    },
    listContent: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
    listHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing.xs,
    },
    productListTitle: {
        flex: 1,
        lineHeight: 16,
        fontFamily: families.regular,
    },
    listFavBtn: {
        padding: 2,
    },
    listFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    quickAddBtnList: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.raised,
    },
});
