"use client";

import { useEffect, useState } from "react";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    requireInput?: boolean;
    inputPlaceholder?: string;
    onConfirm: (inputValue?: string) => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDanger = false,
    requireInput = false,
    inputPlaceholder = "Escribe aquí...",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (isOpen) {
            setInputValue(""); // Reset on open
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={`${styles.modal} ${isDanger ? styles.danger : ""}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.pawDecoration}>🐾</div>
                <div className={styles.icon}>{isDanger ? "⚠️" : "✨"}</div>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message} style={{ marginBottom: requireInput ? "1.5rem" : "2.5rem" }}>{message}</p>
                {requireInput && (
                    <input
                        type="text"
                        className={styles.input}
                        placeholder={inputPlaceholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        autoFocus
                    />
                )}
                <div className={styles.actions}>
                    <button className={`${styles.btn} ${styles["btn-cancel"]}`} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.btn} ${isDanger ? styles["btn-danger"] : styles["btn-confirm"]}`}
                        onClick={() => {
                            onConfirm(requireInput ? inputValue : undefined);
                        }}
                        disabled={requireInput && inputValue.trim() === ""}
                        style={{ opacity: (requireInput && inputValue.trim() === "") ? 0.5 : 1 }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
