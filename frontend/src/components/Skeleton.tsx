/** Carga con la forma del contenido (espejo de `mobile/src/components/Skeleton.tsx`). */
import type { CSSProperties } from "react";
import s from "./kit.module.css";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: CSSProperties;
}

export function Skeleton({ width = "100%", height = 14, borderRadius = 8, style }: SkeletonProps) {
  return <span className={s.skeleton} style={{ width, height, borderRadius, ...style }} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className={s.skeletonCard} aria-hidden>
      <Skeleton width={44} height={44} borderRadius={12} />
      <div style={{ flex: 1, display: "grid", gap: 8 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number; inset?: boolean }) {
  return (
    <div className={s.skeletonList} role="status" aria-label="Cargando">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className={s.skeletonGrid} role="status" aria-label="Cargando">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={s.skeletonGridCard}>
          <Skeleton height={120} borderRadius={0} />
          <div className={s.skeletonGridBody}>
            <Skeleton width="70%" />
            <Skeleton width="45%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
