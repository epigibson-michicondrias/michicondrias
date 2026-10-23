import Link from "next/link";

/**
 * Aviso para funciones que la web todavía no implementa de forma segura y viven solo en la app.
 * Se usa en lugar de páginas que simulaban datos (rastreo GPS aleatorio, donaciones sin cobro).
 */
export default function AppOnlyNotice({ title, message, backHref }: { title: string; message: string; backHref: string }) {
  return (
    <div className="glass-card" style={{ maxWidth: 520, margin: "4rem auto", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{title}</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{message}</p>
      <Link href={backHref} className="btn btn-secondary">
        Volver
      </Link>
    </div>
  );
}
