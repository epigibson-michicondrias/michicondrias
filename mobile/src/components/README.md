# Kit de componentes

Piezas base de la app. **Regla de oro:** si un patrón de UI se repite, se extrae aquí y se reutiliza; no se copian
estilos entre pantallas. Los colores salen de `useTheme()` (`@/src/hooks/useTheme`) y las medidas/tipografía de
`@/constants/design` (`spacing`, `font`, `radius`, `type`, `shadow`, `layout`, `accents`). Nada de `constants/Colors`, hex
sueltos ni `fontSize` inventados. Los tokens ya vienen multiplicados por la escala que el usuario elige en
Perfil (`UI_SCALE`, `scaled()`): una medida numérica suelta NO escala, así que usa siempre tokens. El color de identidad de cada módulo vive en `src/constants/modules.ts`
(`MODULE_ACCENTS`, y `ROLE_ACCENTS` por rol): lo usan Explorar, las insignias de rol y las cabeceras hero, que lo deducen
de la ruta con `useScreenAccent`.

## Layout
| Componente | Para qué |
|---|---|
| `layout/ScreenContainer` | Contenedor de **toda** pantalla. Incluye `QueryErrorBanner` (reintentar) |
| `layout/ScreenHeader` | Cabecera estándar: volver + título/subtítulo + `actions` (lista de botones de ícono con `loading`). Hero por defecto, con el color que deduce la ruta (módulo o rol, ver `useScreenAccent`); `variant="plain"` para casos raros. `module`/`accent` solo para forzar otro color |
| `layout/HeroBackground` | Fondo de degradado con esquinas redondeadas; toma el color de `module`/`accent` o de la ruta y pone la barra de estado en claro. Encima: textos `theme.onHero` e `IconButton variant="glass"` |
| `KeyboardScreen` | Formularios con scroll y teclado (campos sin tapar) |
| `AuthShell` | Esqueleto de las pantallas de `(auth)`: degradado, teclado y scroll (lo usa U3) |
| `RoleGuard` | Protege pantallas pro/admin según `ROUTE_ACCESS` de `roleTools` |

## Acciones y contenido
| Componente | Para qué |
|---|---|
| `IconButton` | Botón de solo ícono de 44 px. `variant` subtle/surface/primary/glass · `loading` · `disabled`. En cabeceras se usa vía `actions` de `ScreenHeader` |
| `StatTile` | Cifra con ícono y etiqueta; con `onPress`/`active` funciona como filtro |
| `BackButton` | `IconButton` con chevron y etiqueta "Volver" |
| `Button` | Acción. `variant` primary/secondary/ghost/danger/gold · `size` · `loading` · `icon` · `fullWidth` |
| `Card` | Tarjeta (`onPress` la hace tocable, `elevated`, `flush`) |
| `ListRow` | Fila de menú/ajustes: `icon`, `label`, `desc`, `badge`, `destructive` |
| `SectionHeader` | Título de sección con `overline`/`icon` y acción opcional |
| `Badge` / `FilterChip` | Etiqueta de estado (`variant` filled/outlined/solid; `solid` para encima de fotos) / chip de filtro |
| `EmptyState` | Vacío con `icon`, `title`, `subtitle` y **una** acción |
| `SearchBar` | Búsqueda con botón de borrar |
| `LoadingOverlay` | Carga de pantalla completa (para transiciones puntuales) |
| `Skeleton` / `SkeletonList` | Carga con la forma del contenido (`import { Skeleton } from '@/src/components/Skeleton'`) |
| `AppRefreshControl` | Pull-to-refresh con refetch de React Query |
| `AppAlert` (`showAlert`) | Avisos: `type`, `title`, `message`, `showCancel`, `onButtonPress` |
| `DatePicker` | Fecha/hora con el formato `es-MX` |

## Formularios
| Componente | Para qué |
|---|---|
| `FormField` | Campo estándar: etiqueta **en tipo oración**, input, `hint` y `error` inline (acepta las props de `TextInput`) |
| `forms/FormSelect` | Selector de opciones tipo chip (especie, género, tamaño) |
| `forms/FormSwitch` | Interruptor con etiqueta |
| `forms/FormImagePicker` | Foto con cámara/galería (recorte y preview) |
| `forms/FormSection` | Agrupación de campos con título |

Validación: `@/src/utils/validators` (`validateRequired`, `validateEmail`, …) → mensajes listos para `FormField.error`.

## Piezas de módulo (en `src/features/<modulo>/`)
| Pieza | Para qué |
|---|---|
| `mascotas/PetForm` | Formulario común de mascota (alta y edición) |
| `mascotas/PetCards` | Tarjetas de Mis mascotas: `PetGridCard`, `PetListRow`, `PetDetailCard` |
| `perdidas/ReportCard` | Reporte en cuadrícula (`ReportGridCard`) o lista (`ReportListRow`) |
| `mascotas/PetHealthTabs` / `carnet/CarnetItems` | Pestañas Salud/Historial y renglones del carnet |
| `tienda/PagoResultado` | Resultado del deep link de pago (éxito/cancelado) |

## Notas
- Forma de ver una lista (cuadrícula/lista/tarjetas): `ViewModeToggle` (solo íconos) + `useViewMode(clave, modos, porDefecto)`, que la recuerda; `useGridCell(gap)` da columnas (2 o 3 según el ancho) y ancho de celda. Los elementos con foto se pintan con `MediaCard` (cuadrícula) y `MediaRow` (lista).
- `SegmentedControl` cubre el caso de «pestañas segmentadas» (2–4 opciones): no hace falta otro componente.
- El QR (`react-native-qrcode-svg`) se dibuja **siempre negro sobre blanco** y el pin del mapa (`WebMapView`) lleva su
  estilo propio: son excepciones de legibilidad, no hex de estilo.
- Si un componente se crea antes de adoptarlo, knip lo marcará. Es el caso de `AuthShell`: U3 es **crear+adoptar**
  juntos (su primer paso es usarlo en las 4 pantallas de `(auth)`).

---

## Principio de reutilización (2026-10-17)

**Regla:** los componentes de `src/components/` son la ÚNICA fuente de estilo para sus elementos.
Al cambiar un componente, el cambio se refleja en **todas** las pantallas que lo usan.

| Componente | Para qué | En vez de |
|---|---|---|
| `Button` | Acciones (guardar, cancelar, enviar, agendar) | `TouchableOpacity` + `styles.saveBtn` |
| `ListRow` | Filas de lista/menú (icono + título + desc + chevron) | `TouchableOpacity` + fila custom |
| `Card` | Contenedores con borde y sombra | `View` con `borderRadius` y `borderWidth` |
| `FormField` | Campos de formulario | `TextInput` + label custom |
| `FilterChip` | Filtros en fila | `TouchableOpacity` + chip custom |
| `EmptyState` | Estados vacíos con una acción | `View` + texto + botón custom |
| `SectionHeader` | Títulos de sección | `Text` con estilo propio |

**Si necesitas un componente nuevo:** créalo en `src/components/`, usa tokens de `constants/design.ts`
(nunca hex sueltos) y reutilízalo. No copies estilos entre pantallas.

**Ejemplo de migración:**
```tsx
// ❌ Antes (estilo suelto, no se actualiza al cambiar Button)
<TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
  <Text style={styles.saveBtnText}>Guardar</Text>
</TouchableOpacity>

// ✅ Ahora (reutiliza Button, se actualiza solo)
<Button label="Guardar" onPress={handleSave} loading={isSaving} />
```
