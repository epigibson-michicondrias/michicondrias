from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.carnet import MedicalRecordCreate, MedicalRecordUpdate, MedicalRecordResponse

router = APIRouter()

from sqlalchemy import text
from app.api.pet_access import get_identity, assert_can_write_pet_record, assert_can_read_pet_record

@router.get("/pet/{pet_id}", response_model=List[MedicalRecordResponse])
def read_medical_records_by_pet(
    pet_id: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    identity: dict = Depends(get_identity),
) -> Any:
    """
    Retrieve medical records for a specific pet.
    Security: Only the pet owner or a registered veterinarian can view these records.
    """
    assert_can_read_pet_record(db, pet_id, identity)

    records = crud.crud_carnet.get_medical_records_by_pet(db, pet_id=pet_id, skip=skip, limit=limit)
    return records

@router.post("/", response_model=MedicalRecordResponse)
def create_medical_record(
    *,
    db: Session = Depends(get_db),
    record_in: MedicalRecordCreate,
    identity: dict = Depends(get_identity),
) -> Any:
    """
    Create new medical record.
    """
    assert_can_write_pet_record(db, record_in.pet_id, identity)
    record = crud.crud_carnet.create_medical_record(db=db, record=record_in, vet_id=identity["user_id"])
    return record


@router.get("/{record_id}", response_model=MedicalRecordResponse)
def read_medical_record(
    record_id: str,
    db: Session = Depends(get_db),
    identity: dict = Depends(get_identity),
) -> Any:
    """Una consulta del carnet (para editarla)."""
    record = crud.crud_carnet.get_medical_record(db, record_id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    assert_can_read_pet_record(db, record.pet_id, identity)
    return record


@router.put("/{record_id}", response_model=MedicalRecordResponse)
def update_medical_record(
    *,
    db: Session = Depends(get_db),
    record_id: str,
    record_in: MedicalRecordUpdate,
    identity: dict = Depends(get_identity),
) -> Any:
    """Edita una consulta del carnet (solo el dueño o un veterinario)."""
    record = crud.crud_carnet.get_medical_record(db, record_id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    assert_can_write_pet_record(db, record.pet_id, identity)
    return crud.crud_carnet.update_medical_record(db, db_record=record, record_update=record_in)


@router.delete("/{record_id}")
def delete_medical_record(
    *,
    db: Session = Depends(get_db),
    record_id: str,
    identity: dict = Depends(get_identity),
) -> Any:
    """Elimina una consulta del carnet."""
    record = crud.crud_carnet.get_medical_record(db, record_id=record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    assert_can_write_pet_record(db, record.pet_id, identity)
    crud.crud_carnet.delete_medical_record(db, db_record=record)
    return {"deleted": True}
