/**
 * useExplore — Explorar (`(app)/explorar`): catálogo de servicios por categoría.
 * Espejo de `mobile/src/hooks/home/useExplore.ts`.
 */
import { useState, useMemo } from 'react';
import type { ComponentType } from 'react';
import {
  Sparkles, Stethoscope, UserCheck, Home, MapPin, Heart, AlertTriangle, Bone, HeartPulse,
  Briefcase, Users, Shield, FlaskConical, Dumbbell, Scissors, Car, Flower2, Store,
} from 'lucide-react';

export type CategoryKey = 'Salud' | 'Servicios' | 'Comunidad';

export interface ExploreItem {
  title: string;
  subtitle: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
  route: string;
  category: CategoryKey;
}

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'Salud', label: 'Salud', icon: HeartPulse, color: 'var(--color-success)' },
  { key: 'Servicios', label: 'Servicios', icon: Briefcase, color: 'var(--color-secondary)' },
  { key: 'Comunidad', label: 'Comunidad', icon: Users, color: 'var(--color-accent)' },
];

export const EXPLORE_ITEMS: ExploreItem[] = [
  { title: 'Veterinarios', subtitle: 'Clínicas y especialistas', icon: Stethoscope, color: 'var(--color-info)', route: '/directorio', category: 'Salud' },
  { title: 'Laboratorios', subtitle: 'Análisis y resultados', icon: FlaskConical, color: 'var(--color-info)', route: '/laboratorio', category: 'Salud' },
  { title: 'Seguros', subtitle: 'Planes para tu mascota', icon: Shield, color: 'var(--color-info)', route: '/aseguradoras', category: 'Salud' },
  { title: 'Diagnóstico IA', subtitle: 'Orientación por síntomas', icon: Sparkles, color: 'var(--color-secondary)', route: '/mascotas/diagnostico-ia', category: 'Salud' },

  { title: 'Paseadores', subtitle: 'Paseos a tu medida', icon: UserCheck, color: 'var(--color-secondary)', route: '/paseadores', category: 'Servicios' },
  { title: 'Cuidadores', subtitle: 'Hospedaje y visitas', icon: Home, color: 'var(--color-secondary)', route: '/cuidadores', category: 'Servicios' },
  { title: 'Estética', subtitle: 'Baño y corte', icon: Scissors, color: 'var(--color-secondary)', route: '/estilistas', category: 'Servicios' },
  { title: 'Entrenadores', subtitle: 'Adiestramiento', icon: Dumbbell, color: 'var(--color-secondary)', route: '/entrenadores', category: 'Servicios' },
  { title: 'Transporte', subtitle: 'Viajes para mascotas', icon: Car, color: 'var(--color-secondary)', route: '/transportistas', category: 'Servicios' },
  { title: 'Pet-friendly', subtitle: 'Lugares que aceptan mascotas', icon: MapPin, color: 'var(--color-accent)', route: '/petfriendly', category: 'Servicios' },
  { title: 'Establecimientos', subtitle: 'Comercios y locales', icon: Store, color: 'var(--color-accent)', route: '/establecimientos', category: 'Servicios' },
  { title: 'Funeraria', subtitle: 'Despedida y memoriales', icon: Flower2, color: 'var(--color-text-muted)', route: '/funeraria', category: 'Servicios' },

  { title: 'Adopciones', subtitle: 'Busca un amigo', icon: Heart, color: 'var(--color-accent)', route: '/adopciones', category: 'Comunidad' },
  { title: 'Mascotas perdidas', subtitle: 'Reportes activos', icon: AlertTriangle, color: 'var(--color-error)', route: '/perdidas', category: 'Comunidad' },
  { title: 'Donaciones', subtitle: 'Apoya a los refugios', icon: Bone, color: 'var(--color-accent)', route: '/donaciones', category: 'Comunidad' },
];

export function useExplore() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const filteredItems = useMemo(
    () => (selectedCategory ? EXPLORE_ITEMS.filter((item) => item.category === selectedCategory) : EXPLORE_ITEMS),
    [selectedCategory],
  );

  const sections = useMemo(
    () => CATEGORIES
      .map((cat) => ({ ...cat, items: filteredItems.filter((item) => item.category === cat.key) }))
      .filter((section) => section.items.length > 0),
    [filteredItems],
  );

  const handleCategoryPress = (key: CategoryKey) => {
    setSelectedCategory((prev) => (prev === key ? null : key));
  };

  return {
    categories: CATEGORIES,
    filteredItems,
    sections,
    selectedCategory,
    handleCategoryPress,
    clearFilter: () => setSelectedCategory(null),
  };
}
