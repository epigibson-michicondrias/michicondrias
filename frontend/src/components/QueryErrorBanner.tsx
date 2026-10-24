"use client";

/**
 * Aviso flotante cuando alguna consulta de la pantalla falló, con «Reintentar» (espejo de
 * `mobile/src/components/QueryErrorBanner.tsx`). Lo incluye `ScreenContainer`: nunca una pantalla en blanco.
 *
 * «Sin conexión» solo se muestra si el navegador **realmente** está offline. Antes se deducía del
 * mensaje del error (regex), y un timeout («Verifica tu conexión») o cualquier error con esa palabra
 * hacía que se dijera «Sin conexión» estando en línea.
 */
import { useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { RefreshCw, WifiOff, AlertTriangle } from "lucide-react";
import Button from "./Button";
import l from "./layout/layout.module.css";

function subscribeOnline(callback: () => void) {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
}

export default function QueryErrorBanner() {
  const queryClient = useQueryClient();
  const cache = queryClient.getQueryCache();

  // Conectividad real del navegador, no la del mensaje del error.
  const isOffline = useSyncExternalStore(subscribeOnline, () => !window.navigator.onLine, () => false);

  // Resumen como texto estable para que useSyncExternalStore no vuelva a pintar si nada cambió.
  const summary = useSyncExternalStore(
    (onChange) => cache.subscribe(onChange),
    () => {
      const failed = cache.getAll().filter((q) => q.state.status === "error" && q.getObserversCount() > 0);
      return failed.length ? String(failed.length) : "";
    },
    () => "",
  );

  if (!summary) return null;

  return (
    <div className={l.bannerWrap} role="status" aria-live="polite">
      <div className={l.banner}>
        {isOffline ? (
          <WifiOff size={20} className={l.bannerIcon} aria-hidden />
        ) : (
          <AlertTriangle size={20} className={l.bannerIcon} aria-hidden />
        )}
        <div className={l.bannerText}>
          <p className={l.bannerTitle}>{isOffline ? "Sin conexión" : "No pudimos cargar todo"}</p>
          <p className={l.bannerSub}>
            {isOffline ? "Revisa tu internet y vuelve a intentar." : "Algo falló al pedir los datos. Puedes reintentar."}
          </p>
        </div>
        <Button
          label="Reintentar"
          size="sm"
          fullWidth={false}
          icon={<RefreshCw size={14} />}
          onPress={() => queryClient.refetchQueries({ predicate: (q) => q.state.status === "error", type: "active" })}
        />
      </div>
    </div>
  );
}
