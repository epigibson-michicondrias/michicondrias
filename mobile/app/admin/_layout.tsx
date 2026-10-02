import React from 'react';
import { Stack } from 'expo-router';
import RoleGuard from '@/src/components/RoleGuard';

/** Toda la zona /admin exige rol admin (el backend también lo exige con require_role("admin")). */
export default function AdminLayout() {
    return (
        <RoleGuard roles={['admin']} message="El panel de administración es solo para administradores.">
            <Stack screenOptions={{ headerShown: false }} />
        </RoleGuard>
    );
}
