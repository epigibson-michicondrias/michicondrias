from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, text, bindparam
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import uuid

from app.api import deps
from app.crud import crud_laboratory
from app.models.laboratory import LabOrder, LabResult, LabAppointment, LabTestCatalog
from app.schemas.laboratory import (
    LabOrderCreate,
    LabOrderOut,
    LabResultsUpload,
    LabResultOut,
    LabTestCatalogCreate,
    LabTestCatalogOut,
    LabAppointmentCreate,
    LabAppointmentOut,
    LabAppointmentStatusUpdate,
    LabTestActiveUpdate,
)

router = APIRouter()


def _notify(db: Session, user_id: Optional[str], title: str, message: str, ntype: str = "laboratorio") -> None:
    """Notificación en la bandeja del usuario (misma BD que core). Nunca debe romper el flujo principal."""
    if not user_id:
        return
    try:
        db.execute(text(
            "INSERT INTO notifications (id, user_id, title, message, type, is_read) "
            "VALUES (:id, :uid, :title, :msg, :type, false)"
        ), {"id": str(uuid.uuid4()), "uid": user_id, "title": title, "msg": message, "type": ntype})
        db.commit()
    except Exception:
        db.rollback()


def _pet_names(db: Session, pet_ids: list) -> dict:
    ids = list({p for p in pet_ids if p})
    if not ids:
        return {}
    try:
        rows = db.execute(text("SELECT id, name FROM pets WHERE id IN :ids").bindparams(bindparam("ids", expanding=True)), {"ids": ids}).fetchall()
        return {r[0]: r[1] for r in rows}
    except Exception:
        db.rollback()
        return {}


def _pet_owner(db: Session, pet_id: str) -> Optional[str]:
    row = db.execute(text("SELECT owner_id FROM pets WHERE id = :pid"), {"pid": pet_id}).first()
    return row[0] if row else None


def _orders_out(db: Session, orders: list) -> list:
    names = _pet_names(db, [o.pet_id for o in orders])
    out = []
    for o in orders:
        item = LabOrderOut.model_validate(o)
        item.pet_name = names.get(o.pet_id)
        out.append(item)
    return out


def _appointments_out(db: Session, appts: list) -> list:
    names = _pet_names(db, [a.pet_id for a in appts])
    test_ids = list({a.test_id for a in appts})
    tests = {t.id: t for t in db.query(LabTestCatalog).filter(LabTestCatalog.id.in_(test_ids)).all()} if test_ids else {}
    out = []
    for a in appts:
        item = LabAppointmentOut.model_validate(a)
        item.pet_name = names.get(a.pet_id)
        t = tests.get(a.test_id)
        item.test_name = t.name if t else None
        item.test_price = t.price if t else None
        out.append(item)
    return out

