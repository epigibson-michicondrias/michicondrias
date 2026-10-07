import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ThemeProvider as MichiThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { CartProvider } from '../src/contexts/CartContext';
import { AppAlertProvider } from '@/src/components/AppAlert';
import { useSessionSync } from '@/src/hooks/home/useSessionSync';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,       // 1 min before data is considered stale
      gcTime: 5 * 60_000,      // 5 min cache retention
      retry: 1,                 // 1 retry on failure
      refetchOnWindowFocus: false,
    },
  },
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  // Renueva el token y sincroniza el rol mientras haya sesión (al abrir y al volver a primer plano)
  useSessionSync();

  // La primera carga de la sesión decide a dónde ir; mientras tanto no se pinta nada (sigue el splash) para que no
  // destellen las pestañas. Después, isLoading también cambia al entrar/salir, pero eso ya no oculta la app.
  const [booted, setBooted] = useState(false);
  useEffect(() => {
    if (!isLoading && !booted) {
      setBooted(true);
      SplashScreen.hideAsync();
    }
  }, [isLoading, booted]);

  useEffect(() => {
    if (!booted || isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    // El enlace del correo para cambiar contraseña debe abrirse aunque haya sesión
    const isPasswordReset = inAuthGroup && segments[1] === 'reset-password';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup && !isPasswordReset) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, booted, segments, router]);

  if (!booted) return null;

  return (
    <AppAlertProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </ThemeProvider>
    </AppAlertProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MichiThemeProvider>
        <AuthProvider>
          <CartProvider>
            <RootLayoutNav />
          </CartProvider>
        </AuthProvider>
      </MichiThemeProvider>
    </QueryClientProvider>
  );
}
