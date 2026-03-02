"use client";

import { useEffect } from "react";
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

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/login");
        }
    }, [router]);

    return (
        <NotificationProvider>
            <CartProvider>
                <div className={styles["dashboard-layout"]}>
                    <Sidebar />
                    <main className={styles["dashboard-main"]}>
                        <div className={styles["topbar"]}>
                            <div /> {/* Spacer */}
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
