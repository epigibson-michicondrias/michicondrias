"use client";

/**
 * Michi-Shop — catálogo con filtros laterales y rejilla de productos. Criterio §0.
 */
import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LayoutGrid, List, MapPin, Package, Plus, Search, ShoppingBag, SlidersHorizontal, Sparkles, Star, Truck, Zap, Eye, DollarSign, Filter } from "lucide-react";
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
  const installments = price >= 500 ? Math.ceil(price / 12) : 0;
  return (
    <div className={viewMode === "list" ? s.cardList : s.card}>
      <Link href={`/tienda/producto/${id}`} className={s.cardMedia}>
        {image_url ? (
          <Image src={image_url} alt={name} width={200} height={200} className={s.cardImg} />
        ) : (
          <div className={s.cardImgFallback}><Package size={32} /></div>
        )}
        {viewMode !== "list" && (
          <div className={s.cardOverlay}>
            <span className={s.quickViewBtn}><Eye size={14} /> Ver producto</span>
          </div>
        )}
      </Link>
      <div className={s.cardBody}>
        {price >= 500 && <span className={s.cardBadge}>Oferta</span>}
        <Link href={`/tienda/producto/${id}`} className={s.cardName}>{name}</Link>
        <p className={s.cardPrice}>${price.toFixed(2)}</p>
        {installments > 0 && (
          <p className={s.cardInstallments}>12x ${installments.toFixed(2)} sin interés</p>
        )}
        {stock > 0 && price >= 300 && (
          <span className={s.cardShipping}><Truck size={12} /> Envío gratis</span>
        )}
        {review_count > 0 && (
          <div className={s.cardRating}>
            <span className={s.cardStars}>{"★".repeat(Math.round(average_rating))}{"☆".repeat(5 - Math.round(average_rating))}</span>
            <span>{average_rating.toFixed(1)} ({review_count})</span>
          </div>
        )}
        {stock <= 0 && <p className={s.cardMeta}>Agotado</p>}
        {onQuickAdd && canBuy && stock > 0 && (
          <Button label="Agregar al carrito" size="sm" fullWidth icon={<Plus size={16} />} onPress={onQuickAdd} />
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
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState(0);

  // Filtrar productos por precio y rating localmente
  const filteredProducts = products.filter((p) => {
    if (priceMin && p.price < parseFloat(priceMin)) return false;
    if (priceMax && p.price > parseFloat(priceMax)) return false;
    if (minRating > 0 && p.average_rating < minRating) return false;
    return true;
  });

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Michi-Shop"
        subtitle="Todo para tu mejor amigo"
        showBack={false}
        rightElement={
          <div className={s.headerActions}>
            <button type="button" className={s.iconBtn} onClick={() => router.push("/tienda/compras")} aria-label="Mis compras">
              <Package size={20} />
            </button>
            <button type="button" className={s.iconBtn} onClick={() => router.push("/tienda/carrito")} aria-label="Abrir bolsa">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className={s.badge}>{cartCount > 99 ? "99+" : cartCount}</span>}
            </button>
          </div>
        }
      />

      <div className={s.layout}>
        {/* ── Filtros laterales ── */}
        <aside className={s.sidebar}>
          <div className={s.searchWrap}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Buscar productos…" />
          </div>

          <div className={s.filterSection}>
            <h3 className={s.filterTitle}><Sparkles size={14} /> Categorías</h3>
            <div className={s.filterList}>
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
          </div>

          <div className={s.filterSection}>
            <h3 className={s.filterTitle}><DollarSign size={14} /> Precio</h3>
            <div className={s.priceRange}>
              <input
                type="number"
                className={s.priceInput}
                placeholder="Mín"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                aria-label="Precio mínimo"
              />
              <span>—</span>
              <input
                type="number"
                className={s.priceInput}
                placeholder="Máx"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                aria-label="Precio máximo"
              />
            </div>
          </div>

          <div className={s.filterSection}>
            <h3 className={s.filterTitle}><Star size={14} /> Rating</h3>
            <div className={s.ratingFilter}>
              {[0, 4, 3, 2].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  className={`${s.ratingOption} ${minRating === rating ? s.active : ""}`}
                  onClick={() => setMinRating(rating)}
                >
                  <span className={s.cardStars}>{rating === 0 ? "Todos" : "★".repeat(rating) + "☆".repeat(5 - rating)}</span>
                  {rating > 0 && <span>{rating}+</span>}
                </button>
              ))}
            </div>
          </div>

          <div className={s.filterSection}>
            <h3 className={s.filterTitle}><SlidersHorizontal size={14} /> Ordenar</h3>
            <select className={s.sortSelect} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
              {SHOP_SORTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <Button label="Limpiar filtros" variant="ghost" size="sm" fullWidth onPress={clearFilters} />
          )}
        </aside>

        {/* ── Resultados ── */}
        <div className={s.results}>
          <div className={s.resultsHeader}>
            <p className={s.count}>{isLoading ? "Buscando…" : `${filteredProducts.length} productos`}</p>
            <div className={s.viewToggle} role="group" aria-label="Modo de vista">
              <button type="button" className={`${s.viewBtn} ${viewMode === "grid" ? s.viewBtnActive : ""}`} onClick={() => setViewMode("grid")} aria-label="Ver en cuadrícula">
                <LayoutGrid size={18} />
              </button>
              <button type="button" className={`${s.viewBtn} ${viewMode === "list" ? s.viewBtnActive : ""}`} onClick={() => setViewMode("list")} aria-label="Ver como lista">
                <List size={18} />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className={viewMode === "list" ? s.gridList : s.grid}>
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={200} borderRadius={16} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={<Search size={28} />}
              title={hasFilters || priceMin || priceMax || minRating > 0 ? "Sin resultados" : "Aún no hay productos"}
              subtitle={hasFilters || priceMin || priceMax || minRating > 0 ? "Prueba con otra búsqueda, categoría o rango de precio." : "Cuando el catálogo tenga productos aparecerán aquí."}
              actionLabel={hasFilters || priceMin || priceMax || minRating > 0 ? "Quitar filtros" : undefined}
              onAction={hasFilters || priceMin || priceMax || minRating > 0 ? () => { clearFilters(); setPriceMin(""); setPriceMax(""); setMinRating(0); } : undefined}
            />
          ) : (
            <>
              <div className={`${viewMode === "list" ? s.gridList : s.grid} ${isUpdating ? s.updating : ""}`}>
                {filteredProducts.map((p) => (
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
        </div>
      </div>
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
