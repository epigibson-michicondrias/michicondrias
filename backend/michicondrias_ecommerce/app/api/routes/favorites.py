from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.db.session import get_db

router = APIRouter()


class FavoritesMerge(BaseModel):
    product_ids: List[str] = Field(default_factory=list, max_length=100)


@router.get("/me", response_model=List[str])
def read_my_favorites(
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> List[str]:
    """IDs de los productos favoritos del usuario, el más reciente primero."""
    return crud.crud_ecommerce.get_favorite_ids(db, user_id)


@router.post("/me/merge", response_model=List[str])
def merge_my_favorites(
    body: FavoritesMerge,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> List[str]:
    """Sube varios favoritos a la vez (p. ej. los que estaban guardados solo en el teléfono). Devuelve la lista final."""
    return crud.crud_ecommerce.add_favorites(db, user_id, body.product_ids)


@router.put("/me/{product_id}", status_code=204)
def add_my_favorite(
    product_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Response:
    product = crud.crud_ecommerce.get_product(db, product_id=product_id)
    if not product or not product.is_active or not product.is_approved:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    ids = crud.crud_ecommerce.add_favorites(db, user_id, [product_id])
    if product_id not in ids:
        raise HTTPException(status_code=409, detail=f"Llegaste al máximo de {crud.crud_ecommerce.MAX_FAVORITES} favoritos")
    return Response(status_code=204)


@router.delete("/me/{product_id}", status_code=204)
def remove_my_favorite(
    product_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
) -> Response:
    crud.crud_ecommerce.remove_favorite(db, user_id, product_id)
    return Response(status_code=204)
