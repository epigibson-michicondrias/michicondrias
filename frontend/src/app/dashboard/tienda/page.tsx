"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, Product, createProduct } from "@/lib/services/ecommerce";
import { getCurrentUser, User, hasRole } from "@/lib/auth";
import dashStyles from "../dashboard.module.css";
import modStyles from "../modules.module.css";
import styles from "./tienda.module.css";
import { toast } from "react-hot-toast";
import { useCart } from "@/lib/contexts/CartContext";

export default function TiendaPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", stock: "10", category: "Alimentos", image_url: "" });

    // Check if user is a seller or admin natively
    const [isSeller, setIsSeller] = useState(false);

    // Cart Global State hook
    const { addToCart, cartCount, setIsCartOpen } = useCart();

    useEffect(() => {
        async function load() {
            try {
                const u = await getCurrentUser();
                setCurrentUser(u);

                setIsSeller(hasRole("vendedor") || hasRole("admin"));

                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Error al cargar productos de la tienda", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = products.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
        const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
        return matchesQuery && matchesCategory;
    });

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const added = await createProduct({
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock, 10),
                category: newProduct.category,
                image_url: newProduct.image_url,
                is_active: true,
                seller_id: currentUser?.id || null
            });
            setProducts([added, ...products]);
            setShowModal(false);
            setNewProduct({ name: "", description: "", price: "", stock: "10", category: "Alimentos", image_url: "" });
            toast.success("Producto publicado en el marketplace");
        } catch (error: any) {
            toast.error(error.message || "Error al publicar producto");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🛍️ Tienda y Marketplace</h1>
                <p className={dashStyles["page-subtitle"]}>
                    Encuentra los mejores productos, alimentos y accesorios para tu mascota.
                </p>
            </div>

            <div className={modStyles["module-page__toolbar"]}>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", flex: 1 }}>
                    <input
                        type="text"
                        placeholder="🔍 Buscar productos..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={styles["search-input"]}
                    />
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className={styles["filter-select"]}
                    >
                        <option value="all">Todas las Categorías</option>
                        <option value="Alimentos">Alimentos y Snacks</option>
                        <option value="Accesorios">Accesorios (Correas, Camas)</option>
                        <option value="Juguetes">Juguetes interactivos</option>
                        <option value="Salud">Higiene y Salud</option>
                    </select>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsCartOpen(true)}
                        style={{ position: "relative" }}
                    >
                        🛒 Bolsa
                        {cartCount > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                background: "#ef4444",
                                color: "white",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold"
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                    {isSeller && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            📦 Hub de Ventas
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <p className={dashStyles["loading-text"]}>Cargando catálogo...</p>
            ) : filtered.length === 0 ? (
                <div className={modStyles["empty-state"]}>
                    <span className={modStyles["empty-state__icon"]}>🛒</span>
                    <p className={modStyles["empty-state__text"]}>
                        No encontramos productos que coincidan con tu búsqueda.
                    </p>
                </div>
            ) : (
                <div className={styles["products-grid"]}>
                    {filtered.map(product => (
                        <div key={product.id} className={styles["product-card"]}>
                            <div className={styles["product-image"]} style={{
                                backgroundImage: product.image_url ? `url(${product.image_url})` : "none"
                            }}>
                                {!product.image_url && <span style={{ fontSize: "3rem" }}>🛍️</span>}
                                {product.stock <= 5 && product.stock > 0 && (
                                    <div className={styles["stock-warning"]}>¡Últimos {product.stock}!</div>
                                )}
                                {product.stock === 0 && (
                                    <div className={styles["stock-out"]}>Agotado</div>
                                )}
                            </div>
                            <div className={styles["product-details"]}>
                                <div className={styles["category-tag"]}>{product.category}</div>
                                <h2 className={styles["product-title"]}>{product.name}</h2>
                                <p className={styles["product-price"]}>${product.price.toFixed(2)} MXN</p>
                                <p className={styles["product-desc"]}>
                                    {product.description && product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description || "Sin descripción"}
                                </p>
                            </div>
                            <div className={styles["product-footer"]}>
                                <button
                                    className={`${styles["action-btn"]} ${product.stock === 0 ? styles["btn-disabled"] : styles["btn-solid"]}`}
                                    disabled={product.stock === 0}
                                    onClick={() => addToCart(product)}
                                >
                                    Añadir al Carrito
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Seller to Add Product */}
            {showModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
                    <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", padding: "2rem", width: "100%", maxWidth: "900px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.5rem", color: "#fff", margin: 0 }}>📦 Hub de Ventas - Nuevo Producto</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer" }}>&times;</button>
                        </div>

                        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                            {/* Left Side: Form */}
                            <form onSubmit={handleCreateProduct} style={{ flex: 1, minWidth: "300px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div className={dashStyles["form-section"]}>
                                    <h3 className={dashStyles["form-section-title"]}>Información Principal</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <div>
                                            <label>Nombre Comercial / Producto *</label>
                                            <input type="text" className="form-input" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ej. Croquetas Premium 5kg" />
                                        </div>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <div style={{ flex: 1 }}>
                                                <label>Categoría *</label>
                                                <select className="form-input" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                                    <option value="Alimentos">Alimentos y Snacks</option>
                                                    <option value="Accesorios">Accesorios (Correas, Camas)</option>
                                                    <option value="Juguetes">Juguetes interactivos</option>
                                                    <option value="Salud">Higiene y Salud</option>
                                                </select>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label>Precio (MXN) *</label>
                                                <div style={{ position: "relative" }}>
                                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>$</span>
                                                    <input type="number" step="0.01" className="form-input" style={{ paddingLeft: "1.5rem" }} required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={dashStyles["form-section"]}>
                                    <h3 className={dashStyles["form-section-title"]}>Inventario y Media</h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <div style={{ display: "flex", gap: "1rem" }}>
                                            <div style={{ flex: 1 }}>
                                                <label>Inventario (Stock) *</label>
                                                <input type="number" className="form-input" required value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                                            </div>
                                            <div style={{ flex: 2 }}>
                                                <label>URL de la Imagen (Opcional)</label>
                                                <input type="text" className="form-input" placeholder="https://..." value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label>Descripción del artículo</label>
                                            <textarea className="form-input" rows={3} value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Describe las ventajas, ingredientes o modo de uso del producto."></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                                    <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                                        {submitting ? "Publicando..." : "Mandar al Aparador →"}
                                    </button>
                                </div>
                            </form>

                            {/* Right Side: Live Preview */}
                            <div style={{ flex: 1, minWidth: "300px", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "1rem", alignSelf: "flex-start" }}>👀 Vista Previa</h3>

                                <div className={styles["product-card"]} style={{ width: "100%", maxWidth: "320px", pointerEvents: "none" }}>
                                    <div className={styles["product-image"]} style={{
                                        backgroundImage: newProduct.image_url ? `url(${newProduct.image_url})` : "none"
                                    }}>
                                        {!newProduct.image_url && <span style={{ fontSize: "3rem" }}>🛍️</span>}
                                        {parseInt(newProduct.stock) <= 5 && parseInt(newProduct.stock) > 0 && (
                                            <div className={styles["stock-warning"]}>¡Últimos {newProduct.stock}!</div>
                                        )}
                                        {parseInt(newProduct.stock) === 0 && (
                                            <div className={styles["stock-out"]}>Agotado</div>
                                        )}
                                    </div>
                                    <div className={styles["product-details"]}>
                                        <div className={styles["category-tag"]}>{newProduct.category || "Categoría"}</div>
                                        <h2 className={styles["product-title"]}>{newProduct.name || "Nombre del Producto"}</h2>
                                        <p className={styles["product-price"]}>${parseFloat(newProduct.price || "0").toFixed(2)} MXN</p>
                                        <p className={styles["product-desc"]}>
                                            {newProduct.description && newProduct.description.length > 80 ? newProduct.description.substring(0, 80) + '...' : newProduct.description || "Sin descripción"}
                                        </p>
                                    </div>
                                    <div className={styles["product-footer"]}>
                                        <button className={`${styles["action-btn"]} ${parseInt(newProduct.stock) === 0 ? styles["btn-disabled"] : styles["btn-solid"]}`}>
                                            Añadir al Carrito
                                        </button>
                                    </div>
                                </div>
                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "1.5rem", textAlign: "center" }}>
                                    Así es como los consumidores verán tu producto en el mostrador digital del Marketplace.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
