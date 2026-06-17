# Project: Mobile App Back Navigation Button Homogenization

## Architecture
This project focuses on auditing and refactoring back navigation buttons across all screen files in the React Native / Expo Router app located in `mobile/app`.

The mobile app currently utilizes two approved methods for back navigation UI:
1. **BackButton Component**: A standalone, touchable button rendering a left chevron icon.
   - Path: `mobile/src/components/BackButton.tsx`
   - Import: `@/src/components/BackButton` (or relative path)
   - Props:
     ```typescript
     interface BackButtonProps {
         onPress?: () => void;
         color?: string;
         style?: any;
     }
     ```
2. **ScreenHeader Component**: A standardized screen header with built-in back navigation support.
   - Path: `mobile/src/components/layout/ScreenHeader.tsx`
   - Import: `@/src/components/layout/ScreenHeader` (or relative path)
   - Props (relevant to navigation):
     ```typescript
     interface ScreenHeaderProps {
         title: string;
         subtitle?: string;
         showBack?: boolean; // Default is true
         onBack?: () => void; // Default router.back()
         // other properties...
     }
     ```

## Code Layout
- Screens directory: `mobile/app/`
- Component directories:
  - `mobile/src/components/BackButton.tsx`
  - `mobile/src/components/layout/ScreenHeader.tsx`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Navigation Audit & Report | Scan all screens in `mobile/app` and generate `navigation_audit.md` | None | DONE |
| 2 | Homogenization Batch 1 | Refactor root, (tabs), admin, and adopciones modules | M1 | DONE |
| 3 | Homogenization Batch 2 | Refactor carnet, directorio, perdidas, perfil, and tienda modules | M1 | DONE |
| 4 | Homogenization Batch 3 | Refactor remaining screen directories and root level screens | M1 | DONE |
| 5 | Verification & QA | Compile check with `npx tsc --noEmit` and run Forensic Audit | M2, M3, M4 | DONE |

## Interface Contracts
- All screen back button interactions MUST use either `BackButton` or `ScreenHeader`.
- Custom styling or custom chevron vectors for back buttons are prohibited.
- Modifying components must not break existing TypeScript compilation.
