#!/usr/bin/env python3
"""
Reescribe en la BD las URLs de archivos guardadas con el prefijo de un storage
a otro (p. ej. AWS S3 -> Oracle Object Storage, o de regreso).

Recorre todas las columnas de texto de todas las tablas. Por defecto es DRY-RUN.

  DATABASE_URL=postgresql://... python scripts/deploy/rewrite_storage_urls.py \
      --old https://michicondrias-storage-1.s3.us-east-1.amazonaws.com \
      --new https://objectstorage.mx-queretaro-1.oraclecloud.com/n/NS/b/BUCKET/o            # dry-run
  ... --apply                                                                              # aplica

Requiere: pip install sqlalchemy psycopg2-binary
"""
import argparse, os, sys
from sqlalchemy import create_engine, inspect, text

ap = argparse.ArgumentParser()
ap.add_argument("--old", required=True, help="prefijo actual de las URLs (sin slash final)")
ap.add_argument("--new", required=True, help="prefijo nuevo (sin slash final)")
ap.add_argument("--apply", action="store_true", help="ejecutar los UPDATE (sin esto solo cuenta)")
a = ap.parse_args()
old, new = a.old.rstrip("/"), a.new.rstrip("/")

url = os.environ.get("DATABASE_URL")
if not url:
    sys.exit("Define DATABASE_URL")
engine = create_engine(url)
insp = inspect(engine)
total = 0
with engine.begin() as conn:
    for schema in [None]:
        for table in insp.get_table_names(schema=schema):
            for col in insp.get_columns(table, schema=schema):
                if col["type"].__class__.__name__ not in ("VARCHAR", "TEXT", "String", "Text"):
                    continue
                c = col["name"]
                n = conn.execute(text(f'SELECT count(*) FROM "{table}" WHERE "{c}" LIKE :p'), {"p": old + "%"}).scalar()
                if not n:
                    continue
                total += n
                print(f"{'UPDATE' if a.apply else 'would update'} {table}.{c}: {n} filas")
                if a.apply:
                    conn.execute(
                        text(f'UPDATE "{table}" SET "{c}" = replace("{c}", :o, :n) WHERE "{c}" LIKE :p'),
                        {"o": old, "n": new, "p": old + "%"},
                    )
print(f"Total: {total} filas {'actualizadas' if a.apply else '(dry-run, nada cambió)'}")
