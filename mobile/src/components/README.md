# Kit de componentes

Piezas base de la app. **Regla de oro:** si un patrón de UI se repite, se extrae aquí y se reutiliza; no se copian
estilos entre pantallas. Los colores salen de `useTheme()` (`@/src/hooks/useTheme`) y las medidas/tipografía de
`@/constants/design` (`spacing`, `radius`, `type`, `shadow`, `layout`, `accents`). Nada de `constants/Colors`, hex
sueltos ni `fontSize` inventados.

## Layout
| Componente | Para qué |
|---|---|
| `layout/ScreenContainer` | Contenedor de **toda** pantalla. Incluye `QueryErrorBanner` (reintentar) |
| `layout/ScreenHeader` | Título con volver. `onHero`/`gradient` pinta la cabecera con `heroGradient` del tema |
| `KeyboardScreen` | Formularios con scroll y teclado (campos sin tapar) |
| `AuthShell` | Esqueleto de las pantallas de `(auth)`: degradado, teclado y scroll (lo usa U3) |
| `RoleGuard` | Protege pantallas pro/admin según `ROUTE_ACCESS` de `roleTools` |

## Acciones y contenido
| Componente | Para qué |
|---|---|
| `Button` | Acción. `variant` primary/secondary/ghost/danger/gold · `size` · `loading` · `icon` · `fullWidth` |
| `Card` | Tarjeta (`onPress` la hace tocable, `elevated`, `flush`) |
| `ListRow` | Fila de menú/ajustes: `icon`, `label`, `desc`, `badge`, `destructive` |
| `SectionHeader` | Título de sección con `overline`/`icon` y acción opcional |
| `Badge` / `FilterChip` | Etiqueta de estado / chip de filtro |
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
| `mascotas/PetHealthTabs` / `carnet/CarnetItems` | Pestañas Salud/Historial y renglones del carnet |
| `tienda/PagoResultado` | Resultado del deep link de pago (éxito/cancelado) |

## Notas
- `SegmentedControl` cubre el caso de «pestañas segmentadas» (2–4 opciones): no hace falta otro componente.
- El QR (`react-native-qrcode-svg`) se dibuja **siempre negro sobre blanco** y el pin del mapa (`WebMapView`) lleva su
  estilo propio: son excepciones de legibilidad, no hex de estilo.
- Si un componente se crea antes de adoptarlo, knip lo marcará. Es el caso de `AuthShell`: U3 es **crear+adoptar**
  juntos (su primer paso es usarlo en las 4 pantallas de `(auth)`).
