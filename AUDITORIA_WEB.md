# Auditoría — Web ↔ App

Se llena en **W1**. Por módulo: tabla "pantalla de la app → página web" con estado (**existe** / **falta** /
**sobra** / **difiere**), lógica web que vale rescatar y hallazgos con `archivo:línea`. Al resolver un hallazgo se
marca `[x]`. Progreso y decisiones en [`PROGRESO_WEB.md`](PROGRESO_WEB.md).

## Hallazgos globales (W0)

- [x] `next build` fallaba: `Sidebar.tsx:141` (`getPlaces` importado de `mascotas`) y `useSearchParams` fuera de
  `<Suspense>` (`dashboard/tienda/pago-exitoso`). Arreglado en W0.
- [ ] `lib/api.ts`: cualquier 401/403, y un 404 "User not found", borra el token y redirige a `/login`, así que un
  "sin permiso" cierra la sesión. → Se reemplaza en W2 por el espejo de `mobile/src/lib/api.ts`.
- [ ] La guarda de sesión solo vive en el cliente (`dashboard/layout.tsx`) y solo mira si hay token: muestra la página
  un instante y no detecta tokens vencidos. → W2/W3: `AuthContext` + guarda sin parpadeo.
- [ ] Las 6 páginas `dashboard/admin/*` no tienen guarda de rol. → W4-A con `RoleGuard` + `ROUTE_ACCESS`.
- [ ] El rol se lee de tres formas distintas (`hasRole`/`getUserRole` del JWT, `user.role_name`, `localStorage`). →
  W2: solo desde `AuthContext` + `normalizeRole`.
- [ ] Datos *mock*: `directorio/mi-clinica/page.tsx:66,276` (`patient_id: "pet_mock_123"`).
- [ ] Servicios duplicados: `getPlaces` en `perdidas.ts` y `petfriendly.ts`; mascotas perdidas en `mascotas.ts`
  (`/lost-pets`) y `perdidas.ts` (`/reports`). → W2: los services se reemplazan por los espejos de la app.
- [ ] Solo tema oscuro, paleta morada/rosa ajena a *Midnight & Gold*. → W2.
- [ ] Íconos con SVG pegados y unos 630 emojis. → `lucide-react` en W2/W4.
