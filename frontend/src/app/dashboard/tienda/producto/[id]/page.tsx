"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProduct, getReviews, createReview, Product, Review } from "@/lib/services/ecommerce";
import { getCurrentUser, User } from "@/lib/auth";
import { toast } from "react-hot-toast";
import { useCart } from "@/lib/contexts/CartContext";
import styles from "../../producto.module.css";
import dashStyles from "../../../dashboard.module.css";

export default function ProductoDetallePage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Review form state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        async function load() {
            if (!id) return;
            try {
                const [p, r, u] = await Promise.all([
                    getProduct(id as string),
                    getReviews(id as string),
                    getCurrentUser()
                ]);
                setProduct(p);
                setReviews(r);
                setCurrentUser(u);
            } catch (err) {
                console.error("Error loading product", err);
                toast.error("No pudimos cargar el producto");
                router.push("/dashboard/tienda");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSubmittingReview(true);
        try {
            const added = await createReview(id as string, newReview);
            setReviews([added, ...reviews]);
            setShowReviewModal(false);
            setNewReview({ rating: 5, comment: "" });
            toast.success("¡Gracias por tu reseña!");

            // Refresh product to get new rating average
            const updatedProduct = await getProduct(id as string);
            setProduct(updatedProduct);
        } catch (err) {
            toast.error("Error al publicar reseña");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className={dashStyles["loading-text"]}>Cargando michi-producto...</div>;
    if (!product) return null;

    const renderStars = (rating: number) => {
        return (
            <div className={styles["star-rating"]}>
                {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} style={{ opacity: s <= rating ? 1 : 0.2 }}>⭐</span>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Link href="/dashboard/tienda" className={styles["back-link"]}>
                ← Volver a la Tienda
            </Link>

            <div className={styles["product-layout"]}>
                {/* Visuals */}
                <div className={styles["gallery-section"]}>
                    <div className={styles["main-image"]} style={{
                        backgroundImage: product.image_url ? `url(${product.image_url})` : "none"
                    }}>
                        {!product.image_url && "🛍️"}
                    </div>
                </div>

                {/* Content */}
                <div className={styles["info-section"]}>
                    <div className={styles["badge-row"]}>
                        <span className={styles["category-badge"]}>{product.category}</span>
                        {product.stock <= 0 ? (
                            <span className={styles["stock-badge"]} style={{ color: "#ef4444" }}>🔴 Agotado</span>
                        ) : product.stock <= 5 ? (
                            <span className={styles["stock-badge"]} style={{ color: "#f59e0b" }}>🟠 ¡Últimas {product.stock} unidades!</span>
                        ) : (
                            <span className={styles["stock-badge"]} style={{ color: "#10b981" }}>🟢 Disponible</span>
                        )}
                    </div>

                    <h1 className={styles["product-title"]}>{product.name}</h1>

                    <div className={styles["rating-summary"]}>
                        {renderStars(Math.round(product.average_rating))}
                        <span>({product.review_count} reseñas)</span>
                    </div>

                    <div className={styles["price-tag"]}>
                        ${product.price.toFixed(2)} <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>MXN</span>
                    </div>

                    <div className={styles["description-box"]}>
                        <p>{product.description || "Este producto aún no cuenta con una descripción detallada, pero te aseguramos que a tu mascota le encantará."}</p>
                    </div>

                    {product.specifications && (
                        <div>
                            <h3 style={{ fontSize: "1rem", color: "#fff", marginBottom: "1rem" }}>Especificaciones Técnicas</h3>
                            <div className={styles["specifications-grid"]}>
                                {product.specifications.split(',').map((spec, i) => {
                                    const [label, value] = spec.split(':');
                                    return (
                                        <div key={i} className={styles["spec-item"]}>
                                            <span className={styles["spec-label"]}>{label?.trim() || "Dato"}</span>
                                            <span className={styles["spec-value"]}>{value?.trim() || spec}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className={styles["buy-card"]}>
                        <button
                            className="btn btn-primary"
                            style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
                            disabled={product.stock <= 0}
                            onClick={() => addToCart(product)}
                        >
                            {product.stock <= 0 ? "Producto Agotado" : "Añadir a la Bolsa 🛒"}
                        </button>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center", margin: 0 }}>
                            💳 Pago seguro y entregas garantizadas por Michicondrias.
                        </p>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className={styles["reviews-container"]}>
                <div className={styles["reviews-header"]}>
                    <h2 style={{ color: "#fff", margin: 0 }}>Michi-reseñas ⭐</h2>
                    {currentUser && (
                        <button className="btn btn-outline" onClick={() => setShowReviewModal(true)}>
                            Escribir Reseña
                        </button>
                    )}
                </div>

                <div style={{ marginTop: "2rem" }}>
                    {reviews.length === 0 ? (
                        <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)" }}>
                            Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
                        </p>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className={styles["review-card"]}>
                                <div className={styles["review-meta"]}>
                                    <span className={styles["review-user"]}>Usuario Michi</span>
                                    {renderStars(review.rating)}
                                </div>
                                <p className={styles["review-comment"]}>"{review.comment || "Sin comentarios, solo calificación."}"</p>
                                <div className={styles["review-date"]}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
                    <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "500px" }}>
                        <h2 style={{ color: "#fff", marginTop: 0 }}>¿Qué te pareció el producto?</h2>
                        <form onSubmit={handleAddReview} className={styles["review-form"]}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem" }}>Calificación</label>
                                <div className={styles["rating-input"]}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={styles["star-btn"]}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            style={{ filter: star <= newReview.rating ? "none" : "grayscale(1) opacity(0.3)" }}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem" }}>Comentario (opcional)</label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    value={newReview.comment}
                                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                    placeholder="Cuéntanos qué tal le pareció a tu michi..."
                                />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowReviewModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submittingReview}>
                                    {submittingReview ? "Publicando..." : "Publicar Reseña"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
