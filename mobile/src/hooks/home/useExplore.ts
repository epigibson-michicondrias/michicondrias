/**
 * useExplore — Hook for explore screen category filtering and data
 * Extracts filter state and items computation from app/(tabs)/explorar.tsx
 */
import { useState, useMemo } from 'react';
import {
    Building,
    Stethoscope,
    ClipboardList,
    Sparkles,
    UserCheck,
    Home,
    MapPin,
    ShoppingBag,
    CreditCard,
    Heart,
    AlertTriangle,
    Bone,
    HeartPulse,
    Briefcase,
    Store,
    Users,
} from 'lucide-react-native';

export type CategoryKey = 'Salud' | 'Servicios' | 'Tienda' | 'Comunidad';

export interface ExploreItem {
    title: string;
    subtitle: string;
    icon: React.ComponentType<any>;
    color: string;
    route: string;
    category: CategoryKey;
}

export interface CategoryDef {
    key: CategoryKey;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
}

export const CATEGORIES: CategoryDef[] = [
    { key: 'Salud', label: 'Salud', icon: HeartPulse, color: '#10b981' },
    { key: 'Servicios', label: 'Servicios', icon: Briefcase, color: '#8b5cf6' },
    { key: 'Tienda', label: 'Tienda', icon: Store, color: '#ec4899' },
    { key: 'Comunidad', label: 'Comunidad', icon: Users, color: '#f43f5e' },
];

export const EXPLORE_ITEMS: ExploreItem[] = [
    // Salud
    { title: 'Clínicas', subtitle: 'Centros cercanos', icon: Building, color: '#10b981', route: '/directorio?type=clinic', category: 'Salud' },
    { title: 'Veterinarios', subtitle: 'Busca un experto', icon: Stethoscope, color: '#0ea5e9', route: '/directorio', category: 'Salud' },
    { title: 'Carnet Salud', subtitle: 'Historial médico', icon: ClipboardList, color: '#3b82f6', route: '/carnet', category: 'Salud' },
    { title: 'Diagnóstico IA', subtitle: 'Análisis inteligente', icon: Sparkles, color: '#8b5cf6', route: '/mascotas/diagnostico-ia', category: 'Salud' },

    // Servicios
    { title: 'Paseadores', subtitle: 'Busca paseadores', icon: UserCheck, color: '#8b5cf6', route: '/paseadores', category: 'Servicios' },
    { title: 'Cuidadores', subtitle: 'Pensiones Michi', icon: Home, color: '#7c3aed', route: '/cuidadores', category: 'Servicios' },
    { title: 'Petfriendly', subtitle: 'Sitios populares', icon: MapPin, color: '#14b8a6', route: '/petfriendly', category: 'Servicios' },

    // Tienda
    { title: 'Michi-Shop', subtitle: 'Artículos para tu mascota', icon: ShoppingBag, color: '#ec4899', route: '/tienda', category: 'Tienda' },
    { title: 'Mis Compras', subtitle: 'Historial pedidos', icon: CreditCard, color: '#f59e0b', route: '/tienda/compras', category: 'Tienda' },

    // Comunidad
    { title: 'Adopciones', subtitle: 'Busca un amigo', icon: Heart, color: '#f43f5e', route: '/adopciones', category: 'Comunidad' },
    { title: 'Mascotas Perdidas', subtitle: 'Reportes activos', icon: AlertTriangle, color: '#ef4444', route: '/perdidas', category: 'Comunidad' },
    { title: 'Donaciones', subtitle: 'Apoyo refugios', icon: Bone, color: '#f59e0b', route: '/donaciones', category: 'Comunidad' },
];

export function useExplore() {
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

    const filteredItems = useMemo(() => {
        return selectedCategory
            ? EXPLORE_ITEMS.filter((item) => item.category === selectedCategory)
            : EXPLORE_ITEMS;
    }, [selectedCategory]);

    // Build rows of 2 for the grid
    const rows = useMemo(() => {
        const result: ExploreItem[][] = [];
        for (let i = 0; i < filteredItems.length; i += 2) {
            result.push(filteredItems.slice(i, i + 2));
        }
        return result;
    }, [filteredItems]);

    const handleCategoryPress = (key: CategoryKey) => {
        setSelectedCategory((prev) => (prev === key ? null : key));
    };

    const clearFilter = () => setSelectedCategory(null);

    return {
        // Data
        categories: CATEGORIES,
        filteredItems,
        rows,
        selectedCategory,

        // Actions
        handleCategoryPress,
        clearFilter,
    };
}
