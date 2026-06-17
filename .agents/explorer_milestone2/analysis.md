# Back Navigation Analysis & Homogenization Recommendations (Milestone 2)

## Executive Summary
This report analyzes back navigation implementation in three targeted screens (`forgot-password.tsx`, `register.tsx`, and `adopciones/[id].tsx`) and provides precise, line-by-line recommendations to replace custom back buttons with the standard `BackButton` component. Refactoring these screens will achieve style consistency and code standardization, improving maintenance and visual alignment across the application.

---

## Current Implementations Summary

| Screen File | Current Back Button Element | Navigation Call | Icon Used | Styling Method & Variables | Recommendation |
|:---|:---|:---|:---|:---|:---|
| `mobile/app/forgot-password.tsx` | Custom `TouchableOpacity` | `router.back()` | `ArrowLeft` (size 22, custom colors) | `styles.backBtn` (44x44, radius 14) with inline background opacity | Replace with standard `BackButton`, keep margin style, reuse router back handler. |
| `mobile/app/register.tsx` | Custom `TouchableOpacity` | `router.back()` | `ArrowLeft` (size 22, custom colors) | `styles.backBtn` (44x44, radius 14) with inline background opacity | Replace with standard `BackButton`, keep margin style, reuse router back handler. |
| `mobile/app/adopciones/[id].tsx` | Custom `TouchableOpacity` overlay | `goBack` (from hook) | `ChevronLeft` (size 24, `#fff`) | `styles.glassBtn` (44x44, radius 22, dark translucent background) | Replace with standard `BackButton`, pass `styles.glassBtn` for overlay style parity. |

---

## Detailed File-by-File Analysis & Recommendations

### 1. File: `mobile/app/forgot-password.tsx`

#### A. Observations
* **Imports (Lines 1-10):** Uses `ArrowLeft` from `lucide-react-native`.
* **JSX (Lines 67-72):**
  ```tsx
  <TouchableOpacity
      style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
      onPress={() => router.back()}
  >
      <ArrowLeft size={22} color={isDark ? '#fff' : '#334155'} />
  </TouchableOpacity>
  ```
* **Styling (Lines 209-213):**
  ```typescript
  backBtn: {
      width: 44, height: 44, borderRadius: 14,
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 20,
  },
  ```

#### B. Recommendation
1. **Import Changes**: 
   - Add the standard `BackButton` import at the top using the `@/` path alias:
     ```typescript
     import BackButton from '@/src/components/BackButton';
     ```
   - Remove the unused `ArrowLeft` icon from the `lucide-react-native` import statement (Line 5).
2. **JSX Replacement**:
   - Replace the custom `TouchableOpacity` block (Lines 67-72) with:
     ```tsx
     {/* Back button */}
     <BackButton
         onPress={() => router.back()}
         style={styles.backBtn}
     />
     ```
3. **Style Adjustments**:
   - Since the standard `BackButton` already defines the layout properties (`width: 42`, `height: 42`, `borderRadius: 14`, `justifyContent: 'center'`, and `alignItems: 'center'`) and dynamically controls the background color via `theme.overlayHover`, the target style object in `StyleSheet.create` (Lines 209-213) should be reduced to only containing the margin property to preserve layout parity:
     ```typescript
     backBtn: {
         marginBottom: 20,
     },
     ```

---

### 2. File: `mobile/app/register.tsx`

#### A. Observations
* **Imports (Lines 1-10):** Uses `ArrowLeft` from `lucide-react-native`.
* **JSX (Lines 72-77):**
  ```tsx
  <TouchableOpacity
      style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}
      onPress={() => router.back()}
  >
      <ArrowLeft size={22} color={isDark ? '#fff' : '#334155'} />
  </TouchableOpacity>
  ```
* **Styling (Lines 222-226):**
  ```typescript
  backBtn: {
      width: 44, height: 44, borderRadius: 14,
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 20,
  },
  ```

#### B. Recommendation
1. **Import Changes**: 
   - Add the standard `BackButton` import at the top using the `@/` path alias:
     ```typescript
     import BackButton from '@/src/components/BackButton';
     ```
   - Remove the unused `ArrowLeft` icon from the `lucide-react-native` import statement (Line 6).
2. **JSX Replacement**:
   - Replace the custom `TouchableOpacity` block (Lines 72-77) with:
     ```tsx
     {/* Back button */}
     <BackButton
         onPress={() => router.back()}
         style={styles.backBtn}
     />
     ```
3. **Style Adjustments**:
   - Reduce the target style object in `StyleSheet.create` (Lines 222-226) to only include the margin property:
     ```typescript
     backBtn: {
         marginBottom: 20,
     },
     ```

---

### 3. File: `mobile/app/adopciones/[id].tsx`

#### A. Observations
* **Imports (Lines 1-10):** Uses `ChevronLeft` from `lucide-react-native`.
* **JSX (Lines 41-45):**
  ```tsx
  <View style={styles.headerNav}>
      <TouchableOpacity style={styles.glassBtn} onPress={goBack}>
          <ChevronLeft size={24} color="#fff" />
      </TouchableOpacity>
      ...
  ```
* **Styling (Lines 211-218):**
  ```typescript
  glassBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  ```

#### B. Recommendation
1. **Import Changes**:
   - Add the standard `BackButton` import at the top using the `@/` path alias:
     ```typescript
     import BackButton from '@/src/components/BackButton';
     ```
   - Remove `ChevronLeft` from the `lucide-react-native` import statement (Line 9), as it is no longer used directly in this file.
2. **JSX Replacement**:
   - Replace the custom `TouchableOpacity` (Lines 42-44) with:
     ```tsx
     <BackButton
         onPress={goBack}
         color="#fff"
         style={styles.glassBtn}
     />
     ```
3. **Style Adjustments & Parity Preservation**:
   - The custom button needs to preserve its circular aspect (`borderRadius: 22`, which is half of its `44` width/height) and semi-translucent dark background overlay style over the hero image.
   - By passing `style={styles.glassBtn}` to `BackButton`, the standard button merges style props in order: `style={[styles.btn, { backgroundColor: theme.overlayHover }, style]}`.
   - This means `styles.glassBtn` successfully overrides the standard width (`44` vs `42`), height (`44` vs `42`), border radius (`22` vs `14`), and background color (`rgba(0,0,0,0.5)` vs `theme.overlayHover`).
   - The `color` prop is passed as `"#fff"`, overriding the default text/dark color inside the icon.
   - This maintains 100% visual parity and positioning while adopting the standardized button wrapper. No changes to the `glassBtn` stylesheet style definition are required.
