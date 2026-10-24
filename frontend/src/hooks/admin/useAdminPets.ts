/**
 * useAdminPets — todas las mascotas registradas, con búsqueda por nombre, especie, raza o dueño.
 * Espejo de `mobile/src/hooks/admin/useAdminPets.ts` (allí el buscador no filtraba).
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllPets, type Pet } from '@/services/mascotas';
import { adminUsersService } from '@/services/adminUsers';

export type { Pet };

export function useAdminPets() {
    const [searchText, setSearchText] = useState('');
    const { data: mascotas = [], isLoading } = useQuery({ queryKey: ['admin-mascotas'], queryFn: getAllPets });
    // Dueños para mostrar el nombre (hasta 200; la consola de usuarios pagina el resto)
    const { data: owners } = useQuery({
        queryKey: ['admin-users', { owners: true }],
        queryFn: () => adminUsersService.searchUsers({ limit: 200 }),
    });
    const ownerName = (ownerId: string) => owners?.items.find((u) => u.id === ownerId)?.full_name ?? 'Dueño sin nombre';

    const filtered = useMemo(() => {
        const q = searchText.trim().toLowerCase();
        if (!q) return mascotas;
        return mascotas.filter((m) =>
            [m.name, m.species, m.breed, ownerName(m.owner_id)].filter(Boolean).join(' ').toLowerCase().includes(q),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps -- ownerName depende de `owners`
    }, [mascotas, searchText, owners]);

    return {
        mascotas: filtered,
        total: mascotas.length,
        isLoading,
        searchText,
        setSearchText,
        vaccinatedCount: mascotas.filter((m) => m.is_vaccinated).length,
        ownerName,
    };
}
