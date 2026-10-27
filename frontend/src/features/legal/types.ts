export type LegalBlock = string | { list: string[] } | { note: string };

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  summary: string;
  sections: LegalSection[];
}
