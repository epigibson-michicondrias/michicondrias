---
name: nueva-pantalla
description: Crea o reescribe una pantalla de la app móvil de Michicondrias (Expo Router) siguiendo la estructura del proyecto - pantalla delgada, hook con React Query, servicio, tipos, tokens de diseño, componentes base y los estados carga/vacío/error. Úsala al crear una pantalla nueva o al rehacer una existente para dejarla premium.
---

# Nueva pantalla (o reescritura premium)

## Estructura obligatoria
| Capa | Dónde | Regla |
|---|---|---|
| Pantalla | `mobile/app/<modulo>/<ruta>.tsx` | Solo UI. Nada de `api.`/`fetch`, nada de lógica de negocio |
| Hook | `mobile/src/hooks/<modulo>/use<Algo>.ts` (+ export en `index.ts`) | `useQuery`/`useMutation`; devuelve datos ya listos para pintar |
| Servicio | `mobile/src/services/<servicio>.ts` | Llamadas HTTP con el cliente de `src/lib/api.ts` (`API_URLS`) |
| Tipos | `mobile/src/types/<dominio>.ts` | Espejo del schema Pydantic del backend |
| Piezas grandes | `mobile/src/features/<modulo>/` | Si la pantalla pasa de ~400 líneas |

Patrón de hook de referencia: `mobile/src/hooks/mascotas/usePets.ts` (queryKey con el id del usuario,
`enabled`, devuelve `isLoading`, `isRefetching`, `refetch`, `isEmpty`). Tras una mutación, invalidar las queryKeys
afectadas con `queryClient.invalidateQueries`.

## Componentes base (no recrearlos)
- `ScreenContainer` (`src/components/layout/ScreenContainer`) + `ScreenHeader` (`src/components/layout/ScreenHeader`:
  `title`, `subtitle`, `actionIcon` + `onAction` + `actionLabel`, `rightElement`, `gradient`).
- `Button` (`variant`: primary | secondary | ghost | danger | gold; `size`; `loading`; `disabled`; `icon`; `fullWidth`).
- `Card`, `ListRow`, `SectionHeader`, `Badge`, `FilterChip`, `SearchBar`, `FormField` + `src/components/forms/*`
  (`FormSection`, `FormSelect`, `FormSwitch`, `FormImagePicker`), `DatePicker`, `KeyboardScreen`.
- Estados: `Skeleton` / `SkeletonCard` / `SkeletonList` (`src/components/Skeleton`), `EmptyState` (`icon`, `title`,
  `subtitle`, `actionLabel`, `onAction`), `QueryErrorBanner`, `AppRefreshControl`.
- Alertas/confirmaciones: `showAlert` de `src/components/AppAlert` (no `Alert.alert`).
- Rol: `RoleGuard roles={[...]}` y registrar la ruta en `src/constants/roleTools.ts` (`ROLE_TOOLS` si es herramienta,
  siempre en `ROUTE_ACCESS`).

## Estilo
- Colores: `const { theme } = useTheme()` (de `@/src/hooks/useTheme`) → `theme.text`, `theme.surface`, `theme.accent`, `theme.border`, …
  Cero hex en la pantalla.
- Medidas: `import { spacing, radius, shadow, type, layout } from '@/constants/design'`.
- Íconos: solo `lucide-react-native`.
- Una acción primaria por pantalla (botón `primary`/`gold` o la acción del header, no ambos).

## Esqueleto
```tsx
import { useTheme } from '@/src/hooks/useTheme';

export default function XScreen() {
  const { theme } = useTheme();
  const { items, isLoading, isEmpty } = useX();

  return (
    <ScreenContainer noPadding>
      <ScreenHeader title="…" />
      {isLoading ? <SkeletonList /> : isEmpty ? (
        <EmptyState icon={<Icon color={theme.accent} />} title="…" subtitle="…" actionLabel="…" onAction={…} />
      ) : (
        <FlatList data={items} refreshControl={<AppRefreshControl />} … />
      )}
    </ScreenContainer>
  );
}
```
- `QueryErrorBanner` **ya va dentro de `ScreenContainer`**: aparece solo cuando una query activa falla sin datos y
  ofrece reintentar. No lo agregues a mano; por eso toda pantalla debe usar `ScreenContainer`.
- `AppRefreshControl` no recibe props: re-pide todas las queries activas. En web envuelve a los hijos.

## Terminar
1. `cd mobile && npm run check`.
2. Revisar con la skill `review-ux` (captura 375×812, claro y oscuro).
3. Actualizar `PROGRESO_MOBILE.md`.
