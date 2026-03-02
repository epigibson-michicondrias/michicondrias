"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/contexts/NotificationContext";
import styles from "./NotificationBell.module.css";

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getTimeAgo = (d: Date) => {
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Ahora";
        if (mins < 60) return `Hace ${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `Hace ${hours}h`;
        return `Hace ${Math.floor(hours / 24)}d`;
    };

    return (
        <div className={styles.wrapper} ref={panelRef}>
            <button className={styles.bell} onClick={() => setIsOpen(!isOpen)} aria-label="Notificaciones">
                🔔
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    <div className={styles["panel-header"]}>
                        <h3>Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button className={styles["mark-all"]} onClick={markAllAsRead}>
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    <div className={styles["panel-body"]}>
                        {notifications.length === 0 ? (
                            <p className={styles.empty}>Sin notificaciones 🎉</p>
                        ) : (
                            notifications.slice(0, 10).map(notif => (
                                <div
                                    key={notif.id}
                                    className={`${styles.item} ${!notif.read ? styles.unread : ""}`}
                                    onClick={() => { markAsRead(notif.id); if (notif.href) setIsOpen(false); }}
                                >
                                    {notif.href ? (
                                        <Link href={notif.href} className={styles["item-link"]}>
                                            <span className={styles["item-icon"]}>{notif.icon}</span>
                                            <div className={styles["item-content"]}>
                                                <strong>{notif.title}</strong>
                                                <p>{notif.message}</p>
                                                <span className={styles["item-time"]}>{getTimeAgo(notif.time)}</span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className={styles["item-link"]}>
                                            <span className={styles["item-icon"]}>{notif.icon}</span>
                                            <div className={styles["item-content"]}>
                                                <strong>{notif.title}</strong>
                                                <p>{notif.message}</p>
                                                <span className={styles["item-time"]}>{getTimeAgo(notif.time)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
