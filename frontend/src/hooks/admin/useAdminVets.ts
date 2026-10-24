/**
 * useAdminVets — cuentas con rol veterinario, filtradas en el servidor (`GET /users/search?role=veterinario`).
 * La app filtraba por un UUID fijo y sus botones solo mostraban avisos; aquí se abre el detalle real del usuario.
 */
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminUsersService } from '@/services/adminUsers';

export function useAdminVets() {
    const [q, setQ] = useState('');
    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', { role: 'veterinario', q }],
        queryFn: () => adminUsersService.searchUsers({ role: 'veterinario', q: q.trim() || undefined, limit: 200, order_by: 'name_asc' }),
        placeholderData: keepPreviousData,
    });
    return { vets: data?.items ?? [], total: data?.total ?? 0, isLoading, q, setQ };
}
