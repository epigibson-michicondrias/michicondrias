from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import RoleChecker, get_current_user_id
from app.db.session import get_db
from app.schemas.funerary import (
    PetDeathCreate,
    PetDeathResponse,
    PetMemorialPostCreate,
    PetMemorialPostResponse,
)
from app.crud.crud_funerary import (
    get_pet,
    create_death_report,
    get_memorial_posts,
    create_memorial_post,
)

router = APIRouter()

@router.post("/death-report", response_model=PetDeathResponse, status_code=status.HTTP_201_CREATED)
def record_death_report(
    *,
    db: Session = Depends(get_db),
    death_in: PetDeathCreate,
    current_user: dict = Depends(RoleChecker(["funeraria", "veterinario"]))
):
    """
    Records a pet's death. Requires 'funeraria' or 'veterinario' role.
    Updates the pet's status to 'in_memoriam' in the database.
    """
    pet = get_pet(db, death_in.pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La mascota especificada no existe."
        )
    
    funerary_id = current_user.get("sub")
    death_report = create_death_report(db, death_in=death_in, funerary_id=funerary_id)
    if not death_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo registrar el reporte de fallecimiento."
        )
    return death_report

@router.get("/memorial/{pet_id}", response_model=List[PetMemorialPostResponse])
def read_memorial_posts(
    pet_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve all memorial posts for a pet.
    """
    posts = get_memorial_posts(db, pet_id=pet_id)
    return posts

@router.post("/memorial/post", response_model=PetMemorialPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    *,
    db: Session = Depends(get_db),
    post_in: PetMemorialPostCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    Create a new memorial post for a pet. Requires authentication.
    """
    pet = get_pet(db, post_in.pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La mascota especificada no existe."
        )
    
    post = create_memorial_post(db, post_in=post_in, user_id=current_user_id)
    return post
