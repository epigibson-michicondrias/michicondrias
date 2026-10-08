from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db
from app.schemas.carnet import VaccineCreate, VaccineUpdate, VaccineResponse

router = APIRouter()

from sqlalchemy import text
from app.api.pet_access import get_identity, assert_can_write_pet_record, assert_can_read_pet_record

@router.get("/pet/{pet_id}", response_model=List[VaccineResponse])
def read_vaccines_by_pet(
    pet_id: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    identity: dict = Depends(get_identity),
) -> Any:
    """
    Retrieve vaccines for a specific pet.
    Security: Only the pet owner or a registered veterinarian can view these records.
    """
    assert_can_read_pet_record(db, pet_id, identity)

    vaccines = crud.crud_carnet.get_vaccines_by_pet(db, pet_id=pet_id, skip=skip, limit=limit)
    return vaccines

@router.post("/", response_model=VaccineResponse)
def create_vaccine(
    *,
    db: Session = Depends(get_db),
    vaccine_in: VaccineCreate,
    identity: dict = Depends(get_identity),
) -> Any:
    """
    Create a new vaccine record.
    """
    assert_can_write_pet_record(db, vaccine_in.pet_id, identity)
    vaccine = crud.crud_carnet.create_vaccine(db=db, vaccine=vaccine_in, vet_id=identity["user_id"])
    return vaccine


@router.get("/{vaccine_id}", response_model=VaccineResponse)
def read_vaccine(
    vaccine_id: str,
    db: Session = Depends(get_db),
    identity: dict = Depends(get_identity),
) -> Any:
    """Una vacuna del carnet (para editarla)."""
    vaccine = crud.crud_carnet.get_vaccine(db, vaccine_id=vaccine_id)
    if not vaccine:
        raise HTTPException(status_code=404, detail="Vacuna no encontrada")
    assert_can_read_pet_record(db, vaccine.pet_id, identity)
    return vaccine


@router.put("/{vaccine_id}", response_model=VaccineResponse)
def update_vaccine(
    *,
    db: Session = Depends(get_db),
    vaccine_id: str,
    vaccine_in: VaccineUpdate,
    identity: dict = Depends(get_identity),
) -> Any:
    """Edita una vacuna del carnet (solo el dueño o un veterinario)."""
    vaccine = crud.crud_carnet.get_vaccine(db, vaccine_id=vaccine_id)
    if not vaccine:
        raise HTTPException(status_code=404, detail="Vacuna no encontrada")
    assert_can_write_pet_record(db, vaccine.pet_id, identity)
    return crud.crud_carnet.update_vaccine(db, db_vaccine=vaccine, vaccine_update=vaccine_in)


@router.delete("/{vaccine_id}")
def delete_vaccine(
    *,
    db: Session = Depends(get_db),
    vaccine_id: str,
    identity: dict = Depends(get_identity),
) -> Any:
    """Elimina una vacuna del carnet y recalcula el estado de vacunación de la mascota."""
    vaccine = crud.crud_carnet.get_vaccine(db, vaccine_id=vaccine_id)
    if not vaccine:
        raise HTTPException(status_code=404, detail="Vacuna no encontrada")
    assert_can_write_pet_record(db, vaccine.pet_id, identity)
    crud.crud_carnet.delete_vaccine(db, db_vaccine=vaccine)
    return {"deleted": True}
