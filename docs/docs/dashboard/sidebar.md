# 🛸 Sidebar: Premium Navigation

El Sidebar es el eje central de navegación de Michicondrias, diseñado con una estética **High-Fidelity Virtual Space**.

## Características Premium

### 1. Glassmorphism Profundo 💎
Utiliza un sistema de capas con `backdrop-filter: blur(40px)` y `rgba(255, 255, 255, 0.03)` para crear una sensación de profundidad y elegancia espacial.

### 2. Iconografía SVG de Alta Fidelidad 🛰️
Adiós a los emojis convencionales. Hemos implementado un sistema de iconos vectoriales personalizados con:
- `strokeWidth: 2.5` para mayor claridad.
- Colores reactivos al estado del enlace.
- Animación de escalado y rotación en hover.

### 3. Arquitectura de Roles 🛡️
El Sidebar detecta automáticamente el rol del usuario y muestra solo los módulos pertinentes:
- **Admin**: Dashboard completo, Moderación, Gestión de Usuarios.
- **Consumidor**: Mis Mascotas, Tienda, Directorio.
- **Invitado**: Acceso limitado a búsqueda y visualización pública.

## Interacción
- **Hover Dinámico**: Cada enlace tiene un resplandor neón (`cyan` a `violet`) y un desplazamiento sutil de `4px` hacia la derecha.
- **Estado Activo**: El módulo actual se resalta con un gradiente lineal y un indicador de foco persistente.
