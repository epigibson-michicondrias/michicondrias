# 📱 Mobile Parity Matrix: Web to React Native

Esta especificación garantiza que la futura aplicación móvil de Michicondrias sea una réplica exacta en funcionalidad y estética de la WebApp Premium.

## 1. Módulos y Funcionalidades Críticas

| Módulo Web | Requisito Mobile (React Native) | Estado |
| :--- | :--- | :--- |
| **Sidebar Premium** | Drawer Navigator con `blur` y SVG icons | Obligatorio |
| **Centro de Comando** | Dashboard con KPI Cards animados y Neon Borders | Obligatorio |
| **Pasaportes Digitales** | Listado de mascotas con Glassmorphism y ID Chips | Obligatorio |
| **Michi-Explorer** | Command Palette Modal con búsqueda en tiempo real | Obligatorio |
| **Notificaciones** | Campana con badge neón y Push Notifications | Obligatorio |

## 2. Comportamiento Funcional (Feature Parity)

### Dashboard Home
- **Admin KPIs**: Deben obtener datos del mismo servicio `analytics.ts` y mostrar gradientes dinámicos.
- **Quick Actions**: Navegación táctil optimizada con `Pressable` y feedback háptico.

### Mis Mascotas (Pasaportes)
- **ID Card Layout**: El diseño de "Pasaporte" debe mantenerse. El PET ID y el campo CHIP son obligatorios.
- **Status Chips**: Los efectos de brillo (Glow) deben replicarse usando `react-native-shadow-2` o similar.

### Michi-Explorer
- **Trigger**: Botón de búsqueda flotante o en el Header.
- **Shortcuts**: Aunque no hay Ctrl+K, el modal debe ser instantáneo y filtrar Mascotas, Clínicas y Productos usando los mismos servicios de `lib/services`.

## 3. Integración de Datos
La App Móvil DEBE usar la misma arquitectura de `apiFetch` definida en `src/lib/api.ts` para garantizar que los datos estén sincronizados en tiempo real entre ambas plataformas.
