---
name: review-ux
description: Revisión de UI/UX de pantallas de la app móvil de Michicondrias con capturas reales en el navegador integrado (375x812, tema claro y oscuro). Revisa estados de carga/vacío/error, jerarquía, botones redundantes, safe areas, objetivos táctiles, contraste, consistencia con el design system y textos. Úsala para revisar, criticar o validar visualmente una o varias pantallas, o al terminar de rediseñarlas.
---

# Revisión UX con capturas

## Preparar
1. Levantar la web: `cd mobile && npx expo start --web --port 3000` (en segundo plano, o con `preview_start` si existe
   una entrada en `.claude/launch.json`).
2. Abrir `http://localhost:3000` en el navegador integrado y emular móvil (`resize_window` preset `mobile`).
3. Si la pantalla exige sesión o rol, usar credenciales de prueba del proyecto (nunca reales). Si no hay, pedir al
   usuario que inicie sesión él en el panel.

## Capturar
Por cada pantalla: tema **claro** y **oscuro** (`resize_window` con `colorScheme`), y si se puede forzar, los estados
vacío y error. Usa `get_page_text`/`read_page` para verificar textos en vez de leerlos de la imagen.

## Checklist
**Jerarquía y acciones**
- ¿Se entiende en 3 segundos para qué es la pantalla?
- Una sola acción primaria y es la más visible. ¿Hay acciones repetidas (header + FAB + tarjeta)?
- ¿Cada botón hace algo? ¿Hay salida (back)?

**Estados**
- Carga: skeleton con forma del contenido, no spinner en blanco.
- Vacío: `EmptyState` con mensaje útil y una acción.
- Error: banner con reintentar; nada de "Error 500" o JSON.
- Botones con `loading` durante envíos.

**Visual / design system**
- Colores del tema (nada que se vea mal en oscuro: texto negro sobre fondo oscuro, blancos quemados).
- Espaciado consistente con `constants/design.ts`; alineaciones; tamaños de tipografía de la escala `type`.
- Íconos de un solo set y tamaño consistente. Imágenes con placeholder y proporción correcta.
- Safe areas: nada tapado por notch ni por la tab bar. Teclado no tapa inputs.

**Accesibilidad**
- Objetivos táctiles ≥ 44 px. Contraste legible. `accessibilityLabel` en botones solo-ícono.

**Copy**
- Español natural, consistente (tú/usted), sin jerga técnica, botones con verbo ("Guardar mascota", no "OK").

## Reportar
Por pantalla: captura(s) + hallazgos priorizados **P0** (roto/bloquea) · **P1** (confunde o se ve mal) ·
**P2** (pulido). Indicar archivo y, si se puede, la línea. Anotar el resultado en `PROGRESO_MOBILE.md`.
