"use client";

/**
 * Michi-Shop — catálogo (espejo de `mobile/app/(tabs)/tienda-tab.tsx`).
 */
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LayoutGrid, List, Package, Plus, Search, ShoppingBag, SlidersHorizontal } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SearchBar from "@/components/SearchBar";
import FilterChip from "@/components/FilterChip";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import { Skeleton } from "@/components/Skeleton";
import { useShopTab, SHOP_SORTS, type ShopViewMode } from "@/hooks/ecommerce/useShopTab";
import { useProductFavorites } from "@/hooks/ecommerce/useProductFavorites";
import s from "./tienda.module.css";

function ProductCard({
  id, name, price, image_url, stock, average_rating, review_count,
  onQuickAdd, canBuy, viewMode,
}: {
  id: string; name: string; price: number; image_url: string | null; stock: number;
  average_rating: number; review_count: number;
  onQuickAdd?: () => void; canBuy: boolean; viewMode: ShopViewMode;
}) {
  return (
    <div className={viewMode === "list" ? s.cardList : s.card}>
      <Link href={`/tienda/producto/${id}`} className={s.cardMedia}>
        {image_url ? (
          <Image src={image_url} alt={name} width={200} height={200} className={s.cardImg} />
        ) : (
          <div className={s.cardImgFallback}><Package size={32} /></div>
        )}
      </Link>
      <div className={s.cardBody}>
        <Link href={`/tienda/producto/${id}`} className={s.cardName}>{name}</Link>
        <p className={s.cardPrice}>${price.toFixed(2)}</p>
        <p className={s.cardMeta}>
          {review_count > 0 ? `${average_rating.toFixed(1)} · ${review_count} opiniones` : "Sin opiniones"}
          {stock <= 0 ? " · Agotado" : ""}
        </p>
        {onQuickAdd && canBuy && stock > 0 && (
          <Button label="Agregar" size="sm" fullWidth={false} icon={<Plus size={16} />} onPress={onQuickAdd} />
        )}
      </div>
    </div>
  );
}

function CatalogContent() {
  const {
    categories, selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery, sort, setSort, viewMode, setViewMode,
    hasFilters, clearFilters, products, hasMore, loadMore, isLoadingMore,
    isLoading, isUpdating, cartCount, quickAdd, canBuy,
  } = useShopTab();
  const { isFavorite, toggleFavorite } = useProductFavorites();
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Michi-Shop"
        subtitle="Todo para tu mejor amigo"
        showBack={false}
        rightElement={
          <div className={s.headerActions}>
            <button type="button" className={s.iconBtn} onClick={() => router.push("/tienda/compras")} aria-label="Mis compras">
              <ShoppingBag size={20} />
            </button>
            <button type="button" className={s.iconBtn} onClick={() => router.push("/tienda/carrito")} aria-label="Abrir bolsa">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className={s.badge}>{cartCount > 99 ? "99+" : cartCount}</span>}
            </button>
          </div>
        }
      />

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar productos para tu michi…" />

      <div className={s.chips}>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            label={c.label}
            active={selectedCategory === c.id}
            onPress={() => setSelectedCategory(c.id)}
            icon={<c.icon size={14} />}
          />
        ))}
      </div>

      <div className={s.toolbar}>
        <p className={s.count}>{isLoading ? "Buscando…" : `${products.length} productos`}</p>
        <div className={s.toolbarActions}>
          <label className={s.sortLabel}>
            <SlidersHorizontal size={16} aria-hidden />
            <select className={s.sortSelect} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              {SHOP_SORTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <div className={s.viewToggle} role="group" aria-label="Modo de vista">
            <button type="button" className={`${s.viewBtn} ${viewMode === "grid" ? s.viewBtnActive : ""}`} onClick={() => setViewMode("grid")} aria-label="Ver en cuadrícula">
              <LayoutGrid size={18} />
            </button>
            <button type="button" className={`${s.viewBtn} ${viewMode === "list" ? s.viewBtnActive : ""}`} onClick={() => setViewMode("list")} aria-label="Ver como lista">
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={viewMode === "list" ? s.gridList : s.grid}>
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={200} borderRadius={16} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Search size={28} />}
          title={hasFilters ? "Sin resultados" : "Aún no hay productos"}
          subtitle={hasFilters ? "Prueba con otra búsqueda o categoría." : "Cuando el catálogo tenga productos aparecerán aquí."}
          actionLabel={hasFilters ? "Quitar filtros" : undefined}
          onAction={hasFilters ? clearFilters : undefined}
        />
      ) : (
        <>
          <div className={`${viewMode === "list" ? s.gridList : s.grid} ${isUpdating ? s.updating : ""}`}>
            {products.map((p) => (
              <div key={p.id} className={s.cardWrap}>
                <ProductCard
                  {...p}
                  viewMode={viewMode}
                  canBuy={canBuy(p)}
                  onQuickAdd={() => quickAdd(p)}
                />
                <button
                  type="button"
                  className={`${s.favBtn} ${isFavorite(p.id) ? s.favOn : ""}`}
                  onClick={() => toggleFavorite(p.id)}
                  aria-label={isFavorite(p.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                >
                  <Heart size={16} fill={isFavorite(p.id) ? "currentColor" : "none"} />
                </button>
              </div>
            ))}
          </div>
          {hasMore && (
            <Button
              label={isLoadingMore ? "Cargando…" : "Ver más"}
              variant="secondary"
              onPress={loadMore}
              loading={isLoadingMore}
            />
          )}
        </>
      )}
    </ScreenContainer>
  );
}

export default function TiendaPage() {
  return (
    <Suspense fallback={null}>
      <CatalogContent />
    </Suspense>
  );
}
