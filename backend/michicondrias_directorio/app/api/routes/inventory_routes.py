from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List
from datetime import datetime, timedelta

from app.api import deps
from app.models.dashboard import InventoryItems
from app.models.clinic import Clinic

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_clinic_inventory(
    clinic_id: str,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    # Check permissions
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    items = db.query(InventoryItems).filter(InventoryItems.clinic_id == clinic_id).all()
    
    return [
        {
            "id": str(i.id),
            "name": i.name,
            "category": i.category,
            "unit": i.unit,
            "currentStock": i.current_stock,
            "minStock": i.min_stock,
            "maxStock": i.max_stock,
            "supplier": i.supplier,
            "isCritical": i.is_critical or (i.current_stock <= i.min_stock),
            "lastRestockedAt": i.last_restocked_at.isoformat() if i.last_restocked_at else None
        }
        for i in items
    ]

@router.get("/critical", response_model=List[dict])
def get_critical_inventory(
    clinic_id: str,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    # Items with stock <= min_stock or explicitly marked critical
    items = db.query(InventoryItems).filter(
        InventoryItems.clinic_id == clinic_id,
        (InventoryItems.current_stock <= InventoryItems.min_stock) | (InventoryItems.is_critical == True)
    ).all()
    
    return [
        {
            "id": str(i.id),
            "name": i.name,
            "currentStock": i.current_stock,
            "minStock": i.min_stock,
            "unit": i.unit
        }
        for i in items
    ]

@router.post("/")
def add_inventory_item(
    clinic_id: str,
    item_data: dict,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    new_item = InventoryItems(
        clinic_id=clinic_id,
        name=item_data.get("name"),
        description=item_data.get("description", ""),
        category=item_data.get("category", ""),
        unit=item_data.get("unit", "unit"),
        current_stock=item_data.get("currentStock", 0),
        min_stock=item_data.get("minStock", 0),
        max_stock=item_data.get("maxStock", 0),
        supplier=item_data.get("supplier", ""),
        cost_per_unit=item_data.get("costPerUnit", 0.0),
        is_medication=item_data.get("isMedication", False)
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return {"id": str(new_item.id), "message": "Item added successfully"}

@router.put("/{item_id}")
def update_inventory_item(
    clinic_id: str,
    item_id: str,
    item_data: dict,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    item = db.query(InventoryItems).filter(
        InventoryItems.id == item_id,
        InventoryItems.clinic_id == clinic_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    # Update fields
    if "currentStock" in item_data:
        item.current_stock = item_data["currentStock"]
    if "minStock" in item_data:
        item.min_stock = item_data["minStock"]
    if "lastRestockedAt" in item_data:
        item.last_restocked_at = datetime.utcnow()
        
    db.commit()
    return {"message": "Item updated successfully"}

@router.delete("/{item_id}")
def delete_inventory_item(
    clinic_id: str,
    item_id: str,
    db: Session = Depends(deps.get_db),
    user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    clinic = db.query(Clinic).filter(Clinic.id == clinic_id).first()
    if not clinic or clinic.owner_user_id != user_id:
        raise HTTPException(status_code=404, detail="Clinic not found or unauthorized")
        
    item = db.query(InventoryItems).filter(
        InventoryItems.id == item_id,
        InventoryItems.clinic_id == clinic_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(item)
    db.commit()
    return {"message": "Item deleted successfully"}
