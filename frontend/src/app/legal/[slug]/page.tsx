import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegalDocument from "@/features/legal/LegalDocument";
import { LEGAL_DOCS, getLegalDoc } from "@/features/legal/docs";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const doc = getLegalDoc((await params).slug);
  return { title: doc ? `${doc.title} - Michicondrias` : "Legal - Michicondrias", description: doc?.summary };
}

export default async function LegalDocPage({ params }: { params: Promise<Params> }) {
  const doc = getLegalDoc((await params).slug);
  if (!doc) notFound();
  return <LegalDocument doc={doc} />;
}
