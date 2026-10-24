# Rotación de credenciales — P0 (obligatorio)

> **Esto es urgente.** Las credenciales de base de datos de producción estaban en claro en el código
> fuente y **siguen en el historial de git**. Borrar los archivos **no basta**: hay que rotar.

## Qué se filtró

| Credencial | Dónde aparecía | Nivel |
|---|---|---|
| Contraseña de **Supabase** (`postgres:…@db.zaegmfufrzjmjiemrvvp.supabase.co` y el pooler `aws-1-us-east-1.pooler.supabase.com`) | `directorio/app/core/config.py` (como default, se despliega a producción), 7 scripts de migración, `seed_live_test_data.py`, `archivo/backend_integration_plan.md` | **P0** |
| Clave de **Neon** (`neondb_owner:npg_…@ep-jolly-mouse-…`) | 6 scripts en `scripts/utils/` y `backend/`, 2 docs de deploy | **P0** |

La contraseña de Supabase aparece también en el **historial de git** (commits pasados). Por eso rotar es lo único que sirve.

## Pasos — en este orden

### 1. Rotar Supabase (producción)
1. Entra a https://supabase.com → proyecto **Michicondrias-App** (`zaegmfufrzjmjiemrvvp`).
2. **Database → Settings → Database password → Reset database password.**
3. Copia la contraseña nueva **una sola vez** (no la pegues en ningún archivo del repo).
4. Si usas el pooler (`aws-1-us-east-1.pooler.supabase.com`), esa contraseña es la misma.

### 2. Rotar Neon (si esa base sigue viva)
1. Entra a https://console.neon.tech → proyecto correspondiente.
2. **Settings → Reset password** del role `neondb_owner`.
3. Si esa base ya no se usa, **elimina el proyecto** en vez de rotar.

### 3. Actualizar la VM de Oracle
Las contraseñas nuevas van **solo** en `/etc/michicondrias/common.env` (nunca al repo):
```bash
scripts/vm.sh shell
sudo $EDITOR /etc/michicondrias/common.env   # DATABASE_URL=postgresql://…:NUEVA_CONTRASEÑA@…
sudo systemctl restart michicondrias@core michicondrias@directorio   # y el resto si aplica
scripts/vm.sh status                          # 17/17 deben volver a http 200
```

### 4. Actualizar los entornos locales / CI
- `mobile/.env` **no** lleva DATABASE_URL (la app no toca la base) — no hay nada que hacer ahí.
- `.github/workflows/` y `deploy/services.conf`: si traen la URL, cámbiala por un secret de GitHub.
- `scripts/` que corras a mano: `export DATABASE_URL=postgresql://…` antes de ejecutarlos.

### 5. Limpiar el historial de git (opcional pero recomendado)
La contraseña vive en commits pasados. Para purgarla:
```bash
# Requiere coordinación: rompe los clones de todos
git filter-repo --replace-text <(echo 'Michicondrias201094*==<ROTADA>')   # ej.
git push --force origin main
```
**Solo después de haber rotado.** Si no quieres reescribir historia, con que la contraseña
nueva no aparezca nunca más en el repo el riesgo queda acotado (la vieja ya no sirve).

### 6. Verificar
```bash
grep -rn "Michicondrias201094\|npg_QjveaCY3fGb4" . --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=.git
# debe salir vacío (excepto este documento, que ya no la contiene)
scripts/vm.sh status
```

## Regla para el futuro
- Ninguna credencial en el código, ni siquiera como valor por defecto. Siempre `str | None = None`
  y leer de la variable de entorno (patrón de `michicondrias_core/app/core/config.py`).
- Los scripts de una sola vez leen `os.environ["DATABASE_URL"]`; documenta el comando de export
  en el propio script o en un README, nunca la URL.
