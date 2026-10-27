import Link from "next/link";
import { LEGAL_DOCS } from "@/features/legal/docs";
import styles from "@/features/legal/legal.module.css";

export default function LegalIndexPage() {
  return (
    <>
      <h1 className={styles.indexTitle}>Documentos legales</h1>
      <p className={styles.meta}>Cómo funciona Michicondrias, cómo cuidamos tus datos y qué reglas aplican.</p>
      <div className={styles.cards}>
        {LEGAL_DOCS.map((doc) => (
          <Link key={doc.slug} href={`/legal/${doc.slug}`} className={styles.card}>
            <p className={styles.cardTitle}>{doc.title}</p>
            <p className={styles.cardSummary}>{doc.summary}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
