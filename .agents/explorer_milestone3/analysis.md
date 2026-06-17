# Analysis Report: Custom Back Buttons & Screen Headers Homogenization

This report details the read-only investigation and precise recommendations for replacing custom back buttons and navigation elements in 6 mobile app screens with standard `BackButton` or `ScreenHeader` components.

---

## 1. Executive Summary & Overview
Across the 6 target screens in the `mobile/app/` directory, back navigation is currently implemented using ad-hoc `TouchableOpacity` elements with raw `ChevronLeft` icons from `lucide-react-native` and direct router calls (`router.back()` or `goBack()`). In one instance (`perfil/partner.tsx`), there is no top header back button at all.

Using custom UI for back buttons causes design inconsistency, ignores theme-specific overlay styles, and increases maintenance costs.
Our recommendations prioritize:
1. **Standard `ScreenHeader`** where the screen uses a full-width header with title/subtitle (improving UX by keeping headers sticky at the top and standardizing padding).
2. **Standard `BackButton`** where the button is styled as an absolute overlay (e.g., on top of cover images/avatars) or integrated into customized layout containers (preserving custom layouts and unique theme assets).

---

## 2. API Reference of Standard Components

### A. `BackButton`
- **Source Path:** `mobile/src/components/BackButton.tsx`
- **Import Alias:** `@/src/components/BackButton`
- **Properties:**
  ```typescript
  interface BackButtonProps {
      onPress?: () => void;
      color?: string; // Overrides the icon color (default: theme.text)
      style?: any;    // Merged with the default button style (width: 42, height: 42, borderRadius: 14)
  }
  ```
- **Parity Note:** The standard `BackButton` defaults to using `ChevronLeft` (size 22, strokeWidth 2.5) and uses `theme.overlayHover` as the default background.

### B. `ScreenHeader`
- **Source Path:** `mobile/src/components/layout/ScreenHeader.tsx`
- **Import Alias:** `@/src/components/layout/ScreenHeader`
- **Properties:**
  ```typescript
  interface ScreenHeaderProps {
      title: string;
      subtitle?: string;
      showBack?: boolean;                                          // Default: true
      onBack?: () => void;                                         // Default: router.back()
      actionIcon?: React.ComponentType<{ size: number; color: string }>;
      onAction?: () => void;
      rightElement?: React.ReactNode;
      leftElement?: React.ReactNode;
      gradient?: string[];
  }
  ```

---

## 3. Detailed File Analysis & Recommendations

### File 1: `mobile/app/directorio/clinica/[id].tsx`

* **Current Implementation:**
  - **Back Navigation:** Custom `TouchableOpacity` overlay inside the header view (lines 28–30), calling `router.back()`.
  - **Icon:** Raw `<ChevronLeft size={24} color="#fff" />`.
  - **Styles:** `backBtn` styling is positioned absolutely on top of the cover image:
    ```typescript
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    }
    ```
* **Homogenization Recommendation:** Replace the custom button with the standard `BackButton`.
* **Imports Change:**
  - Add: `import BackButton from '@/src/components/BackButton';`
  - Remove `ChevronLeft` from `lucide-react-native` import if not used elsewhere.
* **JSX Replacement:**
  *Before:*
  ```tsx
  <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
      <ChevronLeft size={24} color="#fff" />
  </TouchableOpacity>
  ```
  *After:*
  ```tsx
  <BackButton
      onPress={() => router.back()}
      color="#fff"
      style={styles.backBtn}
  />
  ```
* **Style Parity Preservation:**
  The `style` prop passed to `BackButton` merges with its default stylesheet. The custom `styles.backBtn` will override default dimensions (`width: 44`, `height: 44`, `borderRadius: 12`) and apply `position: 'absolute'` on the image overlay. Icon color `#fff` is preserved through the `color` prop.

---

### File 2: `mobile/app/directorio/especialista/[id].tsx`

