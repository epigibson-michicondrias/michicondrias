import Link from "next/link";
import { LEGAL, isPending } from "./legalConfig";
import type { LegalBlock, LegalDoc } from "./types";
import styles from "./legal.module.css";

/** Resalta cada «[POR COMPLETAR: …]» para que no pase desapercibido antes de publicar. */
function Text({ value }: { value: string }) {
  if (!isPending(value)) return <>{value}</>;
  const parts = value.split(/(\[POR COMPLETAR[^\]]*\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("[POR COMPLETAR") ? (
          <mark key={i} className={styles.pending}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p><Text value={block} /></p>;
  if ("list" in block) {
    return (
      <ul>
        {block.list.map((item, i) => <li key={i}><Text value={item} /></li>)}
      </ul>
    );
  }
  return <p className={styles.note}><Text value={block.note} /></p>;
}

export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <article className={styles.article}>
      <Link href="/legal" className={styles.back}>← Todos los documentos legales</Link>
      <h1 className={styles.title}>{doc.title}</h1>
      <p className={styles.meta}>
        {LEGAL.brand} · Vigente desde el {LEGAL.effectiveAt} · Última actualización: {LEGAL.updatedAt}
      </p>
      {doc.sections.map((section) => (
        <section key={section.title} className={styles.section}>
          <h2>{section.title}</h2>
          {section.blocks.map((block, i) => <Block key={i} block={block} />)}
        </section>
      ))}
    </article>
  );
}
