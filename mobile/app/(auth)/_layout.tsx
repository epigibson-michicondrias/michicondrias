import { Stack } from 'expo-router';

/** Pantallas sin sesión. La guarda de app/_layout.tsx saca de aquí a quien ya inició sesión (salvo reset-password). */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
