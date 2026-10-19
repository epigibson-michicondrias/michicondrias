import React from 'react';
import { Stack } from 'expo-router';
import RoleGuard from '@/src/components/RoleGuard';

/** Toda la zona /tienda/vendedor exige rol vendedor (el backend también lo exige al publicar y en los pedidos). */
export default function VendedorLayout() {
    return (
        <RoleGuard roles={['vendedor']} message="El panel de vendedor es para cuentas con tienda en Michi-Shop.">
            <Stack screenOptions={{ headerShown: false }} />
        </RoleGuard>
    );
}
