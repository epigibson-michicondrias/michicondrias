---
name: auditar-modulo
description: Audita un módulo o flujo de la app móvil de Michicondrias (p. ej. adopciones, carnet, tienda) sin tocar código. Clasifica cada pantalla, hook y servicio en funciona / rota-incompleta / muerta, lo revisa contra el estándar premium de CLAUDE.md §3 y deja los hallazgos en AUDITORIA_MOBILE.md y el estado en PROGRESO_MOBILE.md. Úsala cuando el usuario pida auditar, revisar o analizar un módulo, flujo o pantallas de la app.
---

# Auditar un módulo de la app móvil

Solo lectura sobre el código. Lo único que se escribe son `AUDITORIA_MOBILE.md` y `PROGRESO_MOBILE.md`.

## 1. Inventario
- Pantallas: `mobile/app/<modulo>/**` (y pestañas o pantallas sueltas que entren en el flujo).
- Hooks: `mobile/src/hooks/<modulo>/`. Servicios: `mobile/src/services/<servicio>.ts`. Tipos: `mobile/src/types/`.
- Quién navega hacia aquí: `grep -rn "/<modulo>" mobile/app mobile/src` (router.push, href, `roleTools.ts`).
- Código muerto ya detectado: `cd mobile && npx knip --no-progress` y filtrar por el módulo.

## 2. Funcionalidad (por cada pantalla y cada acción)
- Sigue la cadena pantalla → hook → service → URL. Confirma que el endpoint existe en
  `backend/michicondrias_<servicio>/app/` (router + método + ruta + rol exigido).
- Clasifica:
  - **funciona**: la cadena existe completa y los tipos coinciden con el schema del backend.
  - **rota/incompleta**: endpoint inexistente o con otra forma, botón sin `onPress` real, datos simulados,
    falta invalidar queries tras mutar, sin manejo de error, rol del backend distinto al de `ROUTE_ACCESS`.
  - **muerta**: nadie navega a ella / nadie la importa (cruzar con knip y con el grep del paso 1).
- Si el backend local está disponible, prueba los GET con `curl`; si no, basta con leer el router.

## 3. UI/UX
- Revisa cada pantalla contra el checklist de `CLAUDE.md` §3 (usa la skill `review-ux` para las capturas si la
  app web está corriendo).
- Busca **redundancias**: la misma acción en dos lugares de la pantalla, dos pantallas que muestran lo mismo,
  pasos del flujo que se pueden fusionar, módulos con nombres distintos para lo mismo.
- Mide rápido: hex sueltos, `ActivityIndicator`, uso de tokens, número de líneas.

## 4. Registrar
En `AUDITORIA_MOBILE.md`, una sección por módulo con esta forma:

```
## <Módulo> — auditado AAAA-MM-DD
Flujo(s): paso → paso → paso

| Pieza | Tipo | Estado | Hallazgo |
|---|---|---|---|
| app/<modulo>/index.tsx | pantalla | funciona | 14 hex, spinner a pantalla completa |

Redundancias: …
Propuesta de rediseño (requiere visto bueno): …
Backend: endpoints faltantes o a ajustar …
Prioridad sugerida de arreglos: P0 (roto) → P1 (UX que confunde) → P2 (pulido visual)
```

En `PROGRESO_MOBILE.md`: estado del módulo a 🔍 y una línea en la Bitácora.

## 5. Cerrar
Resume al usuario lo más importante (roto primero) y la propuesta de rediseño si la hay. **No implementes nada**.
