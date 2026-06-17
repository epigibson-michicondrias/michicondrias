/**
 * useProductForm — Business logic for product create/edit form
 * Manages form state, validation, categories, and save operations
 */
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { getProduct, createProduct, updateProduct, getCategories, Category } from '@/src/services/ecommerce';

export function useProductForm() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = id && id !== 'nuevo';
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
            showAlert({ type: 'error', title: 'Error', message: 'Por favor completa los campos obligatorios' });
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
            showAlert({ type: 'success', title: 'Éxito', message: `Producto ${isEditing ? 'actualizado' : 'creado'} correctamente` });
            router.back();
        } catch (e) {
            showAlert({ type: 'error', title: 'Error', message: 'No se pudo guardar el producto' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return {
        isEditing,
        formData,
        updateField,
        saving,
        categories,
        loadingProduct,
        handleSave,
    };
}
