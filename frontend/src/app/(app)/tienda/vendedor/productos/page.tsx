"use client";

/**
 * Mi catálogo (`/tienda/vendedor/productos`, `?filtro=` abre un filtro).
 * Espejo de `mobile/app/tienda/vendedor/productos.tsx`.
 */
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Package, Plus, SearchX, Star, Trash2 } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import IconButton from "@/components/IconButton";
import RoleGuard from "@/components/RoleGuard";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { MediaRow } from "@/features/tienda/SellerKit";
import { CATALOG_FILTERS, LOW_STOCK, useSellerProducts } from "@/hooks/ecommerce/useSellerProducts";
import type { Product } from "@/services/ecommerce";
import { formatCurrency } from "@/utils/formatters";
import s from "@/features/tienda/vendedor.module.css";

const NEW_PRODUCT = "/tienda/vendedor/productos/nuevo";

export default function VendedorProductosPage() {
  return (
    <RoleGuard roles={["vendedor"]}>
      <Suspense fallback={<SkeletonList count={5} />}>
        <Catalogo />
      </Suspense>
    </RoleGuard>
  );
}

function statusBadge(p: Product) {
  if (p.is_approved === false) return <Badge label="En revisión" color="var(--color-info)" size="sm" />;
  if (!p.is_active) return <Badge label="Oculto" color="var(--color-text-muted)" size="sm" />;
  if (p.stock <= 0) return <Badge label="Agotado" color="var(--color-error)" size="sm" />;
  if (p.stock <= LOW_STOCK) return <Badge label={`Quedan ${p.stock}`} color="var(--color-warning)" size="sm" />;
  return null;
}

function Catalogo() {
  const router = useRouter();
  const c = useSellerProducts(useSearchParams().get("filtro"));
  const goNew = () => router.push(NEW_PRODUCT);
  const total = c.products.length;

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Mi catálogo"
        subtitle={`${total} ${total === 1 ? "producto" : "productos"}`}
        actions={[{ icon: Plus, label: "Publicar producto", onPress: goNew }]}
      />

      {c.isLoading ? (
        <SkeletonList count={5} />
      ) : total === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title="Aún no tienes productos"
          subtitle="Publica tu primer producto con foto, precio y existencias. Un admin lo revisa antes de mostrarlo en la tienda."
          actionLabel="Publicar producto"
          onAction={goNew}
        />
      ) : (
        <>
          <div className={s.filters}>
            <SearchBar value={c.searchQuery} onChangeText={c.setSearchQuery} placeholder="Buscar en tu catálogo..." />
            <div className={s.chips}>
              {CATALOG_FILTERS.filter((f) => f.key === "todos" || c.counts[f.key] > 0).map((f) => (
                <FilterChip
                  key={f.key}
                  label={f.label}
                  count={f.key === "todos" ? undefined : c.counts[f.key]}
                  active={c.filter === f.key}
                  onPress={() => c.setFilter(f.key)}
                />
              ))}
            </div>
          </div>

          {c.filteredProducts.length === 0 ? (
            <EmptyState
              icon={<SearchX size={28} />}
              title="Sin resultados"
              subtitle="Ningún producto coincide con la búsqueda o el filtro."
              actionLabel="Ver todos"
              onAction={() => {
                c.setFilter("todos");
                c.setSearchQuery("");
              }}
            />
          ) : (
            <div className={s.list}>
              {c.filteredProducts.map((item) => (
                <MediaRow
                  key={item.id}
                  imageUrl={item.image_url}
                  fallbackIcon={Package}
                  title={item.name}
                  trailing={statusBadge(item)}
                  lines={[
                    { text: `${formatCurrency(item.price)} · ${item.stock} en existencia` },
                    ...(item.review_count > 0
                      ? [{
                          text: `${item.average_rating.toFixed(1)} · ${item.review_count} ${item.review_count === 1 ? "opinión" : "opiniones"}`,
                          icon: Star,
                        }]
                      : []),
                  ]}
                  onPress={() => router.push(`/tienda/vendedor/productos/${item.id}`)}
                  accessibilityLabel={`Editar ${item.name}`}
                  actions={
                    <>
                      <IconButton
                        icon={item.is_active ? Eye : EyeOff}
                        accessibilityLabel={item.is_active ? `Ocultar ${item.name} de la tienda` : `Publicar ${item.name} en la tienda`}
                        onPress={() => c.toggleProductStatus(item.id, item.is_active)}
                        loading={c.togglingId === item.id}
                        color={item.is_active ? "var(--color-primary)" : "var(--color-text-muted)"}
                        size="sm"
                      />
                      <IconButton
                        icon={Trash2}
                        accessibilityLabel={`Eliminar ${item.name}`}
                        onPress={() => c.handleDelete(item.id)}
                        color="var(--color-error)"
                        size="sm"
                      />
                    </>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </ScreenContainer>
  );
}
