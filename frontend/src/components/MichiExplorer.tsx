"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserPets, Pet } from "@/lib/services/mascotas";
import { getClinics, Clinic } from "@/lib/services/directorio";
import { getProducts, Product } from "@/lib/services/ecommerce";
import { getCurrentUser } from "@/lib/auth";
import styles from "@/app/dashboard/dashboard.module.css";

export default function MichiExplorer() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{
        pets: Pet[];
        clinics: Clinic[];
        products: Product[];
    }>({ pets: [], clinics: [], products: [] });
    const [data, setData] = useState<{
        pets: Pet[];
        clinics: Clinic[];
        products: Product[];
    }>({ pets: [], clinics: [], products: [] });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch initial data only when modal opens for the first time
    useEffect(() => {
        if (!isOpen) return;

        // Prevent refetching if we already have data
        if (data.pets.length > 0 || data.clinics.length > 0 || data.products.length > 0) return;

        async function loadData() {
            try {
                const user = await getCurrentUser();
                const [pets, clinics, products] = await Promise.all([
                    user ? getUserPets(user.id) : Promise.resolve([]),
                    getClinics(),
                    getProducts()
                ]);
                setData({ pets, clinics, products });
            } catch (error) {
                console.error("Error loading search data:", error);
            }
        }
        loadData();
    }, [isOpen, data]);

    // Handle shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Search logic (local filtering)
    useEffect(() => {
        if (!query.trim()) {
            setResults({ pets: [], clinics: [], products: [] });
            return;
        }

        const q = query.toLowerCase();
        const filteredPets = data.pets.filter(p => p.name.toLowerCase().includes(q) || p.species.toLowerCase().includes(q)).slice(0, 3);
        const filteredClinics = data.clinics.filter(c => c.name.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q)).slice(0, 3);
        const filteredProducts = data.products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3);

        setResults({ pets: filteredPets, clinics: filteredClinics, products: filteredProducts });
    }, [query, data]);

    const flatResults = [
        ...results.pets.map(p => ({ ...p, type: 'pet', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172a4 4 0 0 0-5.656 5.656l1.414 1.414L12 18.414l6.242-6.172 1.414-1.414a4 4 0 0 0-5.656-5.656l-1.414 1.414L12 7.586l-1.414-1.414z" /><circle cx="9" cy="9" r="1" /><circle cx="15" cy="9" r="1" /></svg>, href: `/dashboard/mascotas/${p.id}` })),
        ...results.clinics.map(c => ({ ...c, type: 'clinic', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>, href: `/dashboard/directorio/clinica/${c.id}` })),
        ...results.products.map(p => ({ ...p, type: 'product', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>, href: `/dashboard/tienda/producto/${p.id}` }))
    ];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex(prev => (prev + 1) % Math.max(flatResults.length, 1));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(prev => (prev - 1 + flatResults.length) % Math.max(flatResults.length, 1));
        } else if (e.key === "Enter" && flatResults[selectedIndex]) {
            router.push(flatResults[selectedIndex].href);
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* Search Trigger in Topbar */}
            <div className={styles["search-trigger"]} onClick={() => setIsOpen(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <span>Michi-Explorer...</span>
                <span className={styles["search-shortcut"]}>Ctrl K</span>
            </div>

            {/* Explorer Modal */}
            {isOpen && (
                <div className={styles["explorer-overlay"]} onClick={() => setIsOpen(false)}>
                    <div className={styles["explorer-content"]} onClick={e => e.stopPropagation()}>
                        <div className={styles["explorer-header"]}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary-light)" }}>
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                className={styles["explorer-input"]}
                                placeholder="Busca mascotas, clínicas, productos..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <div className={styles["explorer-results"]}>
                            {!query && (
                                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                                    <div style={{ marginBottom: "1rem", opacity: 0.5 }}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                    </div>
                                    <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem", fontWeight: 700, color: "var(--text-secondary)" }}>Michi-Explorer Listo</p>
                                    <p style={{ fontSize: "0.9rem" }}>Escribe para buscar instantáneamente en todo el ecosistema</p>
                                </div>
                            )}

                            {query && flatResults.length === 0 && (
                                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                                    <div style={{ marginBottom: "1rem", opacity: 0.5 }}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172a4 4 0 0 0-5.656 5.656l1.414 1.414L12 18.414l6.242-6.172 1.414-1.414a4 4 0 0 0-5.656-5.656l-1.414 1.414L12 7.586l-1.414-1.414z" /><line x1="2" y1="2" x2="22" y2="22" /></svg>
                                    </div>
                                    <p style={{ fontSize: "1.1rem" }}>No encontramos resultados para <strong style={{ color: "var(--text-primary)" }}>"{query}"</strong></p>
                                </div>
                            )}

                            {results.pets.length > 0 && (
                                <>
                                    <div className={styles["explorer-section-label"]}>Mascotas</div>
                                    {results.pets.map((pet, i) => {
                                        const idx = i;
                                        return (
                                            <Link
                                                key={pet.id}
                                                href={`/dashboard/mascotas/${pet.id}`}
                                                className={`${styles["explorer-item"]} ${selectedIndex === idx ? styles["explorer-item--active"] : ""}`}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <div className={styles["explorer-item-icon"]}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172a4 4 0 0 0-5.656 5.656l1.414 1.414L12 18.414l6.242-6.172 1.414-1.414a4 4 0 0 0-5.656-5.656l-1.414 1.414L12 7.586l-1.414-1.414z" /></svg>
                                                </div>
                                                <div className={styles["explorer-item-info"]}>
                                                    <span className={styles["explorer-item-name"]}>{pet.name}</span>
                                                    <span className={styles["explorer-item-desc"]}>{pet.species} • {pet.breed || "Raza única"}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </>
                            )}

                            {results.clinics.length > 0 && (
                                <>
                                    <div className={styles["explorer-section-label"]}>Clínicas</div>
                                    {results.clinics.map((clinic, i) => {
                                        const idx = results.pets.length + i;
                                        return (
                                            <Link
                                                key={clinic.id}
                                                href={`/dashboard/directorio/clinica/${clinic.id}`}
                                                className={`${styles["explorer-item"]} ${selectedIndex === idx ? styles["explorer-item--active"] : ""}`}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <div className={styles["explorer-item-icon"]}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                                </div>
                                                <div className={styles["explorer-item-info"]}>
                                                    <span className={styles["explorer-item-name"]}>{clinic.name}</span>
                                                    <span className={styles["explorer-item-desc"]}>{clinic.city || "Ubicación reservada"}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </>
                            )}

                            {results.products.length > 0 && (
                                <>
                                    <div className={styles["explorer-section-label"]}>Productos</div>
                                    {results.products.map((product, i) => {
                                        const idx = results.pets.length + results.clinics.length + i;
                                        return (
                                            <Link
                                                key={product.id}
                                                href={`/dashboard/tienda/producto/${product.id}`}
                                                className={`${styles["explorer-item"]} ${selectedIndex === idx ? styles["explorer-item--active"] : ""}`}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <div className={styles["explorer-item-icon"]}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                                                </div>
                                                <div className={styles["explorer-item-info"]}>
                                                    <span className={styles["explorer-item-name"]}>{product.name}</span>
                                                    <span className={styles["explorer-item-desc"]}>${product.price} MXN</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        <div className={styles["explorer-footer"]}>
                            <span><kbd>↵</kbd> para abrir</span>
                            <span><kbd>↑↓</kbd> para navegar</span>
                            <span><kbd>esc</kbd> para cerrar</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
