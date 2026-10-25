"use client";

/**
 * DataTable — tabla de escritorio con filas clicables (enlace) o estáticas. Bajo 640 px cada fila se vuelve una
 * tarjeta con «etiqueta: valor», sin scroll horizontal. Para listas de datos con varias columnas comparables.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import s from "./DataTable.module.css";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Columna principal: en teléfono va arriba, sin etiqueta. */
  primary?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Si se da, cada fila es un enlace. */
  rowHref?: (row: T) => string;
  /** Acciones al final de la fila (botones de editar/borrar). */
  rowActions?: (row: T) => ReactNode;
  caption: string;
}

export default function DataTable<T>({ columns, rows, rowKey, rowHref, rowActions, caption }: DataTableProps<T>) {
  return (
    <div className={s.wrap}>
      <table className={s.table}>
        <caption className={s.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.align === "right" ? s.right : undefined}>{c.header}</th>
            ))}
            {rowActions && <th scope="col"><span className={s.srOnly}>Acciones</span></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = rowHref?.(row);
            return (
              <tr key={rowKey(row)} className={href ? s.linkRow : undefined}>
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    data-label={c.header}
                    className={[c.align === "right" ? s.right : "", c.primary ? s.primary : ""].join(" ")}
                  >
                    {/* El enlace cubre toda la fila desde la primera celda (::after), sin anidar interactivos */}
                    {href && i === 0 ? <Link href={href} className={s.rowLink}>{c.render(row)}</Link> : c.render(row)}
                  </td>
                ))}
                {rowActions && <td className={s.actions}>{rowActions(row)}</td>}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
