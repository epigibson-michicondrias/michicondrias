/**
 * useExplore — Hook for explore screen category filtering and data
 * Extracts filter state and items computation from app/(tabs)/explorar.tsx
 */
import { useState, useMemo } from 'react';
import { Stethoscope, UserCheck, Home, MapPin, Heart, AlertTriangle, Bone, HeartPulse, Briefcase, Store, Users, Shield, FlaskConical, Dumbbell, Scissors, Car, Flower2 } from 'lucide-react-native';

export type CategoryKey = 'Salud' | 'Servicios' | 'Comunidad';

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
    { key: 'Comunidad', label: 'Comunidad', icon: Users, color: '#f43f5e' },
];

export const EXPLORE_ITEMS: ExploreItem[] = [
    // Salud
    { title: 'Veterinarios', subtitle: 'Clínicas y especialistas', icon: Stethoscope, color: '#0ea5e9', route: '/directorio', category: 'Salud' },
    { title: 'Laboratorios', subtitle: 'Análisis y resultados', icon: FlaskConical, color: '#10b981', route: '/laboratorio', category: 'Salud' },
    { title: 'Seguros', subtitle: 'Planes para tu mascota', icon: Shield, color: '#0ea5e9', route: '/aseguradoras', category: 'Salud' },

    // Servicios
    { title: 'Paseadores', subtitle: 'Paseos a tu medida', icon: UserCheck, color: '#8b5cf6', route: '/paseadores', category: 'Servicios' },
    { title: 'Cuidadores', subtitle: 'Hospedaje y visitas', icon: Home, color: '#7c3aed', route: '/cuidadores', category: 'Servicios' },
    { title: 'Estética', subtitle: 'Baño y corte', icon: Scissors, color: '#ec4899', route: '/estilistas', category: 'Servicios' },
    { title: 'Entrenadores', subtitle: 'Adiestramiento', icon: Dumbbell, color: '#8b5cf6', route: '/entrenadores', category: 'Servicios' },
    { title: 'Transporte', subtitle: 'Viajes para mascotas', icon: Car, color: '#6366f1', route: '/transportistas', category: 'Servicios' },
    // Pet-friendly y Establecimientos parecen el mismo tipo de lugar: se decide si se fusionan en la auditoría P2
    { title: 'Pet-friendly', subtitle: 'Lugares que aceptan mascotas', icon: MapPin, color: '#14b8a6', route: '/petfriendly', category: 'Servicios' },
    { title: 'Establecimientos', subtitle: 'Comercios y locales', icon: Store, color: '#f59e0b', route: '/establecimientos', category: 'Servicios' },
    { title: 'Funeraria', subtitle: 'Despedida y memoriales', icon: Flower2, color: '#64748b', route: '/funeraria', category: 'Servicios' },

    // Comunidad
    { title: 'Adopciones', subtitle: 'Busca un amigo', icon: Heart, color: '#f43f5e', route: '/adopciones', category: 'Comunidad' },
    { title: 'Mascotas perdidas', subtitle: 'Reportes activos', icon: AlertTriangle, color: '#ef4444', route: '/perdidas', category: 'Comunidad' },
    { title: 'Donaciones', subtitle: 'Apoya a los refugios', icon: Bone, color: '#f59e0b', route: '/donaciones', category: 'Comunidad' },
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
