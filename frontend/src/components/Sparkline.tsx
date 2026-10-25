"use client";

/**
 * Sparkline — línea de evolución en SVG (sin librería) con los colores del tema. Cada punto lleva su `<title>`
 * (fecha y valor) para el hover y el lector de pantalla; arriba muestra el último valor y el cambio total.
 */
import s from "./Sparkline.module.css";

export interface SparkPoint {
  date: string;
  value: number;
  /** Texto extra del punto (p. ej. motivo de la consulta). */
  note?: string;
}

interface SparklineProps {
  points: SparkPoint[];
  label: string;
  unit: string;
  formatDate: (iso: string) => string;
  /** `accent` (dorado) o `info` (azul). */
  tone?: "accent" | "info";
}

const W = 300;
const H = 72;
const PAD = 6;

export default function Sparkline({ points, label, unit, formatDate, tone = "accent" }: SparklineProps) {
  if (points.length === 0) return null;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => (points.length === 1 ? W / 2 : PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const y = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const change = points.length > 1 ? +(last.value - points[0].value).toFixed(2) : null;

  return (
    <figure className={`${s.wrap} ${tone === "info" ? s.info : s.accent}`}>
      <figcaption className={s.head}>
        <span className={s.label}>{label}</span>
        <span className={s.value}>{last.value} {unit}</span>
        {change !== null && change !== 0 && (
          <span className={s.change}>{change > 0 ? "+" : ""}{change} {unit} desde {formatDate(points[0].date)}</span>
        )}
      </figcaption>
      {points.length === 1 ? (
        <p className={s.single}>Una medición, el {formatDate(last.date)}. La línea aparece con la segunda.</p>
      ) : (
      <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={s.svg}
        role="img"
        aria-label={`${label}: de ${points[0].value} a ${last.value} ${unit} en ${points.length} mediciones`}
      >
        <path d={path} className={s.line} vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={`${p.date}-${i}`} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 4 : 3} className={s.dot}>
            <title>{`${formatDate(p.date)}: ${p.value} ${unit}${p.note ? ` · ${p.note}` : ""}`}</title>
          </circle>
        ))}
      </svg>
      <div className={s.axis}>
        <span>{formatDate(points[0].date)}</span>
        <span>{formatDate(last.date)}</span>
      </div>
      </>
      )}
    </figure>
  );
}
