"use client";

/**
 * Productos (`/admin/productos`): catálogo de la tienda con búsqueda y filtros por estado; fila → ficha del producto.
 * Espejo de `mobile/app/admin/productos/index.tsx` (allí "Inventario" y "Gestionar" solo mostraban avisos).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ShieldCheck } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import Badge from "@/components/Badge";
import EmptyState from "@/components/EmptyState";
import FilterChip from "@/components/FilterChip";
import SearchBar from "@/components/SearchBar";
import { SkeletonList } from "@/components/Skeleton";
import { useAdminProducts, type Product, type ProductFilter } from "@/hooks/admin/useAdminProducts";
import { formatCurrency } from "@/utils/formatters";
import { getS3Url } from "@/utils/helpers";
import s from "@/features/admin/admin.module.css";

const CHIPS: { key: ProductFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "published", label: "Publicados" },
  { key: "review", label: "En revisión" },
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
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Existencias</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {p.products.map((prod) => {
                const st = productStatus(prod);
                const href = `/tienda/producto/${prod.id}`;
                return (
                  <tr key={prod.id} className={s.rowLink} onClick={() => router.push(href)}>
                    <td>
                      <div className={s.who}>
                        {prod.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- imagen del storage
                          <img src={getS3Url(prod.image_url)} alt="" className={s.thumb} />
                        ) : (
                          <span className={s.thumb} aria-hidden>
                            <Package size={20} />
                          </span>
                        )}
                        <div className={s.cellMain}>
                          <Link href={href} className={`${s.cellTitle} ${s.cellLink}`} onClick={(e) => e.stopPropagation()}>
                            {prod.name}
                          </Link>
                          {prod.category?.name ? <span className={s.cellSub}>{prod.category.name}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td data-label="Precio" className={s.nowrap}>
                      {formatCurrency(prod.price)}
                    </td>
                    <td data-label="Existencias">
                      {prod.stock <= 0 ? (
                        <Badge label="Agotado" color="var(--color-error)" size="sm" variant="outlined" />
                      ) : (
                        <span className={prod.stock < 5 ? undefined : s.cellSub}>
                          {prod.stock} {prod.stock === 1 ? "pieza" : "piezas"}
                          {prod.stock < 5 ? " · pocas" : ""}
                        </span>
                      )}
                    </td>
                    <td data-label="Estado">
                      <Badge label={st.label} color={st.color} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </ScreenContainer>
  );
}