* **Current Implementation:**
  - **Back Navigation:** Custom `TouchableOpacity` overlay inside the header (lines 23–25), calling `router.back()`.
  - **Icon:** Raw `<ChevronLeft size={24} color={theme.text} />`.
  - **Styles:** Absolutely positioned on top of the profile header:
    ```typescript
    backBtn: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    }
    ```
* **Homogenization Recommendation:** Replace the custom button with the standard `BackButton`.
* **Imports Change:**
  - Add: `import BackButton from '@/src/components/BackButton';`
  - Remove `ChevronLeft` from `lucide-react-native` import if not used elsewhere.
* **JSX Replacement:**
  *Before:*
  ```tsx
  <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
      <ChevronLeft size={24} color={theme.text} />
  </TouchableOpacity>
  ```
  *After:*
  ```tsx
  <BackButton
      onPress={() => router.back()}
      color={theme.text}
      style={styles.backBtn}
  />
  ```
* **Style Parity Preservation:**
  Custom dimensions and absolute positioning are preserved. The standard `BackButton` receives `theme.text` for the chevron icon color.

---

### File 3: `mobile/app/directorio/nuevo.tsx`

* **Current Implementation:**
  - **Back Navigation:** Custom header view containing a custom back button, a title ("Registrar Negocio"), and a subtitle (lines 54–60).
  - **Icon:** Raw `<ChevronLeft size={24} color={theme.text} />`.
  - **Styles:** Custom header block nested inside the `ScrollView`.
* **Homogenization Recommendation:** Replace the entire custom header block with standard `ScreenHeader` and place it outside the `ScrollView` (directly under `KeyboardAvoidingView`).
* **Imports Change:**
  - Add: `import ScreenHeader from '@/src/components/layout/ScreenHeader';`
  - Remove `ChevronLeft` from `lucide-react-native` import if not used elsewhere.
* **JSX Replacement:**
  *Before:*
  ```tsx
  <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ChevronLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Registrar Negocio</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Únete a la red médica de Michicondrias</Text>
      </View>
  ```
  *After:*
  ```tsx
  <ScreenHeader
      title="Registrar Negocio"
      subtitle="Únete a la red médica de Michicondrias"
  />
  <ScrollView showsVerticalScrollIndicator={false}>
  ```
* **Style Parity Preservation:**
  - The custom header view is completely replaced by `ScreenHeader`.
  - The stylesheet entries `header`, `backBtn`, `title`, and `subtitle` can be safely deleted as they are no longer referenced.
  - Putting `ScreenHeader` outside the `ScrollView` conforms to the standardized layout of other screens in the app, making the header sticky when scrolling.

---

### File 4: `mobile/app/perdidas/index.tsx`

* **Current Implementation:**
  - **Back Navigation:** Custom header bar with custom back button (`ChevronLeft`), center title ("Mascotas Perdidas"), right actions button (`Plus` for creating a new report), and a subtitle (lines 110–129).
  - **Theme styling:** Custom colors optimized for a red "alert/urgency" theme and layout nested inside the `ScrollView`.
* **Homogenization Recommendation:** Replace only the custom back button with the standard `BackButton` to preserve the custom red theme colors, the right-aligned `plusBtn` action, and the scrolling layout that coordinates with the underlying top gradient.
* **Imports Change:**
  - Add: `import BackButton from '@/src/components/BackButton';`
  - Remove `ChevronLeft` from `lucide-react-native` import if not used elsewhere.
* **JSX Replacement:**
  *Before:*
  ```tsx
  <TouchableOpacity
      style={[styles.backBtn, { backgroundColor: theme.overlayHover }]}
      onPress={() => router.back()}
  >
      <ChevronLeft size={22} color={theme.text} />
  </TouchableOpacity>
  ```
  *After:*
  ```tsx
  <BackButton
      onPress={() => router.back()}
  />
  ```
