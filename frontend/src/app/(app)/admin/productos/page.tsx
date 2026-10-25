"use client";

/**
 * Productos (`/admin/productos`): catálogo de la tienda con búsqueda y filtros por estado (incluidos los ocultos),
 * y acción de mostrar/ocultar sin borrar. Fila → ficha del producto.
 * Espejo de `mobile/app/admin/productos/index.tsx`.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Package, ShieldCheck, X } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import IconButton from "@/components/IconButton";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import DataTable, { type Column } from "@/components/DataTable";
import { useAdminProducts, type Product, type ProductFilter } from "@/hooks/admin/useAdminProducts";
import { formatCurrency } from "@/utils/formatters";
import { getS3Url } from "@/utils/helpers";
import s from "@/features/admin/admin.module.css";

const CHIPS: { key: ProductFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "published", label: "Publicados" },
  { key: "review", label: "En revisión" },
  { key: "hidden", label: "Ocultos" },
  { key: "out", label: "Agotados" },
];

function productStatus(p: Product): { label: string; color: string } {
  if (p.is_approved === false) return { label: "En revisión", color: "var(--color-warning)" };
  if (!p.is_active) return { label: "Oculto", color: "var(--color-text-muted)" };
  return { label: "Publicado", color: "var(--color-success)" };
}

export default function AdminProductosPage() {
  const router = useRouter();
  const p = useAdminProducts();
  const reviewCount = p.count("review");

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Productos"
        subtitle={`${p.total} ${p.total === 1 ? "producto" : "productos"}${reviewCount ? ` · ${reviewCount} en revisión` : ""}`}
        actions={reviewCount ? [{ icon: ShieldCheck, label: "Revisar pendientes", onPress: () => router.push("/admin/moderacion") }] : undefined}
      />

      <div className={s.toolbar}>
        <SearchBar value={p.searchText} onChangeText={p.setSearchText} placeholder="Buscar por nombre..." />
        <div className={s.chips}>
          {CHIPS.map((f) => (
            <FilterChip key={f.key} label={f.label} count={p.count(f.key)} active={p.filter === f.key} onPress={() => p.setFilter(f.key)} />
          ))}
        </div>
      </div>

      {p.isLoading ? (
        <SkeletonList count={6} />
      ) : p.products.length === 0 ? (
        <EmptyState
          icon={<Package size={28} />}
          title={p.filtering ? "Sin resultados" : "Aún no hay productos"}
          subtitle={p.filtering ? "Ningún producto coincide con la búsqueda o el filtro." : "Los productos que publiquen los vendedores aparecerán aquí."}
          actionLabel={p.filtering ? "Quitar filtros" : undefined}
          onAction={p.filtering ? p.clearFilters : undefined}
        />
      ) : (
        <DataTable
          caption="Productos de la tienda"
          rowKey={(prod) => prod.id}
          rowHref={(prod) => `/tienda/producto/${prod.id}`}
          columns={[
            {
              key: "product",
              header: "Producto",
              primary: true,
              render: (prod) => (
                <div className={s.who}>
                  {prod.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- imagen del storage
                    <img src={getS3Url(prod.image_url)} alt="" className={s.thumb} />
                  ) : (
                    <span className={s.thumb} aria-hidden><Package size={20} /></span>
                  )}
                  <div className={s.cellMain}>
                    <strong>{prod.name}</strong>
                    {prod.category?.name ? <span className={s.cellSub}>{prod.category.name}</span> : null}
                  </div>
                </div>
              ),
            },
            {
              key: "price",
              header: "Precio",
              render: (prod) => <span className={s.nowrap}>{formatCurrency(prod.price)}</span>,
            },
            {
              key: "stock",
              header: "Existencias",
              render: (prod) => (
                prod.stock <= 0 ? (
                  <Badge label="Agotado" color="var(--color-error)" size="sm" variant="outlined" />
                ) : (
                  <span className={prod.stock < 5 ? undefined : s.cellSub}>
                    {prod.stock} {prod.stock === 1 ? "pieza" : "piezas"}
                    {prod.stock < 5 ? " · pocas" : ""}
                  </span>
                )
              ),
            },
            {
              key: "status",
              header: "Estado",
              render: (prod) => {
                const st = productStatus(prod);
                return <Badge label={st.label} color={st.color} size="sm" />;
              },
            },
          ]}
          rowActions={(prod) => {
            const busy = p.busyId === prod.id;
            const isPending = prod.is_approved === false;
            const hidden = !prod.is_active;
            return (
              <div className={s.cellActions}>
                {isPending ? (
                  <>
                    <Button
                      label="Aprobar"
                      icon={<Check size={16} />}
                      size="sm"
                      variant="secondary"
                      fullWidth={false}
                      onPress={() => p.approve(prod)}
                      loading={busy}
                      disabled={!!p.busyId && !busy}
                    />
                    <Button
                      label="Rechazar"
                      icon={<X size={16} />}
                      size="sm"
                      variant="danger"
                      fullWidth={false}
                      onPress={() => p.reject(prod)}
                      disabled={!!p.busyId}
                    />
                  </>
                ) : (
                  <IconButton
                    icon={hidden ? Eye : EyeOff}
                    accessibilityLabel={hidden ? `Mostrar ${prod.name}` : `Ocultar ${prod.name}`}
                    onPress={() => p.toggleVisibility(prod)}
                    color={hidden ? "var(--color-success)" : "var(--color-text-muted)"}
                    size="sm"
                    disabled={!!p.busyId && !busy}
                  />
                )}
              </div>
            );
          }}
          rows={p.products}
        />
      )}
    </ScreenContainer>
  );
}
