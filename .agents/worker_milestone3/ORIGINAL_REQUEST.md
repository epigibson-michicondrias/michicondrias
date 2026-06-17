## 2026-06-17T02:40:12Z
You are the Worker agent for Milestone 3. Your workspace is /home/epigibson/Documentos/Desarrollos/michicondrias.
Your working directory is /home/epigibson/Documentos/Desarrollos/michicondrias/.agents/worker_milestone3.

Your task is to refactor the following 6 files to standardize their back navigation buttons using standard `BackButton` or standard `ScreenHeader` components:
1. `mobile/app/directorio/clinica/[id].tsx`
2. `mobile/app/directorio/especialista/[id].tsx`
3. `mobile/app/directorio/nuevo.tsx`
4. `mobile/app/perdidas/index.tsx`
5. `mobile/app/perfil/partner.tsx`
6. `mobile/app/tienda/producto/[id].tsx`

Please refer to the detailed recommendations in the Explorer's analysis report:
`/home/epigibson/Documentos/Desarrollos/michicondrias/.agents/explorer_milestone3/analysis.md`

Summary of changes per file:
- `mobile/app/directorio/clinica/[id].tsx`:
  - Import `BackButton` from `@/src/components/BackButton`.
  - Replace custom `<TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>` with standard `<BackButton onPress={() => router.back()} color="#fff" style={styles.backBtn} />`.
- `mobile/app/directorio/especialista/[id].tsx`:
  - Import `BackButton` from `@/src/components/BackButton`.
  - Replace custom `<TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>` with standard `<BackButton onPress={() => router.back()} color={theme.text} style={styles.backBtn} />`.
- `mobile/app/directorio/nuevo.tsx`:
  - Import `ScreenHeader` from `@/src/components/layout/ScreenHeader`. Remove `ChevronLeft` from lucide imports.
  - Replace entire custom `<View style={styles.header}>...</View>` inside `ScrollView` with `<ScreenHeader title="Registrar Negocio" subtitle="Únete a la red médica de Michicondrias" />` placed OUTSIDE/BEFORE the `<ScrollView>`. Remove unused stylesheet rules (`header`, `backBtn`, `title`, `subtitle`).
- `mobile/app/perdidas/index.tsx`:
  - Import `BackButton` from `@/src/components/BackButton`.
  - Replace custom `<TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.overlayHover }]} onPress={() => router.back()}>...` with standard `<BackButton onPress={() => router.back()} />`.
- `mobile/app/perfil/partner.tsx`:
  - Import `ScreenContainer` from `@/src/components/layout/ScreenContainer` and `ScreenHeader` from `@/src/components/layout/ScreenHeader`.
  - Wrap the main UI in `<ScreenContainer>...</ScreenContainer>`.
  - Replace the custom `<View style={styles.header}>...</View>` block with `<ScreenHeader title="🚀 Conviértete en Partner" subtitle="Desbloquea herramientas profesionales y genera ingresos con Michicondrias" />`. Remove unused stylesheet rules (`header`, `title`, `subtitle`).
- `mobile/app/tienda/producto/[id].tsx`:
  - Import `BackButton` from `@/src/components/BackButton`.
  - Replace custom `<TouchableOpacity style={[styles.circleBtn, { backgroundColor: theme.border, borderColor: theme.border }]} onPress={goBack}>...` with `<BackButton onPress={goBack} color={theme.text} style={[styles.circleBtn, { backgroundColor: theme.border, borderColor: theme.border }]} />`.

After making these modifications:
1. Run `npx tsc --noEmit` inside the `mobile/` directory to verify there are no compilation or type checking errors.
2. Report the build/test results in your handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When completed, write a handoff report at `/home/epigibson/Documentos/Desarrollos/michicondrias/.agents/worker_milestone3/handoff.md` and send a completion message to the Orchestrator.
