/**
 * useAdminUsers — consola de usuarios: búsqueda, filtros, orden y paginación EN EL SERVIDOR (`GET /users/search`),
 * más alta, edición, activar/desactivar y borrado. La app filtra en el cliente sobre los primeros 100; la web no.
 * Con `withList: false` (pantalla de detalle) no se pide la lista: solo mutaciones, formulario y roles.
 */
import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminUsersService, type AdminUser, type UserSearchParams } from '@/services/adminUsers';
import { getRoleColorFor, getRoleLabelFor } from '@/constants/roles';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';
import { useDebounce } from '@/hooks/useDebounce';

export const PAGE_SIZE = 25;

export interface UserFormData {
    full_name: string;
    email: string;
    password: string;
    role_id: string;
}

export type UserFormErrors = Partial<Record<keyof UserFormData, string>>;

export type StatusFilter = 'all' | 'active' | 'inactive';
export type KycFilter = 'all' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNVERIFIED';

const EMPTY_FORM: UserFormData = { full_name: '', email: '', password: '', role_id: '' };
const INVALIDATE = [['admin-users'], ['admin-user'], ['admin-roles'], ['admin-dashboard'], ['users-stats']];

export function useAdminUsers(options?: { withList?: boolean }) {
    const withList = options?.withList !== false;
    const queryClient = useQueryClient();
    const [q, setQ] = useState('');
    const debouncedQ = useDebounce(q.trim(), 350);
    const [role, setRole] = useState('all');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [kyc, setKyc] = useState<KycFilter>('all');
    const [orderBy, setOrderBy] = useState<NonNullable<UserSearchParams['order_by']>>('created_at_desc');
    const [page, setPage] = useState(0);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState<UserFormErrors>({});

    const params: UserSearchParams = {
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        q: debouncedQ || undefined,
        role: role === 'all' ? undefined : role,
        is_active: status === 'all' ? undefined : status === 'active',
        verification_status: kyc === 'all' ? undefined : kyc,
        order_by: orderBy,
    };

    const { data, isLoading, isFetching, isError, refetch } = useQuery({
        queryKey: ['admin-users', params],
        queryFn: () => adminUsersService.searchUsers(params),
        placeholderData: keepPreviousData,
        enabled: withList,
    });

    const { data: roles = [] } = useQuery({ queryKey: ['admin-roles'], queryFn: () => adminUsersService.getRoles() });
    const roleOptions = roles
        .map((r) => ({ id: r.id, name: r.name, label: getRoleLabelFor(r.name), color: getRoleColorFor(r.name), count: r.users_count ?? 0 }))
        .sort((a, b) => a.label.localeCompare(b.label));
    const defaultRoleId = roleOptions.find((r) => r.name === 'consumidor')?.id || roleOptions[0]?.id || '';

    const invalidate = () => INVALIDATE.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    const fail = (title: string) => (e: unknown) => showAlert({ type: 'error', title, message: errorMessage(e, 'Inténtalo de nuevo.') });

    const toggleMutation = useMutation({
        mutationFn: (userId: string) => adminUsersService.toggleUserStatus(userId),
        onSuccess: (u) => {
            invalidate();
            showAlert({ type: 'success', title: u.is_active ? 'Usuario activado' : 'Usuario desactivado', message: u.is_active ? 'Ya puede iniciar sesión.' : 'Ya no podrá iniciar sesión hasta que lo actives.' });
        },
        onError: fail('No se pudo cambiar el estado'),
    });

    const saveMutation = useMutation({
        mutationFn: () => {
            const base = { full_name: formData.full_name.trim(), email: formData.email.trim().toLowerCase(), role_id: formData.role_id };
            if (editingUser) {
                return adminUsersService.updateUser(editingUser.id, { ...base, ...(formData.password ? { password: formData.password } : {}) });
            }
            return adminUsersService.createUser({ ...base, password: formData.password, is_active: true });
        },
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: editingUser ? 'Usuario actualizado' : 'Usuario creado', message: editingUser ? 'Los cambios ya están guardados.' : 'Ya puede iniciar sesión con su correo y contraseña.' });
            closeModal();
        },
        onError: fail('No se pudo guardar el usuario'),
    });

    const deleteMutation = useMutation({
        mutationFn: (userId: string) => adminUsersService.deleteUser(userId),
        onSuccess: () => {
            invalidate();
            showAlert({ type: 'success', title: 'Usuario eliminado', message: 'Se borró la cuenta.' });
        },
        onError: fail('No se pudo eliminar'),
    });

    const handleDelete = (user: AdminUser, onDone?: () => void) => {
        showAlert({
            type: 'warning',
            title: 'Eliminar usuario',
            message: `¿Eliminar la cuenta de ${user.full_name || user.email}? No se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(user.id, { onSuccess: onDone }),
        });
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ ...EMPTY_FORM, role_id: defaultRoleId });
        setFormErrors({});
        setModalVisible(true);
    };

    const openEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setFormData({ full_name: user.full_name || '', email: user.email, password: '', role_id: user.role_id || defaultRoleId });
        setFormErrors({});
        setModalVisible(true);
    };

    function closeModal() {
        setModalVisible(false);
        setEditingUser(null);
    }

    const updateForm = (field: keyof UserFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = () => {
        const next: UserFormErrors = {};
        if (!formData.full_name.trim()) next.full_name = 'Escribe el nombre.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = 'Escribe un correo válido.';
        if (!editingUser && formData.password.length < 8) next.password = 'Mínimo 8 caracteres.';
        if (editingUser && formData.password && formData.password.length < 8) next.password = 'Mínimo 8 caracteres o déjala vacía.';
        if (!formData.role_id) next.role_id = 'Elige un rol.';
        setFormErrors(next);
        if (Object.keys(next).length === 0) saveMutation.mutate();
    };

    /** Cualquier cambio de filtro regresa a la primera página. */
    const withReset = <T,>(set: (v: T) => void) => (v: T) => {
        set(v);
        setPage(0);
    };

    const total = data?.total ?? 0;
    const filtering = !!q.trim() || role !== 'all' || status !== 'all' || kyc !== 'all';

    return {
        users: data?.items ?? [],
        total,
        page,
        pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        setPage,
        isLoading,
        isFetching,
        filtering,
        q, setQ: withReset(setQ),
        role, setRole: withReset(setRole),
        status, setStatus: withReset(setStatus),
        kyc, setKyc: withReset(setKyc),
        orderBy, setOrderBy: withReset(setOrderBy),
        clearFilters: () => {
            setQ(''); setRole('all'); setStatus('all'); setKyc('all'); setPage(0);
        },
        roleOptions,
        modalVisible,
        editingUser,
        formData,
        formErrors,
        updateForm,
        openCreateModal,
        openEditModal,
        closeModal,
        handleSubmit,
        isSaving: saveMutation.isPending,
        toggleStatus: (userId: string) => toggleMutation.mutate(userId),
        togglingId: toggleMutation.isPending ? toggleMutation.variables : undefined,
        handleDelete,
    };
}
