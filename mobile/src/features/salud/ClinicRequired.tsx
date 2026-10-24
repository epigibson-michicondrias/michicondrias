/**
 * ClinicRequired — estado "sin clínica registrada" de las pantallas de operación clínica.
 * Todas (agenda, pacientes, recetas, laboratorio…) necesitan una clínica propia; sin ella no hay
 * datos que mostrar y la herramienta sería un callejón sin salida.
 */
import React from 'react';
import { useRouter } from 'expo-router';
import { Building } from 'lucide-react-native';
import { useTheme } from '@/src/hooks/useTheme';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import ScreenHeader from '@/src/components/layout/ScreenHeader';
import EmptyState from '@/src/components/EmptyState';
import { layout } from '@/constants/design';

export default function ClinicRequired({ title, subtitle }: { title: string; subtitle?: string }) {
    const { theme } = useTheme();
    const router = useRouter();
    return (
        <ScreenContainer>
            <ScreenHeader title={title} subtitle={subtitle} />
            <EmptyState
                icon={<Building size={layout.icon.xl * 2} color={theme.textMuted} strokeWidth={1} />}
                title="Registra tu clínica primero"
                subtitle="Necesitas una clínica veterinaria registrada para usar esta herramienta."
                actionLabel="Registrar clínica"
                onAction={() => router.push('/directorio/nuevo' as any)}
            />
        </ScreenContainer>
    );
}
