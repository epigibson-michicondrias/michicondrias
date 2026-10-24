/**
 * useProductForm — alta y edición de producto del vendedor (`(app)/tienda/vendedor/productos/[id]`, `nuevo` = alta).
 * Espejo de `mobile/src/hooks/ecommerce/useProductForm.ts`. El formulario parte del producto guardado y solo guarda
 * en estado lo que el vendedor cambia.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/AppAlert";
import {
  createProduct,
  getCategories,
  getProduct,
  getProductPresignedUrl,
  updateProduct,
} from "@/services/ecommerce";
import { getFileExtension } from "@/utils/helpers";
import { uploadImageToPresignedUrl } from "@/utils/upload";
import { errorMessage } from "@/features/servicios-pro/requestStatus";

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
  image_url: string;
  specifications: string;
}

type FormErrors = Partial<Record<"name" | "price" | "stock" | "image", string>>;

export function useProductForm(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = id !== "nuevo";
  const [edits, setEdits] = useState<Partial<ProductFormData>>({});
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: isEditing,
  });

  const formData: ProductFormData = {
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    stock: product ? String(product.stock) : "",
    category_id: product?.category_id ?? "",
    image_url: product?.image_url ?? "",
    specifications: product?.specifications ?? "",
    ...edits,
  };

  const updateField = (field: keyof ProductFormData, value: string) => {
    setEdits((prev) => ({ ...prev, [field]: value }));
    if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const pickImage = (file: File | null) => {
    setImage(file);
    if (file) setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleSave = async () => {
    const price = parseFloat(formData.price.replace(",", "."));
    const stock = parseInt(formData.stock, 10);
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = "Escribe el nombre del producto.";
    if (!isFinite(price) || price <= 0) next.price = "Debe ser mayor a 0.";
    if (!/^\d+$/.test(formData.stock.trim())) next.stock = "Un número entero, 0 o más.";
    if (!formData.image_url && !image) next.image = "Agrega una foto para que los compradores lo vean.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      let imageUrl = formData.image_url;
      if (image) {
        const ext = getFileExtension(image.name);
        const presigned = await getProductPresignedUrl(ext);
        await uploadImageToPresignedUrl(URL.createObjectURL(image), presigned.url, ext);
        imageUrl = presigned.public_url || presigned.object_key;
      }
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        specifications: formData.specifications.trim() || null,
        category_id: formData.category_id || null,
        image_url: imageUrl || null,
        price,
        stock,
      };
      if (isEditing) await updateProduct(id, payload);
      else await createProduct(payload);

      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["store-products"] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ["product", id] });
      showAlert({
        type: "success",
        title: isEditing ? "Producto actualizado" : "Producto enviado",
        message: isEditing
          ? "Los cambios ya están guardados."
          : "Tu producto quedó en revisión; aparecerá en la tienda cuando un administrador lo apruebe.",
      });
      router.push("/tienda/vendedor/productos");
    } catch (e) {
      showAlert({ type: "error", title: "No se pudo guardar el producto", message: errorMessage(e, "Inténtalo de nuevo.") });
    } finally {
      setSaving(false);
    }
  };

  return {
    isEditing,
    formData,
    updateField,
    saving,
    categories,
    loadingProduct: isEditing && loadingProduct,
    notFound: isEditing && !loadingProduct && !product,
    handleSave,
    image,
    setImage: pickImage,
    errors,
  };
}
