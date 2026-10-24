import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, SearchX } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks/useTheme';
import { useProductForm } from '@/src/hooks/ecommerce/useProductForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import KeyboardScreen from '@/src/components/KeyboardScreen';
import FormField from '@/src/components/FormField';
import FormSection from '@/src/components/forms/FormSection';
import FormImagePicker from '@/src/components/forms/FormImagePicker';
import FilterChip from '@/src/components/FilterChip';
import Button from '@/src/components/Button';
import { Skeleton } from '@/src/components/Skeleton';
import { ProductGridCard } from '@/src/features/tienda/ProductCard';
import type { Product } from '@/src/types/ecommerce';
import { layout, shadow, spacing, type } from '@/constants/design';

/** Ancho de la tarjeta de vista previa (igual que en el carrusel del producto). */
const PREVIEW_WIDTH = 160;

export default function VendedorProductoFormScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const f = useProductForm();
    const { formData, updateField, errors } = f;

    const title = f.isEditing ? 'Editar producto' : 'Nuevo producto';

    if (f.isEditing && f.loadingProduct) {
        return (
            <ScreenContainer>
                <ScreenHeader title={title} />
                <View style={styles.loading}>
                    <Skeleton height={220} />
                    <Skeleton height={50} />
                    <Skeleton height={50} />
                </View>
            </ScreenContainer>
        );
    }

    if (f.notFound) {
        return (
            <ScreenContainer>
                <ScreenHeader title={title} />
                <EmptyState
                    icon={<SearchX size={layout.icon.xl} color={theme.textMuted} />}
                    title="No encontramos este producto"
                    subtitle="Puede que se haya eliminado."
                    actionLabel="Volver a mi catálogo"
                    onAction={() => router.push('/tienda/vendedor/productos')}
                />
            </ScreenContainer>
        );
    }

    // Así se verá en la tienda mientras se llena el formulario
    const price = parseFloat(formData.price.replace(',', '.'));
    const stock = parseInt(formData.stock, 10);
    const preview: Product = {
        id: 'preview',
        name: formData.name.trim() || 'Nombre del producto',
        description: formData.description,
        price: isFinite(price) ? price : 0,
        // Sin existencias escritas todavía no se muestra el aviso de "últimas piezas"
        stock: Number.isInteger(stock) ? stock : 99,
        category_id: formData.category_id || null,
        image_url: f.localImage || formData.image_url || null,
        is_active: true,
        seller_id: null,
        specifications: null,
        average_rating: 0,
        review_count: 0,
    };

    return (
        <ScreenContainer>
            <ScreenHeader title={title} subtitle={f.isEditing ? 'Los cambios se ven al guardar' : 'Un admin lo revisa antes de publicarlo'} />

            <KeyboardScreen
                contentContainerStyle={styles.content}
                footer={(
                    <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: insets.bottom + spacing.md }]}>
                        <Button label={f.isEditing ? 'Guardar cambios' : 'Enviar a revisión'} onPress={f.handleSave} loading={f.saving} size="lg" fullWidth />
                    </View>
                )}
            >
                <FormSection title="Foto">
                    <FormImagePicker
                        label="Foto del producto *"
                        imageUri={f.localImage || formData.image_url || null}
                        onImageSelected={f.setLocalImage}
                        onImageRemoved={() => { f.setLocalImage(null); updateField('image_url', ''); }}
                        aspect={[1, 1]}
                        previewHeight={220}
                        placeholder="Toca para elegir una foto cuadrada"
                    />
                    {errors.image ? <Text style={[type.caption, { color: theme.error }]}>{errors.image}</Text> : null}
                </FormSection>

                <FormSection title="Datos">
                    <View style={styles.fields}>
                        <FormField
                            label="Nombre del producto *"
                            value={formData.name}
                            onChangeText={(v) => updateField('name', v)}
                            placeholder="Ej: Correa retráctil 5 m"
                            maxLength={120}
                            error={errors.name}
                        />
                        <View style={styles.row}>
                            <View style={styles.flex}>
                                <FormField
                                    label="Precio (MXN) *"
                                    value={formData.price}
                                    onChangeText={(v) => updateField('price', v)}
                                    keyboardType="decimal-pad"
                                    placeholder="0.00"
                                    error={errors.price}
                                />
                            </View>
                            <View style={styles.flex}>
                                <FormField
                                    label={f.isEditing ? 'Existencias *' : 'Existencias iniciales *'}
                                    value={formData.stock}
                                    onChangeText={(v) => updateField('stock', v)}
                                    keyboardType="number-pad"
                                    placeholder="0"
                                    error={errors.stock}
                                />
                            </View>
                        </View>
                    </View>
                </FormSection>

                <FormSection title="Categoría">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chips}>
                        {f.categories.map((cat) => (
                            <FilterChip
                                key={cat.id}
                                label={cat.name}
                                active={formData.category_id === cat.id}
                                onPress={() => updateField('category_id', formData.category_id === cat.id ? '' : cat.id)}
                            />
                        ))}
                    </ScrollView>
                </FormSection>

                <FormSection title="Descripción">
                    <View style={styles.fields}>
                        <FormField
                            label="Descripción"
                            value={formData.description}
                            onChangeText={(v) => updateField('description', v)}
                            multiline
                            numberOfLines={4}
                            placeholder="¿Qué lo hace especial? ¿Para qué mascota es?"
                        />
                        <FormField
                            label="Especificaciones"
                            value={formData.specifications}
                            onChangeText={(v) => updateField('specifications', v)}
                            multiline
                            numberOfLines={3}
                            placeholder="Materiales, medidas, peso, edad recomendada…"
                        />
                    </View>
                </FormSection>

                <View style={styles.preview}>
                    <View style={styles.previewTitle}>
                        <Eye size={layout.icon.sm} color={theme.textMuted} />
                        <Text style={[type.label, { color: theme.textMuted }]}>Así se verá en la tienda</Text>
                    </View>
                    <View pointerEvents="none">
                        <ProductGridCard product={preview} width={PREVIEW_WIDTH} onPress={() => {}} />
                    </View>
                </View>
            </KeyboardScreen>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    loading: { paddingHorizontal: layout.screenPadding, gap: spacing.lg },
    content: { paddingHorizontal: layout.screenPadding, paddingBottom: spacing.xl },
    fields: { gap: spacing.md },
    row: { flexDirection: 'row', gap: spacing.md },
    flex: { flex: 1 },
    chipsScroll: { marginHorizontal: -layout.screenPadding },
    chips: { gap: spacing.sm, paddingHorizontal: layout.screenPadding, alignItems: 'center' },
    preview: { alignItems: 'center', gap: spacing.md },
    previewTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    footer: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.md, borderTopWidth: 1, ...shadow.raised },
});
