# Original User Request

## Initial Request — 2026-06-17T02:27:37Z

El proyecto consiste en visualizar, documentar y homologar la disposición y diseño de los botones de regreso (navegación hacia atrás) en todas las pantallas de la aplicación móvil para asegurar consistencia visual y de experiencia de usuario (UX).

Working directory: /home/epigibson/Documentos/Desarrollos/michicondrias/mobile
Integrity mode: development

## Requirements

### R1. Auditoría y Visualización
Escanear todos los archivos de pantalla ubicados en `mobile/app` para identificar cómo está implementado el botón de regreso. Se debe generar un reporte detallado en markdown (`navigation_audit.md`) que liste cada pantalla, su estado actual de botón de regreso (ej. si usa un botón táctil ad-hoc, si no tiene botón de regreso, si usa `BackButton` o si usa `ScreenHeader`), y si requiere homologación.

### R2. Homologación y Refactorización
Modificar los archivos de pantalla identificados para unificar su comportamiento y diseño visual. Todas las pantallas con navegación hacia atrás deben utilizar exclusivamente:
- El componente `BackButton` importado de `@/src/components/BackButton`.
- O el prop/botón de retroceso integrado de `ScreenHeader` (que internamente debe comportarse o lucir consistente con la navegación de retroceso estándar).
No debe haber botones de regreso con estilos ad-hoc, íconos de retroceso personalizados o colores diferentes a los del tema del proyecto.

### R3. Validación
Asegurar que todas las pantallas modificadas mantengan compatibilidad de tipos con TypeScript y no rompan la compilación del proyecto móvil.

## Acceptance Criteria

### Reporte de Auditoría
- [ ] Se ha creado el archivo `navigation_audit.md` detallando el análisis de todas las pantallas en `mobile/app` y mapeando sus componentes de navegación de regreso.

### Unificación Visual
- [ ] Todas las pantallas refactorizadas utilizan el componente `BackButton` o el mecanismo de retroceso unificado de `ScreenHeader`.
- [ ] Se han eliminado todas las declaraciones ad-hoc de botones de regreso estilizados individualmente.

### Calidad del Código
- [ ] El comando `npx tsc --noEmit` se ejecuta exitosamente sin errores de compilación en el directorio `mobile`.
