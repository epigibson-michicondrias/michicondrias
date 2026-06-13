from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.db.session import get_db
from app.crud.crud_venue import (
    create_venue,
    get_venue_by_id,
    update_venue,
    delete_venue,
    search_venues
)
from app.schemas.venue import VenueCreate, VenueUpdate, Venue

router = APIRouter()

@router.post("/", response_model=Venue, status_code=status.HTTP_201_CREATED)
def register_venue(
    *,
    db: Session = Depends(get_db),
    venue_in: VenueCreate,
    owner_id: str = Depends(deps.require_establecimiento)
) -> Any:
    """
    Register a pet friendly establishment. Requires 'establecimiento' role.
    """
    return create_venue(db, venue_in=venue_in, owner_id=owner_id)

@router.get("/search", response_model=List[Venue])
def search_for_venues(
    *,
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    name: Optional[str] = None,
    address: Optional[str] = None,
    amenity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
) -> Any:
    """
    Search for venues by name, address, or amenity (uses PostgreSQL JSONB filter).
    """
    return search_venues(
        db,
        q=q,
        name=name,
        address=address,
        amenity=amenity,
        skip=skip,
        limit=limit
    )

@router.get("/{venue_id}", response_model=Venue)
def read_venue(
    venue_id: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific pet friendly venue by ID.
    """
    venue = get_venue_by_id(db, venue_id=venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    return venue

@router.put("/{venue_id}", response_model=Venue)
def update_existing_venue(
    venue_id: str,
    *,
    db: Session = Depends(get_db),
    venue_in: VenueUpdate,
    owner_id: str = Depends(deps.require_establecimiento)
) -> Any:
    """
    Update a pet friendly establishment. Only the owner can update.
    """
    db_venue = get_venue_by_id(db, venue_id=venue_id)
    if not db_venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    if db_venue.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar este establecimiento"
        )
    return update_venue(db, db_venue=db_venue, venue_in=venue_in)

@router.delete("/{venue_id}", response_model=dict)
def delete_existing_venue(
    venue_id: str,
    *,
    db: Session = Depends(get_db),
    owner_id: str = Depends(deps.require_establecimiento)
) -> Any:
    """
    Delete a pet friendly establishment. Only the owner can delete.
    """
    db_venue = get_venue_by_id(db, venue_id=venue_id)
    if not db_venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado"
        )
    if db_venue.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para eliminar este establecimiento"
        )
    delete_venue(db, venue_id=venue_id)
    return {"message": "Establecimiento eliminado exitosamente"}
