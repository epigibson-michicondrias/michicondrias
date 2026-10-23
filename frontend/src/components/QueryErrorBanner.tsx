"use client";

/**
 * Aviso flotante cuando alguna consulta de la pantalla falló, con «Reintentar» (espejo de
 * `mobile/src/components/QueryErrorBanner.tsx`). Lo incluye `ScreenContainer`: nunca una pantalla en blanco.
 */
import { useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import Button from "./Button";
import l from "./layout/layout.module.css";

const NETWORK_ERROR = /network ?error|network request failed|failed to fetch|tiempo de espera|timeout|conexi[oó]n/i;

export default function QueryErrorBanner() {
  const queryClient = useQueryClient();
  const cache = queryClient.getQueryCache();

  // Resumen como texto estable para que useSyncExternalStore no vuelva a pintar si nada cambió.
  const summary = useSyncExternalStore(
    (onChange) => cache.subscribe(onChange),
    () => {
      const failed = cache.getAll().filter((q) => q.state.status === "error" && q.getObserversCount() > 0);
      if (!failed.length) return "";
      const offline = failed.some((q) => NETWORK_ERROR.test(String((q.state.error as Error | null)?.message ?? "")));
      return `${failed.length}|${offline ? 1 : 0}`;
    },
    () => "",
  );

  if (!summary) return null;
  const offline = summary.endsWith("|1");

  return (
    <div className={l.bannerWrap} role="status" aria-live="polite">
      <div className={l.banner}>
        <WifiOff size={20} className={l.bannerIcon} aria-hidden />
        <div className={l.bannerText}>
          <p className={l.bannerTitle}>{offline ? "Sin conexión" : "No pudimos cargar todo"}</p>
          <p className={l.bannerSub}>{offline ? "Revisa tu internet y vuelve a intentar." : "Algo falló al pedir los datos."}</p>
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
