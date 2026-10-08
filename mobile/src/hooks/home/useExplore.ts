/**
 * useExplore — Hook for explore screen category filtering and data
 * Extracts filter state and items computation from app/(tabs)/explorar.tsx
 */
import { useState, useMemo } from 'react';
import { Stethoscope, UserCheck, Home, MapPin, Heart, AlertTriangle, Bone, HeartPulse, Briefcase, Store, Users, Shield, FlaskConical, Dumbbell, Scissors, Car, Flower2 } from 'lucide-react-native';
import { accents } from '@/constants/design';

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
    { key: 'Salud', label: 'Salud', icon: HeartPulse, color: accents.health },
    { key: 'Servicios', label: 'Servicios', icon: Briefcase, color: accents.services },
    { key: 'Comunidad', label: 'Comunidad', icon: Users, color: accents.community },
];

export const EXPLORE_ITEMS: ExploreItem[] = [
    // Salud
    { title: 'Veterinarios', subtitle: 'Clínicas y especialistas', icon: Stethoscope, color: accents.info, route: '/directorio', category: 'Salud' },
    { title: 'Laboratorios', subtitle: 'Análisis y resultados', icon: FlaskConical, color: accents.health, route: '/laboratorio', category: 'Salud' },
    { title: 'Seguros', subtitle: 'Planes para tu mascota', icon: Shield, color: accents.info, route: '/aseguradoras', category: 'Salud' },

    // Servicios
    { title: 'Paseadores', subtitle: 'Paseos a tu medida', icon: UserCheck, color: accents.services, route: '/paseadores', category: 'Servicios' },
    { title: 'Cuidadores', subtitle: 'Hospedaje y visitas', icon: Home, color: accents.services, route: '/cuidadores', category: 'Servicios' },
    { title: 'Estética', subtitle: 'Baño y corte', icon: Scissors, color: accents.shop, route: '/estilistas', category: 'Servicios' },
    { title: 'Entrenadores', subtitle: 'Adiestramiento', icon: Dumbbell, color: accents.services, route: '/entrenadores', category: 'Servicios' },
    { title: 'Transporte', subtitle: 'Viajes para mascotas', icon: Car, color: accents.services, route: '/transportistas', category: 'Servicios' },
    // Pet-friendly y Establecimientos parecen el mismo tipo de lugar: se decide si se fusionan en la auditoría P2
    { title: 'Pet-friendly', subtitle: 'Lugares que aceptan mascotas', icon: MapPin, color: accents.teal, route: '/petfriendly', category: 'Servicios' },
    { title: 'Establecimientos', subtitle: 'Comercios y locales', icon: Store, color: accents.warning, route: '/establecimientos', category: 'Servicios' },
    { title: 'Funeraria', subtitle: 'Despedida y memoriales', icon: Flower2, color: accents.neutral, route: '/funeraria', category: 'Servicios' },

    // Comunidad
    { title: 'Adopciones', subtitle: 'Busca un amigo', icon: Heart, color: accents.community, route: '/adopciones', category: 'Comunidad' },
    { title: 'Mascotas perdidas', subtitle: 'Reportes activos', icon: AlertTriangle, color: accents.danger, route: '/perdidas', category: 'Comunidad' },
    { title: 'Donaciones', subtitle: 'Apoya a los refugios', icon: Bone, color: accents.warning, route: '/donaciones', category: 'Comunidad' },
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
