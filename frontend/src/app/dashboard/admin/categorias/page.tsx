"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import dashStyles from "../../dashboard.module.css";
import styles from "./categorias.module.css";
import {
    Category,
    Subcategory,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory
} from "@/lib/services/categories";

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Expand category to show subcategories
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // --- CATEGORY MODAL STATE ---
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [catFormData, setCatFormData] = useState({ name: "", description: "", image_url: "", is_active: true });

    // --- SUBCATEGORY MODAL STATE ---
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
    const [activeParentCategoryId, setActiveParentCategoryId] = useState<string | null>(null);
    const [subFormData, setSubFormData] = useState({ name: "", description: "", is_active: true });

    const [formLoading, setFormLoading] = useState(false);

    // --- CONFIRM MODAL ---
    const [deleteModalState, setDeleteModalState] = useState<{
        isOpen: boolean; title: string; message: string; targetId: string | null; type: 'category' | 'subcategory' | null;
    }>({ isOpen: false, title: "", message: "", targetId: null, type: null });


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err: any) {
            toast.error(err.message || "Error al cargar categorías");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    // --- CATEGORY HANDLERS ---
    const openCatModal = (cat: Category | null = null) => {
        if (cat) {
            setEditingCategory(cat);
            setCatFormData({ name: cat.name, description: cat.description || "", image_url: cat.image_url || "", is_active: cat.is_active });
        } else {
            setEditingCategory(null);
            setCatFormData({ name: "", description: "", image_url: "", is_active: true });
        }
        setIsCatModalOpen(true);
    };

    const handleCategorySubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingCategory) {
                const updated = await updateCategory(editingCategory.id, catFormData);
                setCategories(categories.map(c => c.id === updated.id ? { ...updated, subcategories: c.subcategories } : c));
                toast.success("Categoría actualizada");
            } else {
                const created = await createCategory(catFormData);
                setCategories([...categories, { ...created, subcategories: [] }]);
                toast.success("Categoría registrada");
            }
            setIsCatModalOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Error al guardar categoría");
        } finally {
            setFormLoading(false);
        }
    };


    // --- SUBCATEGORY HANDLERS ---
    const openSubModal = (categoryId: string, sub: Subcategory | null = null) => {
        setActiveParentCategoryId(categoryId);
        if (sub) {
            setEditingSubcategory(sub);
            setSubFormData({ name: sub.name, description: sub.description || "", is_active: sub.is_active });
        } else {
            setEditingSubcategory(null);
            setSubFormData({ name: "", description: "", is_active: true });
        }
        setIsSubModalOpen(true);
    };

    const handleSubcategorySubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        if (!activeParentCategoryId) return;

        try {
            if (editingSubcategory) {
                const updated = await updateSubcategory(editingSubcategory.id, subFormData);
                setCategories(categories.map(c => c.id === activeParentCategoryId
                    ? { ...c, subcategories: c.subcategories.map(s => s.id === updated.id ? updated : s) }
                    : c));
                toast.success("Subcategoría actualizada");
            } else {
                const payload = { ...subFormData, category_id: activeParentCategoryId };
                const created = await createSubcategory(payload);
                setCategories(categories.map(c => c.id === activeParentCategoryId
                    ? { ...c, subcategories: [...c.subcategories, created] }
                    : c));
                toast.success("Subcategoría registrada");
                setExpandedCategory(activeParentCategoryId); // auto expand
            }
            setIsSubModalOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Error al guardar subcategoría");
        } finally {
            setFormLoading(false);
        }
    };


    // --- DELETE HANDLERS ---
    const confirmDelete = (type: 'category' | 'subcategory', item: any) => {
        if (type === 'category') {
            setDeleteModalState({
                isOpen: true, type, targetId: item.id,
                title: `🗑️ Eliminar Categoría`,
                message: `¿Eliminar la categoría "${item.name}"? ADVERTENCIA: Se eliminarán todas sus subcategorías irrevocablemente.`
            });
        } else {
            setDeleteModalState({
                isOpen: true, type, targetId: item.id,
                title: `🗑️ Eliminar Subcategoría`,
                message: `¿Eliminar la subcategoría "${item.name}"?`
            });
        }
    };

    const executeDelete = async () => {
        const { targetId, type } = deleteModalState;
        if (!targetId || !type) return;
        setDeleteModalState(prev => ({ ...prev, isOpen: false }));

        try {
            if (type === 'category') {
                await deleteCategory(targetId);
                setCategories(categories.filter(c => c.id !== targetId));
                if (expandedCategory === targetId) setExpandedCategory(null);
                toast.success("Categoría eliminada");
            } else {
                await deleteSubcategory(targetId);
                // We need to find which category this sub belonged to and remove it from local state
                setCategories(categories.map(c => ({
                    ...c,
                    subcategories: c.subcategories.filter(s => s.id !== targetId)
                })));
                toast.success("Subcategoría eliminada");
            }
        } catch (err: any) {
            toast.error(err.message || "Error al eliminar");
        }
    };

    // --- MODAL UIs ---
    const CategoryModal = () => (
        isCatModalOpen && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "500px" }}>
                    <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                        <h3 style={{ margin: 0 }}>{editingCategory ? "✏️ Editar Categoría" : "🏷️ Nueva Categoría"}</h3>
                    </div>
                    <form onSubmit={handleCategorySubmit} style={{ padding: "1.5rem" }}>
                        <div className={styles["form-group"]}>
                            <label>Nombre *</label>
                            <input required type="text" value={catFormData.name} onChange={e => setCatFormData({ ...catFormData, name: e.target.value })} disabled={formLoading} placeholder="Ej. Alimentos" />
                        </div>
                        <div className={styles["form-group"]}>
                            <label>Descripción</label>
                            <textarea rows={2} value={catFormData.description} onChange={e => setCatFormData({ ...catFormData, description: e.target.value })} disabled={formLoading} />
                        </div>
                        <div className={styles["form-group"]}>
                            <label>URL de Imagen (Opcional)</label>
                            <input type="text" value={catFormData.image_url} onChange={e => setCatFormData({ ...catFormData, image_url: e.target.value })} disabled={formLoading} placeholder="https://..." />
                        </div>
                        <div className={styles["form-group"]}>
                            <label className={styles["checkbox-label"]}>
                                <input type="checkbox" checked={catFormData.is_active} onChange={e => setCatFormData({ ...catFormData, is_active: e.target.checked })} disabled={formLoading} style={{ width: 'auto' }} />
                                Categoría Activa (Visible en tienda)
                            </label>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsCatModalOpen(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? "Guardando..." : "Guardar"}</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );

    const SubcategoryModal = () => (
        isSubModalOpen && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "500px" }}>
                    <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}>
                        <h3 style={{ margin: 0 }}>{editingSubcategory ? "✏️ Editar Subcategoría" : "📂 Nueva Subcategoría"}</h3>
                    </div>
                    <form onSubmit={handleSubcategorySubmit} style={{ padding: "1.5rem" }}>
                        <div className={styles["form-group"]}>
                            <label>Nombre *</label>
                            <input required type="text" value={subFormData.name} onChange={e => setSubFormData({ ...subFormData, name: e.target.value })} disabled={formLoading} placeholder="Ej. Perros Adultos" />
                        </div>
                        <div className={styles["form-group"]}>
                            <label>Descripción</label>
                            <textarea rows={2} value={subFormData.description} onChange={e => setSubFormData({ ...subFormData, description: e.target.value })} disabled={formLoading} />
                        </div>
                        <div className={styles["form-group"]}>
                            <label className={styles["checkbox-label"]}>
                                <input type="checkbox" checked={subFormData.is_active} onChange={e => setSubFormData({ ...subFormData, is_active: e.target.checked })} disabled={formLoading} style={{ width: 'auto' }} />
                                Subcategoría Activa
                            </label>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsSubModalOpen(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={formLoading}>{formLoading ? "Guardando..." : "Guardar"}</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );


    return (
        <div className={styles["admin-container"]}>
            <ConfirmModal
                isOpen={deleteModalState.isOpen} title={deleteModalState.title} message={deleteModalState.message}
                isDanger={true} onConfirm={executeDelete} onCancel={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
            />
            <CategoryModal />
            <SubcategoryModal />

            <div className={dashStyles["page-header"]}>
                <h1 className={dashStyles["page-title"]}>🏷️ Árbol de Categorías</h1>
                <p className={dashStyles["page-subtitle"]}>Gestiona la taxonomía de productos del Ecommerce</p>
            </div>

            <div className={styles["categories-container"]}>
                <div className={styles["categories-header"]}>
                    <h2>Catálogo Principal</h2>
                    <button className="btn btn-primary" onClick={() => openCatModal()} style={{ background: "var(--primary)" }}>
                        + Nueva Categoría
                    </button>
                </div>

                {loading ? (
                    <p className={dashStyles["loading-text"]} style={{ padding: "3rem" }}>Cargando catálogo...</p>
                ) : categories.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-secondary)" }}>
                        <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>👻</span>
                        <p>No hay categorías registradas. Comienza agregando la primera.</p>
                    </div>
                ) : (
                    <div className={styles["category-list"]}>
                        {categories.map(category => (
                            <div key={category.id} className={`${styles["category-card"]} ${!category.is_active ? styles.inactive : ''}`}>
                                {/* Category Header (Clickable for expanding) */}
                                <div className={styles["category-card-header"]} onClick={(e) => { e.stopPropagation(); toggleExpand(category.id); }}>
                                    <div className={styles["category-info"]}>
                                        <div className={styles["category-icon"]}>
                                            {category.image_url ? <img src={category.image_url} alt={category.name} /> : "📦"}
                                        </div>
                                        <div className={styles["category-title"]}>
                                            <h3>
                                                {category.name}
                                                <span className={`${styles.badge} ${category.is_active ? styles['badge-active'] : styles['badge-inactive']}`}>
                                                    {category.is_active ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </h3>
                                            <p>{category.description || "Sin descripción"} • {category.subcategories.length} sub-ramas</p>
                                        </div>
                                    </div>
                                    <div className={styles.actions} onClick={e => e.stopPropagation()}>
                                        <button className={`${styles["action-btn"]} ${styles["edit-btn"]}`} onClick={() => openCatModal(category)}>✏️ Editar</button>
                                        <button className={`${styles["action-btn"]} ${styles["delete-btn"]}`} onClick={() => confirmDelete('category', category)}>🗑️</button>
                                        <span style={{ marginLeft: "1rem", color: "var(--text-secondary)" }}>
                                            {expandedCategory === category.id ? "▲" : "▼"}
                                        </span>
                                    </div>
                                </div>

                                {/* Subcategories Panel */}
                                {expandedCategory === category.id && (
                                    <div className={styles["subcategories-panel"]}>
                                        <div className={styles["subcategories-header"]}>
                                            <h4>Subcategorías de {category.name}</h4>
                                            <button className="btn btn-secondary" style={{ fontSize: "0.85rem", padding: "0.3rem 0.6rem" }} onClick={() => openSubModal(category.id)}>
                                                +  Subcategoría
                                            </button>
                                        </div>

                                        {category.subcategories.length === 0 ? (
                                            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0, fontStyle: "italic" }}>
                                                No hay subcategorías en esta rama.
                                            </p>
                                        ) : (
                                            <div className={styles["subcategory-grid"]}>
                                                {category.subcategories.map(sub => (
                                                    <div key={sub.id} className={`${styles["subcategory-card"]} ${!sub.is_active ? styles.inactive : ''}`}>
                                                        <div className={styles["subcategory-info"]}>
                                                            <h5>
                                                                {sub.name}
                                                                {!sub.is_active && <span className={`${styles.badge} ${styles['badge-inactive']}`} style={{ fontSize: '0.6rem' }}>OFF</span>}
                                                            </h5>
                                                            <p>{sub.description}</p>
                                                        </div>
                                                        <div className={styles["subcategory-actions"]}>
                                                            <button className="btn btn-secondary" style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem", border: "none" }} onClick={() => openSubModal(category.id, sub)}>✏️</button>
                                                            <button className="btn btn-secondary" style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem", color: "var(--error)", border: "none" }} onClick={() => confirmDelete('subcategory', sub)}>🗑️</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
