from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.db.session import get_db
from app.schemas.ecommerce import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    SubcategoryCreate, SubcategoryUpdate, SubcategoryResponse
)

router = APIRouter()

# ---- CATEGORY ROUTES ----

@router.get("/", response_model=List[CategoryResponse])
def get_categories(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
) -> Any:
    """Retrieve all categories."""
    return crud.crud_category.get_categories(db, skip=skip, limit=limit, active_only=active_only)

@router.post("/", response_model=CategoryResponse)
def create_category(
    *,
    db: Session = Depends(get_db),
    category_in: CategoryCreate,
) -> Any:
    """Create a new category."""
    return crud.crud_category.create_category(db=db, category=category_in)

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    *,
    db: Session = Depends(get_db),
    category_id: str,
    category_in: CategoryUpdate,
) -> Any:
    """Update a category."""
    category = crud.crud_category.get_category(db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.crud_category.update_category(db=db, db_category=category, category_update=category_in)

@router.delete("/{category_id}", response_model=CategoryResponse)
def delete_category(
    *,
    db: Session = Depends(get_db),
    category_id: str,
) -> Any:
    """Delete a category."""
    category = crud.crud_category.get_category(db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return crud.crud_category.remove_category(db=db, category_id=category_id)


# ---- SUBCATEGORY ROUTES ----

@router.get("/{category_id}/subcategories", response_model=List[SubcategoryResponse])
def get_subcategories(
    category_id: str,
    db: Session = Depends(get_db),
    active_only: bool = False,
) -> Any:
    """Retrieve subcategories for a given category."""
    return crud.crud_category.get_subcategories_by_category(db, category_id=category_id, active_only=active_only)

@router.post("/subcategories", response_model=SubcategoryResponse)
def create_subcategory(
    *,
    db: Session = Depends(get_db),
    subcategory_in: SubcategoryCreate,
) -> Any:
    """Create a new subcategory."""
    return crud.crud_category.create_subcategory(db=db, subcategory=subcategory_in)

@router.put("/subcategories/{subcategory_id}", response_model=SubcategoryResponse)
def update_subcategory(
    *,
    db: Session = Depends(get_db),
    subcategory_id: str,
    subcategory_in: SubcategoryUpdate,
) -> Any:
    """Update a subcategory."""
    subcategory = crud.crud_category.get_subcategory(db, subcategory_id=subcategory_id)
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    return crud.crud_category.update_subcategory(db=db, db_subcategory=subcategory, subupdate=subcategory_in)

@router.delete("/subcategories/{subcategory_id}", response_model=SubcategoryResponse)
def delete_subcategory(
    *,
    db: Session = Depends(get_db),
    subcategory_id: str,
) -> Any:
    """Delete a subcategory."""
    subcategory = crud.crud_category.get_subcategory(db, subcategory_id=subcategory_id)
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    return crud.crud_category.remove_subcategory(db=db, subcategory_id=subcategory_id)
