# 🛰️ Centro de Comando: Dashboard Home

El Centro de Comando es la interfaz inicial donde el usuario obtiene una visión general de su ecosistema Michicondrias.

## Módulos de Comando

### 1. Sección de Bienvenida 🖖
Presenta un saludo cinemático con tipografía **Ultra-Bold** y un resumen del estado del usuario (roles y accesos directos).

### 2. KPIs de Administración 📊
Para usuarios con rol de administrador, se despliegan tarjetas de métricas con:
- Resplandor Neón dinámico según el valor.
- Tipografía `900` de peso para legibilidad inmediata.
- Fondo de cristal ahumado (`rgba(0,0,0,0.2)`) para resaltar los datos críticos.

### 3. Red de Acciones Rápidas (Quick Actions) ⚡
Un grid de tarjetas interactivas que permiten saltar a las funciones más usadas:
- **Mis Mascotas**: Acceso al carnet digital.
- **Tienda**: Gestión de productos y carrito.
- **Directorio**: Búsqueda de clínicas veterinaras.

## Animaciones de Entrada ✨
Hemos implementado una secuencia de `fadeIn` con `cubic-bezier(0.16, 1, 0.3, 1)` para que el contenido aparezca de forma fluida y elegante al cargar la página.
