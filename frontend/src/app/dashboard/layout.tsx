"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import styles from "./dashboard.module.css";
import { CartProvider } from "@/lib/contexts/CartContext";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";
import CartDrawer from "@/components/tienda/CartDrawer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
        }
    }, [router]);

    return (
        <NotificationProvider>
            <CartProvider>
                <div className={styles["dashboard-layout"]}>
                    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                    <main className={styles["dashboard-main"]}>
                        <div className={styles["topbar"]}>
                            <button
                                className={styles["hamburger-btn"]}
                                onClick={() => setIsSidebarOpen(true)}
                                aria-label="Abrir Menú"
                            >
                                ☰
                            </button>
                            <NotificationBell />
                        </div>
                        {children}
                        <CartDrawer />
                    </main>
                </div>
            </CartProvider>
        </NotificationProvider>
    );
}
