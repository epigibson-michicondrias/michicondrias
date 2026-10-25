"""Prueba local del resumen del historial (POST /pets/{id}/ai/history-summary) con SQLite y sin IA.

Uso: cd backend/michicondrias_mascotas && DATABASE_URL=postgresql://u:p@127.0.0.1:1/x SECRET_KEY=x ANTHROPIC_API_KEY= \
     ../.venv/bin/python ../../scripts/pruebas/resumen_historial.py
Debe imprimir el resumen automático y «OK» en los 4 casos de permisos (dueño, ajeno, veterinario, interno).
"""
import sys; sys.path.insert(0,'.')
from datetime import date, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
eng=create_engine("sqlite://", connect_args={"check_same_thread":False}, poolclass=StaticPool)
db=sessionmaker(bind=eng)()
for ddl in [
 "CREATE TABLE medical_records (id TEXT, pet_id TEXT, date TEXT, reason_for_visit TEXT, diagnosis TEXT, treatment TEXT, weight_kg REAL, temperature_c REAL)",
 "CREATE TABLE prescriptions (id TEXT, medical_record_id TEXT, medication_name TEXT, dosage TEXT, frequency_hours INT, duration_days INT)",
 "CREATE TABLE vaccines (id TEXT, pet_id TEXT, name TEXT, date_administered TEXT, next_due_date TEXT)",
 "CREATE TABLE lab_orders (id TEXT, pet_id TEXT)",
 "CREATE TABLE lab_results (id TEXT, order_id TEXT, parameter_name TEXT, measured_value REAL, unit TEXT, reference_range TEXT, is_anomaly BOOLEAN, created_at TEXT)"]:
    db.execute(text(ddl))
t=date.today()
db.execute(text("INSERT INTO medical_records VALUES ('r1','p1',:d1,'Vómito','Gastritis','Dieta',4.5,38.9),('r2','p1',:d2,'Control',NULL,NULL,4.2,NULL)"),{"d1":(t-timedelta(days=2)).isoformat(),"d2":(t-timedelta(days=200)).isoformat()})
db.execute(text("INSERT INTO prescriptions VALUES ('x1','r1','Omeprazol','1/4 tableta',24,7),('x2','r2','Viejo','1',12,3)"))
db.execute(text("INSERT INTO vaccines VALUES ('v1','p1','Triple felina',:a,:due1),('v2','p1','Rabia',:a,:due2)"),{"a":(t-timedelta(days=300)).isoformat(),"due1":(t-timedelta(days=5)).isoformat(),"due2":(t+timedelta(days=20)).isoformat()})
db.execute(text("INSERT INTO lab_orders VALUES ('o1','p1')")); db.execute(text("INSERT INTO lab_results VALUES ('l1','o1','Creatinina',2.4,'mg/dL','0.8-1.8',1,:c)"),{"c":t.isoformat()})
db.commit()
from app.core.ai_history import summarize_history
r=summarize_history(db,"u1","p1","Luna","Luna (gato)")
print(r["analysis_source"]); print(r["summary"]); [print(" -",h) for h in r["highlights"]]
print(r["facts"]["weight"])
e=summarize_history(db,"u1","nada","Michi","Michi (gato)"); print("vacío:", e["summary"])
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_db
from app.api.internal import identity_or_internal
class P: id="p1"; name="Luna"; species="gato"; breed=None; age_months=24; owner_id="u1"; is_active=True
class Q:
    def filter(self,*a): return self
    def first(self): return P()
class DB2:
    def query(self,*a): return Q()
    def execute(self,*a,**k): return db.execute(*a,**k)
    def rollback(self): db.rollback()
app.dependency_overrides[get_db]=lambda: DB2()
c=TestClient(app)
for ident,exp in [({"user_id":"u1","role":"consumidor"},200),({"user_id":"u2","role":"consumidor"},403),({"user_id":"v","role":"veterinario"},200),({"internal":True},403)]:
    app.dependency_overrides[identity_or_internal]=lambda ident=ident: ident
    code=c.post("/api/v1/pets/p1/ai/history-summary").status_code
    print(ident.get("role","internal"), code, "OK" if code==exp else "FALLA")
