from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.schemas.search import GlobalSearchResponse

router = APIRouter()

@router.get("/", response_model=GlobalSearchResponse)
def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    db: Session = Depends(get_db)
):
    search_term = f"%{q.lower()}%"
    
    # Search pets
    pets_query = text("""
        SELECT id, name, species, breed 
        FROM pets 
        WHERE (LOWER(name) LIKE :q OR LOWER(species) LIKE :q OR LOWER(breed) LIKE :q)
        AND is_active = true
        LIMIT 3
    """)
    pets_result = db.execute(pets_query, {"q": search_term}).fetchall()
    
    # Search clinics
    clinics_query = text("""
        SELECT id, name, city, address
        FROM clinics
        WHERE LOWER(name) LIKE :q OR LOWER(city) LIKE :q OR LOWER(address) LIKE :q
        LIMIT 3
    """)
    clinics_result = db.execute(clinics_query, {"q": search_term}).fetchall()
    
    # Search products
    products_query = text("""
        SELECT id, name, price
        FROM products
        WHERE (LOWER(name) LIKE :q OR LOWER(category) LIKE :q)
        AND is_active = true
        LIMIT 3
    """)
    products_result = db.execute(products_query, {"q": search_term}).fetchall()
    
    return {
        "pets": [{"id": str(p.id), "name": p.name, "species": p.species, "breed": p.breed} for p in pets_result],
        "clinics": [{"id": str(c.id), "name": c.name, "city": c.city, "address": c.address} for c in clinics_result],
        "products": [{"id": str(pr.id), "name": pr.name, "price": pr.price} for pr in products_result]
    }
