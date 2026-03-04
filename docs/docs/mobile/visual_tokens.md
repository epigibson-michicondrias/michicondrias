# 🎨 Mobile Visual Tokens (Web to RN)

Guía de traducción de estilos CSS Premium (Web) a componentes de React Native para mantener el "Look & Feel" de Michicondrias.

## 1. Glassmorphism (Vidrio Esmerilado)
**Web (CSS):**
```css
backdrop-filter: blur(25px);
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.05);
```
**Mobile (React Native):**
- Usar `@react-native-community/blur` para el efecto de desenfoque.
- Componente `BlurView` con intensidad `dark`.

## 2. Neon Glow (Resplandor Neón)
**Web (CSS):**
```css
box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
color: #a78bfa;
```
**Mobile (React Native):**
- Usar `shadowColor`, `shadowOffset`, `shadowOpacity` y `shadowRadius` (iOS).
- Usar gradientes radiales (`react-native-radial-gradient`) para simular el aura neón en Android.

## 3. Animaciones Cinemáticas
**Web (CSS):**
```css
transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
```
**Mobile (React Native):**
- Usar `react-native-reanimated`.
- Aplicar `withTiming` con una curva `Easing.bezier(0.16, 1, 0.3, 1)` para la entrada de los módulos.

## 4. Iconografía
- **Sistema**: Lucide React Native o SVGs directos mediante `react-native-svg`.
- **Estilo**: `strokeWidth: 2.5` y colores basados en los tokens de la webapp (Violeta, Cian, Neón).
