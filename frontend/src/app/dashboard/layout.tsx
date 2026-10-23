"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/legacy/auth";
import Sidebar from "@/components/Sidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import styles from "./dashboard.module.css";
import { CartProvider } from "@/lib/contexts/CartContext";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";
import CartDrawer from "@/components/tienda/CartDrawer";
import MichiExplorer from "@/components/MichiExplorer";

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
                            <MichiExplorer />
                            <NotificationBell />
                        </div>
                        <Suspense fallback={null}>{children}</Suspense>
                        <CartDrawer />
                    </main>
                </div>
            </CartProvider>
        </NotificationProvider>
    );
}
