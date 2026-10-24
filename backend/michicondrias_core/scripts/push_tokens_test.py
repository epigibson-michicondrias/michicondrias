"""Pruebas locales de push tokens (core) con TestClient + SQLite en memoria.

Cubre: registrar token, upsert del mismo token (reactivar / reasignar usuario),
desactivar (logout / desinstalar) y listar tokens activos del usuario.

Uso (desde backend/michicondrias_core):
    ../.venv/bin/python scripts/push_tokens_test.py
"""
import os
import sys
import tempfile

# Importa la app con una URI dummy de SQLite en archivo: el engine real de
# producción no se usa (se sobrescribe get_db), pero session.py exige una URI
# compatible con los args de pool (SQLite en memoria no lo es).
_DUMMY_DB = os.path.join(tempfile.gettempdir(), "michicondrias_push_tokens_test_dummy.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_DUMMY_DB}"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.api import deps  # noqa: E402
from app.db.session import Base, get_db  # noqa: E402
from app.models import Role, User, GlobalSetting, PushToken  # noqa: E402
from app.models.notification import Notification  # noqa: E402
from app.core.push import notify_user_push  # noqa: E402

# Engine SQLite en memoria compartida entre conexiones del TestClient
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

TEST_USER_ID = "user-test-1"
OTHER_USER_ID = "user-test-2"


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def override_get_current_user_id() -> str:
    return TEST_USER_ID


# App mínima: solo el router de push tokens (mismos deps que producción)
from app.api.routes import push_tokens  # noqa: E402

app = FastAPI()
app.include_router(push_tokens.router, prefix="/api/v1/push-tokens")
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[deps.get_current_user_id] = override_get_current_user_id

client = TestClient(app)

results = []


def check(name: str, condition: bool, detail: str = ""):
    results.append((name, condition, detail))
    mark = "OK " if condition else "FALLO"
    print(f"  [{mark}] {name}" + (f" — {detail}" if detail and not condition else ""))


def run_tests():
    print("Pruebas de push tokens (core)")

    # --- 1. Registrar token nuevo ---
    r = client.post("/api/v1/push-tokens", json={"token": "tok-android-1", "platform": "android"})
    check("POST registra token nuevo (200)", r.status_code == 200, r.text)
    body = r.json()
    check("POST devuelve token y plataforma", body.get("token") == "tok-android-1" and body.get("platform") == "android")
    check("POST deja is_active=true", body.get("is_active") is True)
    check("POST asigna al usuario actual", body.get("id") is not None)

    # --- 2. Listar tokens activos ---
    r = client.post("/api/v1/push-tokens", json={"token": "tok-ios-1", "platform": "ios"})
    check("POST registra segundo token (200)", r.status_code == 200, r.text)

    r = client.get("/api/v1/push-tokens/me")
    check("GET /me lista tokens activos (200)", r.status_code == 200, r.text)
    tokens = r.json()
    check("GET /me devuelve los 2 tokens activos", len(tokens) == 2, str(len(tokens)))
    check("GET /me solo tokens del usuario", all(t["token"] in ("tok-android-1", "tok-ios-1") for t in tokens))

    # --- 3. Upsert del mismo token (mismo usuario): refresca y reactiva ---
    r = client.delete("/api/v1/push-tokens/tok-android-1")
    check("DELETE desactiva token (200)", r.status_code == 200, r.text)
    check("DELETE responde deactivated=true", r.json().get("deactivated") is True)

    r = client.get("/api/v1/push-tokens/me")
    active_after_delete = [t["token"] for t in r.json()]
    check("GET /me ya no incluye el token desactivado", "tok-android-1" not in active_after_delete)

    r = client.post("/api/v1/push-tokens", json={"token": "tok-android-1", "platform": "android"})
    check("POST del mismo token reactiva (200)", r.status_code == 200, r.text)
    check("Upsert reactiva is_active=true", r.json().get("is_active") is True)

    r = client.get("/api/v1/push-tokens/me")
    check("GET /me vuelve a incluirlo tras reactivar", "tok-android-1" in [t["token"] for t in r.json()])

    # Mismo token con otra plataforma: refresca platform
    r = client.post("/api/v1/push-tokens", json={"token": "tok-android-1", "platform": "web"})
    check("Upsert refresca plataforma (200)", r.status_code == 200, r.text)
    check("Upsert cambia platform a web", r.json().get("platform") == "web")

    # --- 4. Reasignación: el mismo token pasa a otro usuario ---
    db = TestingSessionLocal()
    db.query(PushToken).filter(PushToken.token == "tok-reasignado").delete()
    db.commit()
    db.close()
    r = client.post("/api/v1/push-tokens", json={"token": "tok-reasignado", "platform": "android"})
    check("POST token a reasignar (200)", r.status_code == 200, r.text)

    # Cambia el usuario actual simulado
    app.dependency_overrides[deps.get_current_user_id] = lambda: OTHER_USER_ID
    r = client.post("/api/v1/push-tokens", json={"token": "tok-reasignado", "platform": "ios"})
    check("Upsert de token de otro usuario lo reasigna (200)", r.status_code == 200, r.text)
    r = client.get("/api/v1/push-tokens/me")
    check("Nuevo dueño ve el token reasignado", "tok-reasignado" in [t["token"] for t in r.json()])
    app.dependency_overrides[deps.get_current_user_id] = override_get_current_user_id

    r = client.get("/api/v1/push-tokens/me")
    check("Dueño anterior ya no ve el token reasignado", "tok-reasignado" not in [t["token"] for t in r.json()])

    # --- 5. DELETE de token inexistente → 404 ---
    r = client.delete("/api/v1/push-tokens/no-existe")
    check("DELETE token inexistente (404)", r.status_code == 404, r.text)
    check("404 en español", "Token no encontrado" in r.text)

    # --- 6. Validaciones ---
    r = client.post("/api/v1/push-tokens", json={"token": "tok-x", "platform": "blackberry"})
    check("POST plataforma inválida (422)", r.status_code == 422, r.text)
    check("Error de plataforma en español", "plataforma" in r.text.lower())

    r = client.post("/api/v1/push-tokens", json={"token": "   ", "platform": "android"})
    check("POST token vacío (422)", r.status_code == 422, r.text)

    # --- 7. notify_user_push registra la fila en notifications ---
    db = TestingSessionLocal()
    notify_user_push(db, TEST_USER_ID, "Cita confirmada", "Tu cita es mañana a las 10:00", "/directorio/citas")
    notif = db.query(Notification).filter(Notification.user_id == TEST_USER_ID).first()
    check("notify_user_push inserta en notifications", notif is not None)
    if notif:
        check("notify_user_push guarda título y link",
              notif.title == "Cita confirmada" and notif.link == "/directorio/citas")
    db.close()


if __name__ == "__main__":
    run_tests()
    failed = [name for name, ok, _ in results if not ok]
    print()
    if failed:
        print(f"FALLARON {len(failed)} de {len(results)}: {', '.join(failed)}")
        sys.exit(1)
    print(f"Las {len(results)} pruebas pasaron")
    sys.exit(0)
