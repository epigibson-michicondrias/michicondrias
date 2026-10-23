/**
 * useSellerProducts — catálogo del vendedor: búsqueda, filtros por estado (publicado, en revisión, oculto, agotado),
 * mostrar/ocultar y eliminar. Espejo de `mobile/src/hooks/ecommerce/useSellerProducts.ts`.
 */
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/AppAlert";
import { deleteProduct, getMyProducts, updateProduct, type Product } from "@/services/ecommerce";
import { errorMessage } from "@/features/servicios-pro/requestStatus";

/** Filtros del catálogo; `?filtro=` abre uno directo (desde los avisos del panel). */
export const CATALOG_FILTERS = [
  { key: "todos", label: "Todos", match: () => true },
  { key: "publicados", label: "Publicados", match: (p: Product) => p.is_active && p.is_approved !== false },
  { key: "revision", label: "En revisión", match: (p: Product) => p.is_approved === false },
  { key: "ocultos", label: "Ocultos", match: (p: Product) => !p.is_active },
  { key: "agotados", label: "Agotados", match: (p: Product) => p.stock <= 0 },
] as const;
export type CatalogFilter = (typeof CATALOG_FILTERS)[number]["key"];

/** Existencias a partir de las cuales se avisa «quedan pocas». */
export const LOW_STOCK = 5;

const INVALIDATE = [["my-products"], ["store-products"], ["product"], ["admin-products"]];

export function useSellerProducts(initialFilter?: string | null) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<CatalogFilter>(
    CATALOG_FILTERS.some((f) => f.key === initialFilter) ? (initialFilter as CatalogFilter) : "todos",
  );

  const { data: products = [], isLoading } = useQuery({ queryKey: ["my-products"], queryFn: getMyProducts });

  const invalidate = () => INVALIDATE.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      showAlert({
        type: "success",
        title: "Producto eliminado",
        message: "Si ya tenía ventas, se ocultó para conservar el historial.",
      });
    },
    onError: (e) => showAlert({ type: "error", title: "No se pudo eliminar", message: errorMessage(e, "Inténtalo de nuevo.") }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateProduct(id, { is_active: !active }),
    onSuccess: (_res, { active }) => {
      invalidate();
      showAlert({
        type: "success",
        title: active ? "Producto oculto" : "Producto publicado",
        message: active
          ? "Ya no aparece en la tienda. Puedes volver a publicarlo cuando quieras."
          : "Ya se puede comprar en Michi-Shop.",
      });
    },
    onError: (e) => showAlert({ type: "error", title: "No se pudo actualizar", message: errorMessage(e, "Inténtalo de nuevo.") }),
  });

  const handleDelete = (id: string) => {
    showAlert({
      type: "warning",
      title: "Eliminar producto",
      message:
        "Se quitará de tu catálogo y de la tienda. Si ya tuvo ventas, se oculta para conservar el historial. No se puede deshacer.",
      showCancel: true,
      cancelText: "Cancelar",
      buttonText: "Eliminar",
      onButtonPress: () => deleteMutation.mutate(id),
    });
  };

  const counts = useMemo(
    () =>
      Object.fromEntries(CATALOG_FILTERS.map((f) => [f.key, products.filter(f.match).length])) as Record<
        CatalogFilter,
        number
      >,
    [products],
  );

  const filteredProducts = useMemo(() => {
    const match = CATALOG_FILTERS.find((f) => f.key === filter)!.match;
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => match(p) && (!q || p.name.toLowerCase().includes(q)));
  }, [products, filter, searchQuery]);

  return {
    products,
    filteredProducts,
    filter,
    setFilter,
    counts,
    togglingId: toggleMutation.isPending ? toggleMutation.variables?.id : undefined,
    isLoading,
    searchQuery,
    setSearchQuery,
    handleDelete,
    toggleProductStatus: (id: string, active: boolean) => toggleMutation.mutate({ id, active }),
  };
}
