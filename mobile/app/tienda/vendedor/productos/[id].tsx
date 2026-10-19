import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import FormField from '@/src/components/FormField';
import Button from '@/src/components/Button';
import { useProductForm } from '@/src/hooks/ecommerce/useProductForm';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import { Save } from 'lucide-react-native';
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
                        rightElement={
                            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Guardar" onPress={handleSave}>
                                {saving ? <ActivityIndicator size="small" color={theme.primary} /> : <Save size={20} color={theme.primary} />}
                            </TouchableOpacity>
                        }
                    />

                    <View style={styles.content}>
                        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                            <View style={styles.inputGroup}>
                                <FormField label="Nombre del producto *" value={formData.name} onChangeText={(val) => updateField('name', val)} />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <FormField label="Precio (MXN) *" value={formData.price} onChangeText={(val) => updateField('price', val)} />
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
                                <FormField label="Descripción corta" value={formData.description} onChangeText={(val) => updateField('description', val)} />
                            </View>
                            <View style={styles.inputGroup}>
                                <FormField label="Especificaciones Técnicas" value={formData.specifications} onChangeText={(val) => updateField('specifications', val)} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ScreenContainer>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    saveBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 24, paddingBottom: 100 },
    section: { padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1 },
    groupTitle: { fontSize: 12, fontWeight: '800', marginBottom: 12, marginLeft: 12, letterSpacing: 1 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontWeight: '600' },
    textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 12 },
    catLabels: { flexDirection: 'row', marginTop: 8 },
    catBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1 },
    catText: { fontSize: 12, fontWeight: '600' },
});
