"use client";

/**
 * Explorar — espejo de `mobile/app/(tabs)/explorar.tsx`: catálogo de servicios con filtro por categoría.
 */
import Link from "next/link";
import { Search } from "lucide-react";
import ScreenContainer from "@/components/layout/ScreenContainer";
import ScreenHeader from "@/components/layout/ScreenHeader";
import SectionHeader from "@/components/SectionHeader";
import FilterChip from "@/components/FilterChip";
import { useExplore } from "@/hooks/home/useExplore";
import s from "../pages.module.css";

export default function ExplorarPage() {
  const { categories, sections, selectedCategory, handleCategoryPress, clearFilter } = useExplore();

  return (
    <ScreenContainer>
      <ScreenHeader title="Explorar" subtitle="Todo lo que ofrece Michicondrias" showBack={false} />

      <Link href="/busqueda" className={s.searchBar}>
        <Search size={18} aria-hidden />
        <span>Buscar mascotas, servicios o productos</span>
      </Link>

      <div className={s.chips}>
        {categories.map((cat) => (
          <FilterChip
            key={cat.key}
            label={cat.label}
            active={selectedCategory === cat.key}
            onPress={() => handleCategoryPress(cat.key)}
            icon={<cat.icon size={14} />}
          />
        ))}
        {selectedCategory && (
          <FilterChip label="Quitar filtro" active={false} onPress={clearFilter} />
        )}
      </div>

      {sections.map((section) => (
        <section key={section.key} className={s.section}>
          <SectionHeader title={section.label} icon={<section.icon size={18} />} />
          <div className={s.grid}>
            {section.items.map((item) => (
              <Link key={item.route + item.title} href={item.route} className={s.toolLink}>
                <item.icon size={20} color={item.color} />
                <div>
                  <p className={s.cardTitle}>{item.title}</p>
                  <p className={s.cardDesc}>{item.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </ScreenContainer>
  );
}
