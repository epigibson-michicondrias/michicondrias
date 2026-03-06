import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, createProduct, updateProduct, getCategories, Category } from '../../../src/services/ecommerce';
import Colors from '../../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { ChevronLeft, Save, Package, Image as ImageIcon, Tag, DollarSign, List, Info, CheckCircle2 } from 'lucide-react-native';

export default function VendedorProductoFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = id && id !== 'nuevo';
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: '',
        specifications: '',
    });
    const [saving, setSaving] = useState(false);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const { data: product, isLoading: loadingProduct } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProduct(id as string),
        enabled: !!isEditing,
    });

    useEffect(() => {
        if (isEditing && product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                stock: product.stock.toString(),
                category_id: product.category_id || '',
                image_url: product.image_url || '',
                specifications: product.specifications || '',
            });
        }
    }, [product, isEditing]);

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.stock) {
            Alert.alert("Error", "Por favor completa los campos obligatorios");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
            };

            if (isEditing) {
                await updateProduct(id as string, payload);
            } else {
                await createProduct(payload);
            }

            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            Alert.alert("Éxito", `Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`);
            router.back();
        } catch (e) {
            Alert.alert("Error", "No se pudo guardar el producto");
        } finally {
            setSaving(false);
        }
    };

    if (isEditing && loadingProduct) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <ChevronLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.titleBox}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                            {isEditing ? 'Actualiza los detalles' : 'Añade un artículo a tu tienda'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={20} color="#fff" />}
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Nombre del producto *</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                value={formData.name}
                                onChangeText={(val) => setFormData({ ...formData, name: val })}
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
                                    onChangeText={(val) => setFormData({ ...formData, price: val })}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor={theme.textMuted}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: theme.textMuted }]}>Stock inicial *</Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                    value={formData.stock}
                                    onChangeText={(val) => setFormData({ ...formData, stock: val })}
                                    keyboardType="numeric"
                                    placeholder="10"
                                    placeholderTextColor={theme.textMuted}
                                />
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.groupTitle, { color: theme.textMuted }]}>CATEGORÍA Y FOTOS</Text>
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>URL de la Imagen</Text>
                            <TextInput
                                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                                value={formData.image_url}
                                onChangeText={(val) => setFormData({ ...formData, image_url: val })}
                                placeholder="https://..."
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Categoría</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catLabels}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setFormData({ ...formData, category_id: cat.id })}
                                        style={[
                                            styles.catBadge,
                                            { backgroundColor: theme.background, borderColor: theme.border },
                                            formData.category_id === cat.id && { backgroundColor: theme.primary + '20', borderColor: theme.primary }
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
                    <View style={[styles.section, { backgroundColor: theme.surface }]}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.textMuted }]}>Descripción corta</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { color: theme.text, borderColor: theme.border }]}
                                value={formData.description}
                                onChangeText={(val) => setFormData({ ...formData, description: val })}
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
                                onChangeText={(val) => setFormData({ ...formData, specifications: val })}
                                multiline
                                numberOfLines={3}
                                placeholder="Materiales, dimensiones, etc."
                                placeholderTextColor={theme.textMuted}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center' },
    titleBox: { flex: 1 },
    headerTitle: { fontSize: 22, fontWeight: '900' },
    headerSubtitle: { fontSize: 13, fontWeight: '600' },
    saveBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    content: { padding: 24, paddingBottom: 100 },
    section: { padding: 20, borderRadius: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    groupTitle: { fontSize: 12, fontWeight: '800', marginBottom: 12, marginLeft: 12, letterSpacing: 1 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
    input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 15, fontWeight: '600' },
    textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
    row: { flexDirection: 'row', gap: 12 },
    catLabels: { flexDirection: 'row', marginTop: 8 },
    catBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1 },
    catText: { fontSize: 12, fontWeight: '600' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
