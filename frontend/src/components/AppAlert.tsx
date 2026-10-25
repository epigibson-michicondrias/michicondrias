"use client";

/**
 * Avisos modales (espejo de `mobile/src/components/AppAlert.tsx`, misma API): `showAlert({ type, title, message,
 * showCancel, onButtonPress })` desde cualquier parte; `AppAlertProvider` va una vez cerca de la raíz.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import Button from "./Button";
import l from "./layout/layout.module.css";

export type AlertType = "success" | "error" | "warning" | "info";

interface AlertConfig {
  type: AlertType;
  title: string;
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  cancelText?: string;
  onCancel?: () => void;
  showCancel?: boolean;
}

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const COLORS: Record<AlertType, [string, string]> = {
  success: ["var(--color-success)", "var(--color-success-light)"],
  error: ["var(--color-error)", "var(--color-error-light)"],
  warning: ["var(--color-warning)", "var(--color-warning-light)"],
  info: ["var(--color-info)", "var(--color-info-light)"],
};

let globalSetAlert: ((config: AlertConfig | null) => void) | null = null;
// Tras avisar que la sesión expiró, se callan unos segundos los errores de las acciones que quedaron en vuelo.
let sessionExpiredNoticeUntil = 0;

export function notifySessionExpired() {
  sessionExpiredNoticeUntil = Date.now() + 5000;
}

export function showAlert(config: AlertConfig) {
  if (config.type === "error" && Date.now() < sessionExpiredNoticeUntil) return;
  globalSetAlert?.(config);
}

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertConfig | null>(null);

  useEffect(() => {
    globalSetAlert = setAlert;
    return () => {
      globalSetAlert = null;
    };
  }, []);

  const dismiss = useCallback((then?: () => void) => {
    setAlert(null);
    then?.();
  }, []);

  // Escape cierra el aviso (como cancelar si lo hay).
  useEffect(() => {
    if (!alert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss(alert.showCancel ? alert.onCancel : undefined);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alert, dismiss]);

  const Icon = alert ? ICONS[alert.type] : null;
  const [color, light] = alert ? COLORS[alert.type] : ["", ""];

  return (
    <>
      {children}
      {alert && Icon ? (
        <div className={l.backdrop} onClick={() => dismiss(alert.showCancel ? alert.onCancel : undefined)} role="button" tabIndex={-1} aria-label="Cerrar">
          <div
            className={l.dialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="app-alert-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={l.dialogIcon} style={{ background: light, color }}>
              <Icon size={28} />
            </div>
            <p id="app-alert-title" className={l.dialogTitle}>
              {alert.title}
            </p>
            {alert.message ? <p className={l.dialogMessage}>{alert.message}</p> : null}
            <div className={l.dialogActions}>
              {alert.showCancel ? (
                <Button label={alert.cancelText || "Cancelar"} variant="secondary" onPress={() => dismiss(alert.onCancel)} />
              ) : null}
              <Button
                label={alert.buttonText || "Entendido"}
                variant={alert.type === "error" && alert.showCancel ? "danger" : "primary"}
                onPress={() => dismiss(alert.onButtonPress)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
