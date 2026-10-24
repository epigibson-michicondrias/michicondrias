/**
 * useAdminRoles — alta, edición y baja de roles.
 * Los roles del sistema (`is_system`) no se renombran ni se borran, y un rol con usuarios no se borra: la UI lo
 * explica y el backend lo vuelve a validar (sus 400 traen mensaje en español y se muestran tal cual).
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersService, type AdminRole } from '@/services/adminUsers';
import { showAlert } from '@/components/AppAlert';
import { errorMessage } from '@/features/servicios-pro/requestStatus';
import { getRoleLabelFor } from '@/constants/roles';

export type Role = AdminRole;

type FormErrors = { name?: string; description?: string };

/** Nombre técnico del rol: minúsculas, sin acentos ni espacios. */
const toRoleName = (v: string) =>
    v.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase().replace(/\s+/g, '_');

/** Motivo por el que un rol no se puede borrar, o null si se puede. */
export function deleteBlockReason(role: Role): string | null {
    if (role.is_system) return 'Es un rol del sistema: la plataforma lo usa por nombre.';
    if ((role.users_count ?? 0) > 0) {
        const n = role.users_count ?? 0;
        return `Tiene ${n} ${n === 1 ? 'usuario' : 'usuarios'}: cámbiales el rol antes de borrarlo.`;
    }
    return null;
}

export function useAdminRoles() {
    const queryClient = useQueryClient();
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: roles = [], isLoading, isFetching } = useQuery({
        queryKey: ['admin-roles'],
        queryFn: () => adminUsersService.getRoles(),
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-roles'] });

    const createMutation = useMutation({
        mutationFn: (data: { name: string; description?: string | null }) => adminUsersService.createRole(data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Rol creado', message: 'Ya puedes asignarlo desde Usuarios.' });
            setModalVisible(false);
            invalidate();
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo crear', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: { name?: string; description?: string | null } }) => adminUsersService.updateRole(id, data),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Rol actualizado', message: 'Los cambios se guardaron.' });
            setModalVisible(false);
            invalidate();
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo guardar', message: errorMessage(error, 'Inténtalo de nuevo.') }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminUsersService.deleteRole(id),
        onMutate: (id) => setDeletingId(id),
        onSuccess: () => {
            showAlert({ type: 'success', title: 'Rol eliminado', message: 'Ya no aparece en la lista.' });
            invalidate();
        },
        onError: (error) => showAlert({ type: 'error', title: 'No se pudo eliminar', message: errorMessage(error, 'Inténtalo de nuevo.') }),
        onSettled: () => setDeletingId(null),
    });

    const handleAction = (role?: Role) => {
        setEditingRole(role || null);
        setFormData({
            name: role?.name || '',
            description: role?.description || '',
        });
        setFormErrors({});
        setModalVisible(true);
    };

    const updateForm = (field: 'name' | 'description', value: string) => {
        setFormData((f) => ({ ...f, [field]: value }));
        if (formErrors[field]) setFormErrors((e) => ({ ...e, [field]: undefined }));
    };

    const handleDelete = (role: Role) => {
        const blocked = deleteBlockReason(role);
        if (blocked) {
            showAlert({ type: 'info', title: 'No se puede eliminar', message: blocked });
            return;
        }
        showAlert({
            type: 'error',
            title: 'Eliminar rol',
            message: `¿Eliminar el rol «${getRoleLabelFor(role.name)}»? No se puede deshacer.`,
            showCancel: true,
            cancelText: 'Cancelar',
            buttonText: 'Eliminar',
            onButtonPress: () => deleteMutation.mutate(role.id),
        });
    };

    const validate = (): FormErrors => {
        const errors: FormErrors = {};
        if (editingRole?.is_system) return errors;
        const name = toRoleName(formData.name);
        if (!name) errors.name = 'Escribe un nombre.';
        else if (name.length < 3) errors.name = 'Usa al menos 3 caracteres.';
        else if (!/^[a-z0-9_]+$/.test(name)) errors.name = 'Solo letras, números y guion bajo.';
        else if (roles.some((r) => r.name === name && r.id !== editingRole?.id)) errors.name = 'Ya existe un rol con ese nombre.';
        if (formData.description.length > 255) errors.description = 'Máximo 255 caracteres.';
        return errors;
    };

    const handleSubmit = () => {
        const errors = validate();
        setFormErrors(errors);
        if (Object.keys(errors).length) return;
        const description = formData.description.trim() || null;
        if (editingRole) {
            // En roles del sistema el nombre no se toca: solo viaja la descripción.
            const data = editingRole.is_system ? { description } : { name: toRoleName(formData.name), description };
            updateMutation.mutate({ id: editingRole.id, data });
        } else {
            createMutation.mutate({ name: toRoleName(formData.name), description });
        }
    };

    const closeModal = () => setModalVisible(false);

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return {
        roles,
        isLoading,
        isFetching,
        isModalVisible,
        editingRole,
        formData,
        setFormData,
        updateForm,
        formErrors,
        normalizedName: toRoleName(formData.name),
        isSaving,
        deletingId,
        handleAction,
        handleDelete,
        handleSubmit,
        closeModal,
    };
}