@router.post("/orders", response_model=LabOrderOut, status_code=status.HTTP_201_CREATED)
def create_lab_order(
    *,
    db: Session = Depends(deps.get_db),
    order_in: LabOrderCreate,
    current_user_id: str = Depends(deps.require_veterinario)
):
    """
    Create a new lab order request. Requires 'veterinario' role.
    """
    if not _pet_owner(db, order_in.pet_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota no existe")
    if not order_in.test_names:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Indica al menos un estudio")
    order = crud_laboratory.create_order(db=db, order_in=order_in, requesting_vet_id=current_user_id)
    _notify(db, order_in.lab_id, "Nueva orden de laboratorio", f"Recibiste una orden con {len(order_in.test_names)} estudio(s).")
    return _orders_out(db, [order])[0]


@router.get("/orders/lab", response_model=List[LabOrderOut])
def get_lab_orders(
    *,
    db: Session = Depends(deps.get_db),
    status_filter: Optional[str] = None,
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """Todas las órdenes del laboratorio (cualquier estado; opcionalmente filtradas), más recientes primero."""
    q = db.query(LabOrder).filter(LabOrder.lab_id == current_user_id)
    if status_filter:
        q = q.filter(LabOrder.status == status_filter)
    return _orders_out(db, q.order_by(LabOrder.created_at.desc()).all())


@router.get("/orders/vet", response_model=List[LabOrderOut])
def get_vet_orders(
    *,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.require_veterinario)
):
    """Órdenes que solicitó el veterinario autenticado, con sus resultados."""
    orders = db.query(LabOrder).filter(LabOrder.requesting_vet_id == current_user_id).order_by(LabOrder.created_at.desc()).all()
    return _orders_out(db, orders)


@router.get("/pending", response_model=List[LabOrderOut])
def get_pending_orders(
    *,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """
    List all pending orders assigned to the logged-in laboratory. Requires 'laboratorio' role.
    """
    return _orders_out(db, crud_laboratory.get_pending_orders_for_lab(db=db, lab_id=current_user_id))


@router.post("/orders/{order_id}/results", response_model=LabOrderOut)
def upload_lab_results(
    *,
    db: Session = Depends(deps.get_db),
    order_id: str,
    results_in: LabResultsUpload,
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """
    Upload test results and complete the order. Requires 'laboratorio' role.
    """
    order = crud_laboratory.get_order_by_id(db=db, order_id=order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La orden de laboratorio no existe"
        )
    if order.lab_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para subir resultados a esta orden"
        )
    
    if order.status in ("completed", "cancelled"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Esta orden ya fue cerrada")
    if not results_in.results:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Agrega al menos un resultado")

    updated_order = crud_laboratory.upload_results(db=db, order_id=order_id, results_in=results_in)
    owner_id = _pet_owner(db, order.pet_id)
    anomalies = any(r.is_anomaly for r in results_in.results)
    msg = "Ya están disponibles los resultados de laboratorio." + (" Hay valores fuera de rango." if anomalies else "")
    _notify(db, owner_id, "Resultados de laboratorio listos", msg)
    if order.requesting_vet_id and order.requesting_vet_id != owner_id:
        _notify(db, order.requesting_vet_id, "Resultados de laboratorio listos", msg)
    return _orders_out(db, [updated_order])[0]


@router.get("/pet/{pet_id}/history", response_model=List[LabResultOut])
def get_pet_lab_history(
    *,
    db: Session = Depends(deps.get_db),
    pet_id: str,
    token: str = Depends(deps.oauth2_scheme)
):
    """
    Resultados de laboratorio de una mascota. Solo su dueño, el veterinario o laboratorio con una orden de esa mascota, o un admin.
    """
    payload = deps._decode_token(token)
    user_id, role = payload["sub"], payload.get("role", "consumidor")
    if role != "admin":
        owner = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": pet_id}).first()
        is_owner = bool(owner) and owner[0] == user_id
        involved = db.query(LabOrder).filter(
            LabOrder.pet_id == pet_id,
            or_(LabOrder.lab_id == user_id, LabOrder.requesting_vet_id == user_id),
        ).first() is not None
        if not (is_owner or involved):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a los resultados de esta mascota")
    return crud_laboratory.get_completed_results_by_pet(db=db, pet_id=pet_id)


# New LabTestCatalog Endpoints
@router.post("/tests", response_model=LabTestCatalogOut, status_code=status.HTTP_201_CREATED)
def add_lab_test(
    *,
    db: Session = Depends(deps.get_db),
    test_in: LabTestCatalogCreate,
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """
    Create a new lab test catalog item. Requires 'laboratorio' role.
    """
    return crud_laboratory.create_lab_test(db=db, test_in=test_in, lab_id=current_user_id)


@router.get("/tests/mine", response_model=List[LabTestCatalogOut])
def read_my_lab_tests(
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """Todos los estudios (activos o no) del laboratorio autenticado."""
    return db.query(LabTestCatalog).filter(LabTestCatalog.lab_id == current_user_id).order_by(LabTestCatalog.created_at.desc()).all()


@router.patch("/tests/{test_id}/active", response_model=LabTestCatalogOut)
def set_lab_test_active(
    test_id: str,
    body: LabTestActiveUpdate,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """Publica u oculta un estudio propio."""
    test = crud_laboratory.get_lab_test_by_id(db=db, test_id=test_id)
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El estudio no existe")
    if test.lab_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Este estudio no es tuyo")
    test.is_active = body.is_active
    db.commit()
    db.refresh(test)
    return test


@router.get("/tests", response_model=List[LabTestCatalogOut])
def read_active_lab_tests(
    db: Session = Depends(deps.get_db)
):
    """
    Get all active lab tests. Public endpoint.
    """
    return crud_laboratory.get_active_lab_tests(db=db)


# New LabAppointment Endpoints
@router.post("/appointments", response_model=LabAppointmentOut, status_code=status.HTTP_201_CREATED)
def add_lab_appointment(
    *,
    db: Session = Depends(deps.get_db),
    app_in: LabAppointmentCreate,
    current_user_id: str = Depends(deps.get_current_user_id)
):
    """
    Book an appointment at a laboratory. Requires user authentication.
    """
    test = crud_laboratory.get_lab_test_by_id(db=db, test_id=app_in.test_id)
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El examen de laboratorio especificado no existe."
        )
    if not test.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Este estudio ya no está disponible")
    if _pet_owner(db, app_in.pet_id) != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el dueño de la mascota puede agendar su estudio")
    if app_in.scheduled_date < date.today():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La fecha no puede estar en el pasado")
    # El laboratorio sale del estudio elegido: el cliente no puede mandar un lab distinto
    app_in.lab_id = test.lab_id
    appt = crud_laboratory.create_lab_appointment(db=db, app_in=app_in, client_id=current_user_id)
    _notify(db, test.lab_id, "Nueva cita de laboratorio", f"Solicitud de {test.name} para el {app_in.scheduled_date.isoformat()}.")
    return _appointments_out(db, [appt])[0]


@router.patch("/appointments/{appointment_id}/status", response_model=LabAppointmentOut)
def update_lab_appointment_status(
    appointment_id: str,
    body: LabAppointmentStatusUpdate,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.get_current_user_id)
):
    """El laboratorio confirma/completa/cancela; el cliente solo puede cancelar su cita."""
    appt = db.query(LabAppointment).filter(LabAppointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La cita no existe")
    is_lab = appt.lab_id == current_user_id
    is_client = appt.client_id == current_user_id
    if not (is_lab or is_client):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos sobre esta cita")
    if body.status not in ("confirmed", "completed", "cancelled"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado inválido")
    if is_client and not is_lab and body.status != "cancelled":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes cancelar tu cita")
    flow = {"pending": {"confirmed", "cancelled"}, "confirmed": {"completed", "cancelled"}}
    if body.status not in flow.get(appt.status or "pending", set()):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La cita ya no puede cambiar a ese estado")
    appt.status = body.status
    db.commit()
    db.refresh(appt)
    label = {"confirmed": "confirmada", "completed": "completada", "cancelled": "cancelada"}[body.status]
    if is_lab:
        _notify(db, appt.client_id, f"Cita de laboratorio {label}", f"Tu cita de laboratorio del {appt.scheduled_date.isoformat()} fue {label}.")
    else:
        _notify(db, appt.lab_id, "Cita de laboratorio cancelada", f"El cliente canceló la cita del {appt.scheduled_date.isoformat()}.")
    return _appointments_out(db, [appt])[0]


@router.get("/appointments/client", response_model=List[LabAppointmentOut])
def read_client_appointments(
    *,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.get_current_user_id)
):
    """
    Get all lab appointments for the logged-in client.
    """
    return _appointments_out(db, crud_laboratory.get_appointments_for_client(db=db, client_id=current_user_id))


@router.get("/appointments/provider", response_model=List[LabAppointmentOut])
def read_provider_appointments(
    *,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """
    Get all lab appointments requested from the logged-in laboratory. Requires 'laboratorio' role.
    """
    return _appointments_out(db, crud_laboratory.get_appointments_for_provider(db=db, lab_id=current_user_id))


@router.get("/alerts/anomalies", response_model=List[LabResultOut])
def read_lab_anomalies(
    *,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """
    List all anomaly lab results processed by this laboratory. Requires 'laboratorio' role.
    """
    return db.query(LabResult).join(LabOrder).filter(
        LabOrder.lab_id == current_user_id,
        LabResult.is_anomaly == True
    ).all()


@router.patch("/orders/{order_id}/status", response_model=LabOrderOut)
def update_lab_order_status(
    order_id: str,
    status_str: str,
    *,
    db: Session = Depends(deps.get_db),
    current_user_id: str = Depends(deps.require_laboratorio)
):
    """
    Update the status of a lab order (e.g. sample_collected, processing). Requires 'laboratorio' role.
    """
    order = db.query(LabOrder).filter(LabOrder.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La orden de laboratorio no existe"
        )
    if order.lab_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar esta orden"
        )
    
    if status_str not in ["pending", "sample_collected", "processing", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estado inválido. Valores permitidos: pending, sample_collected, processing, cancelled (para completar, sube los resultados)"
        )
        
    if order.status in ("completed", "cancelled"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Esta orden ya fue cerrada")
    order.status = status_str
    db.commit()
    db.refresh(order)
    labels = {"sample_collected": "muestra recolectada", "processing": "en proceso", "cancelled": "cancelada", "pending": "pendiente"}
    if order.requesting_vet_id:
        _notify(db, order.requesting_vet_id, "Orden de laboratorio actualizada", f"Tu orden ahora está: {labels.get(status_str, status_str)}.")
    return _orders_out(db, [order])[0]
