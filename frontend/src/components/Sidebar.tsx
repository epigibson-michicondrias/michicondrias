"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, getUserRole, getCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserPets } from "@/lib/services/mascotas";
import styles from "./Sidebar.module.css";

interface MenuItem {
    href: string;
    icon: React.ReactNode;
    label: string;
    roles: string[];
}

const menuItems: MenuItem[] = [
    { href: "/dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>, label: "Inicio", roles: ["all"] },
    { href: "/dashboard/mascotas", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172a4 4 0 0 0-5.656 5.656l1.414 1.414M14 5.172a4 4 0 0 1 5.656 5.656l-1.414 1.414M12 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path d="M7 16h10l-1.5 5h-7L7 16Z" /></svg>, label: "Mis Mascotas", roles: ["all"] },
    { href: "/dashboard/adopciones", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 2-1.99 2-1.99a8.1 8.1 0 0 1 0 4.13c1.08.77 2 2.11 2 3.6 0 3-1.61 5.5-4 6.5l-1 2-1-2c-2.39-1-4-3.5-4-6.5 0-1.49.92-2.83 2-3.6a8.1 8.1 0 0 1 0-4.13s.22-.01 2 1.99c.65-.17 1.33-.26 2-.26Z" /><circle cx="12" cy="10" r="1" /></svg>, label: "Adopciones", roles: ["all"] },
    { href: "/dashboard/adopciones/mis-solicitudes", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>, label: "Mis Solicitudes", roles: ["all"] },
    { href: "/dashboard/directorio", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4" /><path d="m3.34 19 1.4-1.4" /><path d="M5.8 11.5 11 16.7" /><path d="M2 13.5V11a2 2 0 0 1 2-2h1.5a2 2 0 0 1 2 2v1" /><path d="M21 15V13a2 2 0 0 0-2-2h-3" /><path d="M17.5 15H15" /><path d="M15 15a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2Z" /><path d="M9 15h3.5" /><path d="M18.14 7.14A2 2 0 1 1 21 10l-9 9-5 1 1-5 9-9Z" /></svg>, label: "Directorio", roles: ["all"] },
    { href: "/dashboard/directorio/citas", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="m9 16 2 2 4-4" /></svg>, label: "Mis Citas", roles: ["all"] },
    { href: "/dashboard/carnet", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>, label: "Carnet Clínico", roles: ["all"] },
    { href: "/dashboard/tienda", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>, label: "Tienda", roles: ["all"] },
    { href: "/dashboard/tienda/compras", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>, label: "Mis Compras", roles: ["all"] },
    { href: "/dashboard/donaciones", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>, label: "Donaciones", roles: ["all"] },
    { href: "/dashboard/perdidas", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>, label: "Perdidas", roles: ["all"] },
    { href: "/dashboard/petfriendly", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>, label: "Petfriendly", roles: ["all"] },
    { href: "/dashboard/paseadores", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4v16" /><path d="M17 4v16" /><path d="M19 4H11a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" /><path d="M5 14h4" /><circle cx="5" cy="10" r="2" /></svg>, label: "Paseadores", roles: ["all"] },
    { href: "/dashboard/cuidadores", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /><path d="M12 7v0" /></svg>, label: "Cuidadores", roles: ["all"] },
    { href: "/dashboard/perfil", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, label: "Mi Cuenta", roles: ["all"] },
    { href: "/dashboard/admin/verificaciones", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>, label: "Revisión KYC", roles: ["admin"] },
    { href: "/dashboard/admin/moderacion", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9l-1.2-2.5a.5.5 0 0 0-.4-.5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16Z" /><path d="m9 13 6-6" /><path d="m9 7 6 6" /></svg>, label: "Moderación", roles: ["admin"] },
    { href: "/dashboard/admin/analytics", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>, label: "Analíticas", roles: ["admin"] },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [role, setRole] = useState<string>("user"); // Default to user for SSR
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setRole(getUserRole());
        setMounted(true);
    }, []);

    const visibleItems = menuItems.filter(
        (item) =>
            item.roles.includes("all") ||
            item.roles.includes(role) ||
            role === "admin"
    );

    // Prevent hydration error by rendering a skeleton or null during SSR
    if (!mounted) return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebar__brand}>
                <Link href="/">
                    <div className={styles.sidebar__logo_box}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 2-1.99 2-1.99a8.1 8.1 0 0 1 0 4.13c1.08.77 2 2.11 2 3.6 0 3-1.61 5.5-4 6.5l-1 2-1-2c-2.39-1-4-3.5-4-6.5 0-1.49.92-2.83 2-3.6a8.1 8.1 0 0 1 0-4.13s.22-.01 2 1.99c.65-.17 1.33-.26 2-.26Z" />
                        </svg>
                    </div>
                    <span className={`${styles.sidebar__name} gradient-text`}>
                        Michicondrias
                    </span>
                </Link>
            </div>
            <div className={styles.sidebar__nav}>
            </div>
        </aside>
    );

    return (
        <>
            <div
                className={`${styles.backdrop} ${isOpen ? styles.open : ""}`}
                onClick={onClose}
            />
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
                <div className={styles.sidebar__brand}>
                    <Link href="/" onClick={onClose}>
                        <div className={styles.sidebar__logo_box}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 2-1.99 2-1.99a8.1 8.1 0 0 1 0 4.13c1.08.77 2 2.11 2 3.6 0 3-1.61 5.5-4 6.5l-1 2-1-2c-2.39-1-4-3.5-4-6.5 0-1.49.92-2.83 2-3.6a8.1 8.1 0 0 1 0-4.13s.22-.01 2 1.99c.65-.17 1.33-.26 2-.26Z" />
                            </svg>
                        </div>
                        <span className={`${styles.sidebar__name} gradient-text`}>
                            Michicondrias
                        </span>
                    </Link>
                    <button className={styles.sidebar__close_btn} onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className={styles.sidebar__role}>
                    <div className={styles.sidebar__role_card}>
                        <span className={styles.sidebar__role_icon}>
                            {role === "admin" ? "🛡️" : role === "veterinario" ? "🩺" : "👤"}
                        </span>
                        <div className={styles.sidebar__role_info}>
                            <p className={styles.sidebar__role_label}>Estatus de Perfil</p>
                            <span className={styles.sidebar__role_name}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                <nav className={styles.sidebar__nav}>
                    {visibleItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            onMouseEnter={async () => {
                                // Prefetching data based on destination
                                if (item.href === "/dashboard/mascotas") {
                                    const user = await queryClient.ensureQueryData({
                                        queryKey: ["current-user"],
                                        queryFn: () => import("@/lib/auth").then(m => m.getCurrentUser())
                                    });
                                    if (user?.id) {
                                        queryClient.prefetchQuery({
                                            queryKey: ["user-pets", user.id],
                                            queryFn: () => import("@/lib/services/mascotas").then(m => m.getUserPets(user.id))
                                        });
                                    }
                                } else if (item.href === "/dashboard/petfriendly") {
                                    queryClient.prefetchQuery({
                                        queryKey: ["petfriendly-places", ""],
                                        queryFn: () => import("@/lib/services/mascotas").then(m => m.getPlaces())
                                    });
                                }
                            }}
                            className={`${styles.sidebar__link} ${item.href === "/dashboard"
                                ? pathname === "/dashboard" ? styles["sidebar__link--active"] : ""
                                : pathname.startsWith(item.href) ? styles["sidebar__link--active"] : ""
                                }`}
                        >
                            <span className={styles.sidebar__icon}>{item.icon}</span>
                            <span className={styles.sidebar__label}>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebar__footer}>
                    <button onClick={() => { logout(); onClose && onClose(); }} className={styles.sidebar__logout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
