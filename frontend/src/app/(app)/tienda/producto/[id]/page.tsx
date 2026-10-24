"use client";

/**
 * Detalle de producto — espejo de `mobile/app/tienda/producto/[id].tsx`.
 */
import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Package, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { Skeleton } from "@/components/Skeleton";
import ReviewsSection from "@/features/tienda/ReviewsSection";
import { useProduct } from "@/hooks/ecommerce/useProduct";
import s from "../../tienda.module.css";

function ProductoContent() {
  const {
    product, reviews, isLoading, canReview, handleCreateReview, isCreatingReview,
    related, addToCart, cartCount, inCart, isOwner, isFavorite, toggleFavorite, userId,
  } = useProduct();
  const [qty, setQty] = useState(1);
  const router = useRouter();

  if (isLoading) {
    return (
      <ScreenContainer>
        <Skeleton height={260} borderRadius={16} />
        <Skeleton height={28} width="60%" />
        <Skeleton height={22} width="30%" />
        <Skeleton height={80} borderRadius={12} />
      </ScreenContainer>
    );
  }

  if (!product) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={<Package size={28} />}
          title="Este producto ya no está disponible"
          actionLabel="Volver a la tienda"
          onAction={() => router.push("/tienda")}
        />
      </ScreenContainer>
    );
  }

  const maxQty = Math.max(0, (product.stock ?? 0) - inCart);
  const stockLabel =
    product.stock <= 0
      ? "Agotado"
      : product.stock <= 5
        ? `¡Últimas ${product.stock} piezas!`
        : "Disponible";

  return (
    <ScreenContainer>
      <div className={s.detailTop}>
        <button type="button" className={s.iconBtn} onClick={() => router.push("/tienda")} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <div className={s.headerActions}>
          <button type="button" className={`${s.iconBtn} ${isFavorite ? s.favOn : ""}`} onClick={toggleFavorite} aria-label="Favorito">
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button type="button" className={s.iconBtn} onClick={() => router.push("/tienda/carrito")} aria-label="Abrir bolsa">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className={s.badge}>{cartCount > 99 ? "99+" : cartCount}</span>}
          </button>
        </div>
      </div>

      <div className={s.heroImgWrap}>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} width={480} height={360} className={s.heroImg} />
        ) : (
          <div className={`${s.cardImgFallback} ${s.heroImgFallback}`}><Package size={48} /></div>
        )}
      </div>

      <p className={s.cardMeta}>{product.category?.name || "Productos"}</p>
      <h1 className={s.productTitle}>{product.name}</h1>
      <div className={s.priceRow}>
        <p className={s.productPrice}>${product.price.toFixed(2)}</p>
        <Badge
          label={stockLabel}
          color={product.stock <= 0 ? "var(--color-error)" : product.stock <= 5 ? "var(--color-warning)" : "var(--color-success)"}
          size="sm"
        />
      </div>
      <p className={s.cardMeta}>
        {product.review_count > 0
          ? `${product.average_rating.toFixed(1)} · ${product.review_count} opiniones`
          : "Sin opiniones aún"}
      </p>

      <div className={s.benefits}>
        <span><Truck size={16} aria-hidden /> Envío gratis</span>
        <span><ShieldCheck size={16} aria-hidden /> Pago seguro con Stripe</span>
      </div>

      {product.description && (
        <section>
          <h2 className={s.sectionTitle}>Descripción</h2>
          <p className={s.descText}>{product.description}</p>
        </section>
      )}

      {product.specifications && (
        <section>
          <h2 className={s.sectionTitle}>Especificaciones</h2>
          <p className={s.descText}>{product.specifications}</p>
        </section>
      )}

      <ReviewsSection
        title="Opiniones"
        average={product.average_rating}
        count={product.review_count}
        reviews={reviews.map((r) => ({ ...r, author_name: "Compra verificada", is_mine: r.user_id === userId }))}
        canReview={canReview}
        submitting={isCreatingReview}
        onSubmit={(rating, comment) => handleCreateReview({ rating, comment: comment || undefined })}
        formPrompt="Ya lo compraste: ¿qué te pareció?"
      />

      {related.length > 0 && (
        <section>
          <h2 className={s.sectionTitle}>También te puede gustar</h2>
          <div className={s.grid}>
            {related.map((p) => (
              <Link key={p.id} href={`/tienda/producto/${p.id}`} className={s.card}>
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} width={200} height={140} className={s.cardImg} />
                ) : (
                  <div className={s.cardImgFallback}><Package size={24} /></div>
                )}
                <p className={s.cardName}>{p.name}</p>
                <p className={s.cardPrice}>${p.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className={s.footerBar}>
        <div className={s.stepper}>
          <button type="button" className={s.stepBtn} onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos">−</button>
          <span className={s.stepQty}>{qty}</span>
          <button type="button" className={s.stepBtn} onClick={() => setQty((q) => Math.min(Math.max(1, maxQty), q + 1))} aria-label="Más">+</button>
        </div>
        {product.stock <= 0 ? (
          <Button label="Agotado" disabled />
        ) : maxQty <= 0 ? (
          <Button label="Ya está todo en tu bolsa" variant="secondary" onPress={() => router.push("/tienda/carrito")} />
        ) : (
          <Button
            label={`Agregar · $${(product.price * qty).toFixed(2)}`}
            icon={<Plus size={18} />}
            onPress={() => {
              addToCart(product, qty);
              setQty(1);
            }}
          />
        )}
      </div>

      {isOwner && (
        <p className={s.cardMeta}>Este es tu producto. Gestiónalo desde tu panel de vendedor.</p>
      )}
    </ScreenContainer>
  );
}

export default function ProductoPage() {
  return (
    <Suspense fallback={null}>
      <ProductoContent />
    </Suspense>
  );
}