* **Style Parity Preservation:**
  The standard `BackButton` uses `theme.overlayHover` for its background and `theme.text` for its icon by default. The dimensions match exactly, enabling a seamless drop-in replacement without modifying stylesheet rules.

---

### File 5: `mobile/app/perfil/partner.tsx`

* **Current Implementation:**
  - **Back Navigation:** No top header back button exists. Instead, it has a simple centered text header (lines 128–133) and a "Cancelar" text button at the bottom (lines 167–174) calling `router.back()`.
  - **Root Layout:** Root element is `ScrollView`.
* **Homogenization Recommendation:**
  Wrap the main UI in a `ScreenContainer` and introduce the standard `ScreenHeader` at the top of the screen (replacing the plain header view). The bottom "Cancelar" text button can remain as an additional option, or be removed.
* **Imports Change:**
  - Add: `import ScreenContainer from '@/src/components/layout/ScreenContainer';`
  - Add: `import ScreenHeader from '@/src/components/layout/ScreenHeader';`
* **JSX Replacement:**
  *Before:*
  ```tsx
  return (
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>🚀 Conviértete en Partner</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Desbloquea herramientas profesionales y genera ingresos con Michicondrias
              </Text>
          </View>
  ```
  *After:*
  ```tsx
  return (
      <ScreenContainer>
          <ScreenHeader
              title="🚀 Conviértete en Partner"
              subtitle="Desbloquea herramientas profesionales y genera ingresos con Michicondrias"
          />
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
  ```
* **Style Parity Preservation:**
  - The custom header view is completely replaced by `ScreenHeader`.
  - The stylesheet entries `header`, `title`, and `subtitle` can be safely deleted as they are no longer referenced.
  - Adding `ScreenContainer` establishes standard page background colors and padding.

---

### File 6: `mobile/app/tienda/producto/[id].tsx`

* **Current Implementation:**
  - **Back Navigation:** Custom circular `TouchableOpacity` overlay inside the product image gallery container (lines 42–49), side-by-side with a "Heart" favorite action button.
  - **Action:** Calls `goBack` (retrieved from `useProduct()` hook).
  - **Styles:** Circular button styles:
    ```typescript
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    }
    ```
* **Homogenization Recommendation:** Replace the custom back button with the standard `BackButton`.
* **Imports Change:**
  - Add: `import BackButton from '@/src/components/BackButton';`
  - Remove `ChevronLeft` from `lucide-react-native` import if not used elsewhere.
* **JSX Replacement:**
  *Before:*
  ```tsx
  <TouchableOpacity style={[styles.circleBtn, { backgroundColor: theme.border, borderColor: theme.border }]} onPress={goBack}>
      <ChevronLeft size={24} color={theme.text} />
  </TouchableOpacity>
  ```
  *After:*
  ```tsx
  <BackButton
      onPress={goBack}
      color={theme.text}
      style={[styles.circleBtn, { backgroundColor: theme.border, borderColor: theme.border }]}
  />
  ```
* **Style Parity Preservation:**
  The `style` array passed to `BackButton` overrides its standard size and border radius (`width: 44`, `height: 44`, `borderRadius: 22`) to perfectly preserve the circular overlay style matching the adjacent favorite button.

---

## 4. Verification & Validation Steps
To verify changes after implementation:
1. **Compilation/Build Check:**
   - Execute `npx tsc --noEmit` in the `/mobile` directory to ensure all TS/TSX types resolve successfully.
2. **Visual Inspection:**
   - Run the app via Expo Metro Bundler.
   - Navigate to each of the 6 screens to check:
     - Header layout positioning under status bar (Safe Area Insets integration).
     - Standard light/dark mode compliance for header titles and back chevrons.
     - Sticky header behavior when scrolling the forms in `NuevoRegistro` and `PartnerOnboarding`.
     - Exact alignment and styling of circular overlay back buttons on detail screens.
