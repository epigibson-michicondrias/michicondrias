# Auditoría — App móvil

Hallazgos detallados por módulo (Fase 1) y resultados de las herramientas. El estado resumido vive en
[`PROGRESO_MOBILE.md`](PROGRESO_MOBILE.md); los criterios en [`CLAUDE.md`](CLAUDE.md) §4.

Clasificación de cada pieza: **funciona** · **rota/incompleta** · **muerta**.
Prioridad de hallazgos: **P0** roto/bloquea · **P1** confunde o se ve mal · **P2** pulido.

---

## Resultados de herramientas (2026-10-07)

Regenerar con `cd mobile && npm run deadcode`, `npx eslint .` y `npm run doctor`.

### knip — código muerto
Resumen: 29 archivos sin uso · 6 dependencias sin uso · 147 exports sin uso · 71 tipos exportados sin uso ·
1 export duplicado. **Verificar cada uno antes de borrar** (Fase 2): knip no ve imports dinámicos ni rutas que se
abren por string desde notificaciones del backend.

**Archivos sin uso (29)**
- Componentes: `src/components/ScreenHeader.tsx` (todas usan `layout/ScreenHeader`), `src/components/FormField.tsx`
  (⚠️ CLAUDE.md lo lista como base: decidir si se adopta o se borra), `components/useColorScheme.web.ts`.
- Hooks: `src/hooks/useSearch.ts`; barrels `index.ts` de `funerary`, `notifications`, `petfriendly`, `rides`,
  `search`, `sponsors`.
- Estilos/utilidades: `src/styles/common.ts`, `src/utils/index.ts`, `src/utils/validators.ts` (⚠️ útil para la
  validación de formularios de la Fase 5; valorar adoptarlo en vez de borrarlo).
- Tipos: `src/types/index.ts` y 17 archivos de `src/types/` (`admin`, `carnet`, `citas`, `common`, `cuidadores`,
  `ecommerce`, `funerary`, `grooming`, `insurance`, `notifications`, `paseadores`, `petfriendly`, `sponsors`,
  `training`, `venues`). Indica que **los servicios definen sus propios tipos** en lugar de usar `src/types/`:
  hay que decidir una sola fuente (ver Decisiones pendientes).

**Dependencias sin uso (6)**: `@expo/cli`, `@teovilla/react-native-web-maps`, `axios`, `expo-symbols`,
`expo-web-browser`, `react-native-get-location`. Varias son nativas → quitarlas cambia el APK (agrupar con Fase 5).
`@teovilla/react-native-web-maps` además trae un `expo-location@15` duplicado (ver expo-doctor).

**Exports sin uso (147)**: la mayoría son re-exports de los barrels `src/hooks/<modulo>/index.ts` (las pantallas
importan el hook directo, no del barrel) y helpers de `src/constants/roles.ts` (`isAdmin`, `isVeterinario`,
`ROLE_EMOJIS`, …). También: `accents` y `motion` en `constants/design.ts` (tokens definidos y no usados),
`SkeletonCard`, `useAdminOrders`, `useSubcategories`, `useAlerts`, `usePatients`.
Export duplicado: `Skeleton` se exporta como nombrado y como `default`.

### ESLint (`eslint-config-expo`)
12 errores · 219 advertencias. Por regla:

| Regla | Cantidad |
|---|---|
| `@typescript-eslint/no-unused-vars` | 193 |
| `react/no-unescaped-entities` | 11 |
| `import/no-duplicates` | 10 |
| `no-unused-expressions` | 6 |
| `react-hooks/exhaustive-deps` | 3 |
| `import/first` | 2 |
| `react-hooks/rules-of-hooks` | 1 ⚠️ (puede causar bugs reales; revisar en Fase 1) |
| otras | 6 |

### expo-doctor
18/20 checks OK. Fallan:
- **Duplicado nativo**: `expo-location@15.1.1` dentro de `@teovilla/react-native-web-maps` (dependencia sin uso según
  knip) → quitar esa dependencia lo resuelve.
- **13 paquetes con parche atrasado** dentro de SDK 55 (`expo` 55.0.26 → ~55.0.31, `react-native` 0.83.6 → 0.83.10,
  `expo-router`, `expo-updates`, …). Son nativos → actualizar con `npx expo install --check` junto con el APK de la
  Fase 5.

---

## Módulos

Plantilla (la llena la skill `auditar-modulo`):

```
## <Módulo> — auditado AAAA-MM-DD
Flujo(s): paso → paso → paso

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|

Redundancias: …
Propuesta de rediseño (requiere visto bueno): …
Backend: …
Arreglos: - [ ] P0 … - [ ] P1 … - [ ] P2 …
```

_(aún no hay módulos auditados)_
