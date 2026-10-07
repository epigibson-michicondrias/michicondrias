import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
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
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                onPress={handleSave}
                                disabled={saving}
                                accessibilityRole="button"
                                accessibilityLabel="Guardar producto"
                            >
                                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={20} color="#fff" />}
                            </TouchableOpacity>
                        }
                    />

                    <View style={styles.content}>
                        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Nombre del producto *</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                    value={formData.name}
                                    onChangeText={(val) => updateField('name', val)}
                                    placeholder="Ej: Correa Retráctil Pro"
                                    placeholderTextColor={theme.textMuted}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.textMuted }]}>Precio (MXN) *</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                        value={formData.price}
                                        onChangeText={(val) => updateField('price', val)}
                                        keyboardType="decimal-pad"
                                        placeholder="0.00"
                                        placeholderTextColor={theme.textMuted}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: theme.textMuted }]}>{isEditing ? 'Stock disponible *' : 'Stock inicial *'}</Text>
                                    <TextInput
                                        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                        value={formData.stock}
                                        onChangeText={(val) => updateField('stock', val)}
                                        keyboardType="number-pad"
                                        placeholder="10"
                                        placeholderTextColor={theme.textMuted}
                                    />
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
                                <Text style={[styles.label, { color: theme.textMuted }]}>Descripción corta</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                                    value={formData.description}
                                    onChangeText={(val) => updateField('description', val)}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Describe las ventajas de tu producto..."
                                    placeholderTextColor={theme.textMuted}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Especificaciones Técnicas</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                                    value={formData.specifications}
                                    onChangeText={(val) => updateField('specifications', val)}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Materiales, dimensiones, etc."
                                    placeholderTextColor={theme.textMuted}
                                />
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
