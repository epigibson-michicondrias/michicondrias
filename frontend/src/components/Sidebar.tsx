"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, getUserRole } from "@/lib/auth";
import { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";

interface MenuItem {
    href: string;
    icon: string;
    label: string;
    roles: string[]; // which roles can see this item ("all" = everyone)
}

const menuItems: MenuItem[] = [
    { href: "/dashboard", icon: "🏠", label: "Inicio", roles: ["all"] },
    { href: "/dashboard/mascotas", icon: "🐕", label: "Mis Mascotas", roles: ["all"] },
    { href: "/dashboard/adopciones", icon: "🐾", label: "Adopciones", roles: ["all"] },
    { href: "/dashboard/adopciones/mis-solicitudes", icon: "📄", label: "Mis Solicitudes", roles: ["all"] },
    { href: "/dashboard/directorio", icon: "🩺", label: "Directorio", roles: ["all"] },
    { href: "/dashboard/carnet", icon: "📋", label: "Carnet Clínico", roles: ["all"] },
    { href: "/dashboard/tienda", icon: "🛒", label: "Tienda", roles: ["all"] },
    { href: "/dashboard/tienda/compras", icon: "🛍️", label: "Mis Compras", roles: ["all"] },
    { href: "/dashboard/donaciones", icon: "💛", label: "Donaciones", roles: ["all"] },
    { href: "/dashboard/perdidas", icon: "🔍", label: "Perdidas", roles: ["all"] },
    { href: "/dashboard/petfriendly", icon: "📍", label: "Petfriendly", roles: ["all"] },
    { href: "/dashboard/perfil", icon: "⚙️", label: "Mi Cuenta", roles: ["all"] },
    { href: "/dashboard/admin/verificaciones", icon: "🕵️", label: "Revisión KYC", roles: ["admin"] },
    { href: "/dashboard/admin/moderacion", icon: "🛡️", label: "Moderación", roles: ["admin"] },
    { href: "/dashboard/admin/analytics", icon: "📊", label: "Analíticas", roles: ["admin"] },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
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
                    <span className={styles.sidebar__logo}>🐱</span>
                    <span className={`${styles.sidebar__name} gradient-text`}>
                        Michicondrias
                    </span>
                </Link>
            </div>
            <div className={styles.sidebar__nav}>
                {/* Skeleton/Placeholder structure */}
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
                        <span className={styles.sidebar__logo}>🐱</span>
                        <span className={`${styles.sidebar__name} gradient-text`}>
                            Michicondrias
                        </span>
                    </Link>
                    <button className={styles.sidebar__close_btn} onClick={onClose}>✕</button>
                </div>

                {/* Role badge */}
                <div className={styles.sidebar__role}>
                    <span className={styles.sidebar__role_badge}>
                        {role === "admin" ? "🛡️" : role === "veterinario" ? "🩺" : "👤"}{" "}
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                </div>

                <nav className={styles.sidebar__nav}>
                    {visibleItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`${styles.sidebar__link} ${item.href === "/dashboard"
                                ? pathname === "/dashboard" ? styles["sidebar__link--active"] : ""
                                : pathname.startsWith(item.href) ? styles["sidebar__link--active"] : ""
                                }`}
                        >
                            <span className={styles.sidebar__icon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebar__footer}>
                    <button onClick={() => { logout(); onClose && onClose(); }} className={styles.sidebar__logout}>
                        🚪 Cerrar sesión
                    </button>
                </div>
            </aside>
        </>
    );
}
