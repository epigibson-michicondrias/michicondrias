/**
 * useAdminCategories — Business logic for the admin categories screen
 * CRUD de categorías (con imagen y estado activo) y de sus subcategorías. `GET /categories/` ya trae las
 * subcategorías anidadas, así que una sola query alimenta todo el árbol.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    createSubcategory, updateSubcategory, deleteSubcategory, getProductPresignedUrl,
    Category, Subcategory,
} from '@/services/ecommerce';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';
import { uploadImageToPresignedUrl } from '@/utils/upload';
import { getFileExtension } from '@/utils/helpers';

/** Lo que devuelve el backend además del tipo compartido (`CategoryResponse`). */
export type AdminSubcategory = Subcategory & { is_active?: boolean | null };
export type AdminCategory = Category & { is_active?: boolean | null; subcategories?: AdminSubcategory[] };

interface ItemForm {
    name: string;
    description: string;
    is_active: boolean;
}

const EMPTY_FORM: ItemForm = { name: '', description: '', is_active: true };
const CATEGORY_KEYS = [['admin-categories'], ['categories'], ['store-categories']];

export function useAdminCategories() {
    const queryClient = useQueryClient();
    const invalidate = () => CATEGORY_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: getCategories,
    });
    const categories: AdminCategory[] = data ?? [];

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const toggleExpanded = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

    // --- Categoría ---
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
    const [formData, setFormData] = useState<ItemForm>(EMPTY_FORM);
    const [nameError, setNameError] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    /** El admin quitó la imagen que ya tenía la categoría. */
    const [imageRemoved, setImageRemoved] = useState(false);

    const saveMutation = useMutation({
        mutationFn: async () => {
            let imageUrl: string | null = editingCategory?.image_url ?? null;
            if (image) {
                const ext = getFileExtension(image.name);
                const presigned = await getProductPresignedUrl(ext);
                await uploadImageToPresignedUrl(URL.createObjectURL(image), presigned.url, ext);
                imageUrl = presigned.public_url || presigned.object_key;
            } else if (imageRemoved) {
                imageUrl = null;
            }
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                image_url: imageUrl,
                is_active: formData.is_active,
            };
            return editingCategory ? updateCategory(editingCategory.id, payload) : createCategory(payload);
        },
        onSuccess: () => {
            showAlert({ type: 'success', title: editingCategory ? 'Categoría actualizada' : 'Categoría creada' });
            setModalVisible(false);
            invalidate();
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se guardó la categoría', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Categoría eliminada' });
            invalidate();
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo eliminar', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const setImageFile = (file: File | null) => {
        if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        setImage(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
        if (!file) setImageRemoved(true);
    };

    const handleAction = (category?: AdminCategory) => {
        setEditingCategory(category || null);
        setFormData({
            name: category?.name || '',
            description: category?.description || '',
            is_active: category?.is_active ?? true,
        });
        setNameError(null);
        setImage(null);
        setImagePreview(category?.image_url || null);
        setImageRemoved(false);
        setModalVisible(true);
    };

    const updateForm = (patch: Partial<ItemForm>) => {
        setFormData((f) => ({ ...f, ...patch }));
        if (patch.name !== undefined) setNameError(null);
    };

    const handleDelete = (category: AdminCategory) => {
        const subs = category.subcategories?.length ?? 0;
        showAlert({
            type: 'error',
            title: 'Eliminar categoría',
            message: `¿Eliminar "${category.name}"?${subs ? ` También se borrarán sus ${subs} subcategorías.` : ''} Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(category.id),
        });
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            setNameError('Escribe el nombre de la categoría.');
            return;
        }
        saveMutation.mutate();
    };

    const closeModal = () => setModalVisible(false);

    // --- Subcategoría ---
    const [subParent, setSubParent] = useState<AdminCategory | null>(null);
    const [editingSub, setEditingSub] = useState<AdminSubcategory | null>(null);
    const [subForm, setSubForm] = useState<ItemForm>(EMPTY_FORM);
    const [subNameError, setSubNameError] = useState<string | null>(null);

    const saveSubMutation = useMutation({
        mutationFn: () => {
            const payload = {
                name: subForm.name.trim(),
                description: subForm.description.trim() || null,
                is_active: subForm.is_active,
            };
            if (editingSub) return updateSubcategory(editingSub.id, payload);
            const createPayload = { ...payload, category_id: subParent?.id };
            return createSubcategory(createPayload);
        },
        onSuccess: () => {
            showAlert({ type: 'success', title: editingSub ? 'Subcategoría actualizada' : 'Subcategoría creada' });
            if (subParent) setExpandedId(subParent.id);
            setSubParent(null);
            invalidate();
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se guardó la subcategoría', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const deleteSubMutation = useMutation({
        mutationFn: deleteSubcategory,
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Subcategoría eliminada' });
            invalidate();
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo eliminar', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const openSubModal = (parent: AdminCategory, sub?: AdminSubcategory) => {
        setSubParent(parent);
        setEditingSub(sub || null);
        setSubForm({ name: sub?.name || '', description: sub?.description || '', is_active: sub?.is_active ?? true });
        setSubNameError(null);
    };

    const updateSubForm = (patch: Partial<ItemForm>) => {
        setSubForm((f) => ({ ...f, ...patch }));
        if (patch.name !== undefined) setSubNameError(null);
    };

    const handleSubSubmit = () => {
        if (!subForm.name.trim()) {
            setSubNameError('Escribe el nombre de la subcategoría.');
            return;
        }
        saveSubMutation.mutate();
    };

    const handleSubDelete = (sub: AdminSubcategory) =>
        showAlert({
            type: 'error',
            title: 'Eliminar subcategoría',
            message: `¿Eliminar "${sub.name}"? Esta acción no se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteSubMutation.mutate(sub.id),
        });

    const closeSubModal = () => setSubParent(null);

    return {
        categories,
        isLoading,
        refetch,
        isRefetching,
        expandedId,
        toggleExpanded,
        // categoría
        isModalVisible,
        editingCategory,
        formData,
        updateForm,
        nameError,
        imagePreview,
        setImageFile,
        isSaving: saveMutation.isPending,
        handleAction,
        handleDelete,
        handleSubmit,
        closeModal,
        // subcategoría
        subParent,
        editingSub,
        subForm,
        updateSubForm,
        subNameError,
        isSavingSub: saveSubMutation.isPending,
        openSubModal,
        handleSubSubmit,
        handleSubDelete,
        closeSubModal,
    };
}
