import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import { useProductForm } from '@/src/hooks/ecommerce/useProductForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import { spacing, font } from '@/constants/design';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import FormImagePicker from '@/src/components/forms/FormImagePicker';

export default function VendedorProductoFormScreen() {
    const { theme } = useTheme();
    const {
        isEditing,
        formData,
        updateField,
        saving,
        categories,
        loadingProduct,
        handleSave,
        localImage,
        setLocalImage,
    } = useProductForm();

    if (isEditing && loadingProduct) {
        return (
            <ScreenContainer>
                <LoadingOverlay />
            </ScreenContainer>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScreenContainer>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                        subtitle={isEditing ? 'Actualiza los detalles' : 'Añade un artículo a tu tienda'}
                    />

                    <View style={styles.content}>
                        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                            <View style={styles.inputGroup}>
                                <FormField label="Nombre del producto *" value={formData.name} onChangeText={(val) => updateField('name', val)} placeholder="Ej: Correa Retráctil Pro" />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <FormField label="Precio (MXN) *" value={formData.price} onChangeText={(val) => updateField('price', val)} keyboardType="decimal-pad" placeholder="0.00" />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <FormField label="{isEditing ? 'Stock disponible *' : 'Stock inicial *'}" value={formData.stock} onChangeText={(val) => updateField('stock', val)} />
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.groupTitle, { color: theme.textMuted }]}>CATEGORÍA Y FOTOS</Text>
                        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                            <FormImagePicker
                                label="Foto del producto *"
                                imageUri={localImage || formData.image_url || null}
                                onImageSelected={setLocalImage}
                                onImageRemoved={() => { setLocalImage(null); updateField('image_url', ''); }}
                                aspect={[1, 1]}
                                previewHeight={220}
                                placeholder="Toca para elegir una foto"
                            />

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Categoría</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catLabels}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => updateField('category_id', cat.id)}
                                            style={[
                                                styles.catBadge,
                                                { backgroundColor: theme.background, borderColor: theme.border },
                                                formData.category_id === cat.id && { backgroundColor: theme.primaryLight, borderColor: theme.primary }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.catText,
                                                { color: theme.textMuted },
                                                formData.category_id === cat.id && { color: theme.primary, fontWeight: '800' }
                                            ]}>{cat.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <Text style={[styles.groupTitle, { color: theme.textMuted }]}>DESCRIPCIÓN DETALLADA</Text>
                        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                            <View style={styles.inputGroup}>
                                <FormField label="Descripción corta" value={formData.description} onChangeText={(val) => updateField('description', val)} multiline numberOfLines={4} placeholder="Describe las ventajas de tu producto..." />
                            </View>
                            <View style={styles.inputGroup}>
                                <FormField label="Especificaciones Técnicas" value={formData.specifications} onChangeText={(val) => updateField('specifications', val)} multiline numberOfLines={3} placeholder="Materiales, dimensiones, etc." />
                            </View>
                        </View>
                    </View>
                    <Button label="Guardar producto" onPress={handleSave} loading={saving} fullWidth style={styles.saveBtn} />
                </ScrollView>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    saveBtn: { marginTop: spacing.xl },
    content: { padding: spacing.xxl, paddingBottom: 100 },
    section: { padding: spacing.xl, borderRadius: 24, marginBottom: spacing.xxl, borderWidth: 1 },
    groupTitle: { fontSize: font.md, fontWeight: '800', marginBottom: spacing.md, marginLeft: spacing.md, letterSpacing: 1 },
    inputGroup: { marginBottom: spacing.lg },
    label: { fontSize: font.md, fontWeight: '700', marginBottom: spacing.sm },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: spacing.lg, fontSize: font.lg, fontWeight: '600' },
    textArea: { height: 100, paddingTop: spacing.md, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: spacing.md },
    catLabels: { flexDirection: 'row', marginTop: spacing.sm },
    catBadge: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 12, marginRight: spacing.sm, borderWidth: 1 },
    catText: { fontSize: font.md, fontWeight: '600' },
});
