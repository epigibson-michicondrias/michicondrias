# Analysis & Recommendation: BackButton Standardization in `petfriendly/[id].tsx`

This report analyzes the back navigation button in `mobile/app/petfriendly/[id].tsx` and details the exact recommendation for replacing it with the standard `BackButton` component from `mobile/src/components/BackButton.tsx`.

---

## 1. Current Back Navigation Analysis

- **File Path**: `mobile/app/petfriendly/[id].tsx`
- **Navigation Hook**: Uses the custom hook `usePlaceDetail` from `@/src/hooks/petfriendly/usePlaceDetail`, which exposes the `goBack` function for navigating back:
  ```typescript
  const { place, isLoading, openMap, callPlace, openWebsite, goBack } = usePlaceDetail();
  ```
- **Custom Back Button**: Renders a custom overlay button using React Native's `TouchableOpacity` containing a `ChevronLeft` icon:
  ```typescript
  <TouchableOpacity style={styles.circleBtn} onPress={goBack}>
      <ChevronLeft size={24} color="#fff" />
  </TouchableOpacity>
  ```
- **Styling Details**:
  - The overlay wrapper has the following styles:
    ```typescript
    topOverlay: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ```
  - The button itself (`circleBtn`) uses a semi-transparent circular style:
    ```typescript
    circleBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ```
  - The icon color is `#fff` (white) and the size is `24`.

---

## 2. Standardization & Style Parity Strategy

To achieve homogenization, we will replace the custom button with the standard `BackButton` component:
- **Import Path**: `@/src/components/BackButton` (physical file: `mobile/src/components/BackButton.tsx`).
- **Internal styles of `BackButton`**:
  ```typescript
  export default function BackButton({ onPress, color, style }: BackButtonProps) {
      const { colorScheme } = useTheme();
      const theme = Colors[colorScheme];

      return (
          <TouchableOpacity
              style={[styles.btn, { backgroundColor: theme.overlayHover }, style]}
              onPress={onPress}
              activeOpacity={0.7}
          >
              <ChevronLeft size={22} color={color || theme.text} strokeWidth={2.5} />
          </TouchableOpacity>
      );
  }
  ```
- **Parity Preservation**:
  - Since `BackButton` merges the `style` prop at the end of its style array (`style={[styles.btn, { backgroundColor: theme.overlayHover }, style]}`), passing `style={styles.circleBtn}` will override the default width (`42` $\rightarrow$ `48`), height (`42` $\rightarrow$ `48`), borderRadius (`14` $\rightarrow$ `24`), and background color (`theme.overlayHover` $\rightarrow$ `'rgba(0,0,0,0.3)'`).
  - Passing `color="#fff"` will set the chevron icon color to white.
  - The chevron size will change from `24` to `22` (hardcoded inside `BackButton`), which matches the design standard of the application.
  - The action `onPress={goBack}` preserves the navigation handler correctly.

---

## 3. Migration Recommendation

### Import Modifications
1. Add standard `BackButton` import:
   ```typescript
   import BackButton from '@/src/components/BackButton';
   ```
2. Remove `ChevronLeft` from the `lucide-react-native` import list to prevent unused import warnings:
   - **Before**:
     ```typescript
     import { ChevronLeft, MapPin, Phone, Globe, Star, Check, Bone, Info, Share2, Clock } from 'lucide-react-native';
     ```
   - **After**:
     ```typescript
     import { MapPin, Phone, Globe, Star, Check, Bone, Info, Share2, Clock } from 'lucide-react-native';
     ```

### JSX Modifications
- **Before** (Lines 33–35):
  ```typescript
  <TouchableOpacity style={styles.circleBtn} onPress={goBack}>
      <ChevronLeft size={24} color="#fff" />
  </TouchableOpacity>
  ```
- **After**:
  ```typescript
  <BackButton onPress={goBack} color="#fff" style={styles.circleBtn} />
  ```

---

## 4. Verification Method

To verify the migration independently:
1. Navigate to the `mobile` workspace directory:
   ```bash
   cd mobile
   ```
2. Run Typecheck validation to verify correct component integration and imports:
   ```bash
   npx tsc --noEmit
   ```
3. Run the development environment / tests to confirm compile-time success.
