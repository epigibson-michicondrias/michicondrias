import type { Metadata } from "next";
import AppProviders from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "Kit de componentes · Michicondrias",
  robots: { index: false, follow: false },
};

export default function KitLayout({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
