/**
 * useProductForm — Business logic for product create/edit form
 * Manages form state, validation, categories, and save operations
 */
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { showAlert } from '@/src/components/AppAlert';
import { getProduct, createProduct, updateProduct, getCategories, getProductPresignedUrl } from '@/src/services/ecommerce';
import { useImageUpload } from '@/src/hooks/useImageUpload';
import { S3_BUCKET_URL } from '@/src/utils/helpers';

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
    // Errores en línea por campo (se borran al corregir el campo)
    const [errors, setErrors] = useState<Partial<Record<'name' | 'price' | 'stock' | 'image', string>>>({});
    // Foto local recién elegida (aún sin subir); al guardar se sube y se reemplaza image_url
    const [localImage, setLocalImage] = useState<string | null>(null);
    const { upload } = useImageUpload({
        presignedUrlFn: async (ext) => {
            const r = await getProductPresignedUrl(ext);
            return { url: r.url, object_key: r.public_url || r.object_key };
        },
        bucketBase: S3_BUCKET_URL,
    });

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
        const price = parseFloat(formData.price.replace(',', '.'));
        const stock = parseInt(formData.stock, 10);
        const nextErrors: typeof errors = {};
        if (!formData.name.trim()) nextErrors.name = 'Escribe el nombre del producto.';
        if (!isFinite(price) || price <= 0) nextErrors.price = 'Debe ser mayor a 0.';
        if (!/^\d+$/.test(formData.stock.trim()) || !Number.isInteger(stock) || stock < 0) nextErrors.stock = 'Un número entero, 0 o más.';
        if (!formData.image_url && !localImage) nextErrors.image = 'Agrega una foto para que los compradores lo vean.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setSaving(true);
        try {
            let imageUrl = formData.image_url;
            if (localImage) {
                const uploaded = await upload(localImage);
                if (!uploaded) return; // useImageUpload ya avisó del error; no se guarda con foto inexistente
                imageUrl = uploaded;
            }

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                specifications: formData.specifications.trim() || null,
                category_id: formData.category_id || null,
                image_url: imageUrl || null,
                price,
                stock,
            } as any;

            if (isEditing) {
                await updateProduct(id as string, payload);
            } else {
                await createProduct(payload);
            }

            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            if (isEditing) queryClient.invalidateQueries({ queryKey: ['product', id] });
            showAlert({
                type: 'success',
                title: isEditing ? 'Producto actualizado' : 'Producto enviado',
                message: isEditing
                    ? 'Los cambios ya están guardados.'
                    : 'Tu producto quedó en revisión; aparecerá en la tienda cuando un administrador lo apruebe.',
            });
            router.back();
        } catch (e: any) {
            showAlert({ type: 'error', title: 'No se pudo guardar el producto', message: e?.message || 'Inténtalo de nuevo.' });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const pickImage = (uri: string | null) => {
        setLocalImage(uri);
        if (uri) setErrors((prev) => ({ ...prev, image: undefined }));
    };

    return {
        isEditing,
        formData,
        updateField,
        saving,
        categories,
        loadingProduct,
        notFound: !!isEditing && !loadingProduct && !product,
        handleSave,
        localImage,
        setLocalImage: pickImage,
        errors,
    };
}
