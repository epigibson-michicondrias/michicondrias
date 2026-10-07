import { Stack, useRouter } from 'expo-router';
import { Compass } from 'lucide-react-native';
import ScreenContainer from '@/src/components/layout/ScreenContainer';
import EmptyState from '@/src/components/EmptyState';
import { useTheme } from '@/src/hooks/useTheme';
import { layout } from '@/constants/design';

/** Destino de enlaces viejos o mal formados (p. ej. una notificación que apunta a una pantalla que ya no existe). */
export default function NotFoundScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <EmptyState
        icon={<Compass size={layout.icon.xl} color={theme.textMuted} />}
        title="Esta pantalla ya no existe"
        subtitle="Es posible que el enlace sea viejo o que la sección se haya movido."
        actionLabel="Ir al inicio"
        onAction={() => router.replace('/(tabs)')}
      />
    </ScreenContainer>
  );
}
