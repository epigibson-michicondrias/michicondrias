from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api import deps
from app.db.session import get_db
from app.schemas.search import GlobalSearchResponse

router = APIRouter()

RESULTS_PER_TYPE = 5

@router.get("/", response_model=GlobalSearchResponse)
def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    db: Session = Depends(get_db),
    user_id: str = Depends(deps.get_current_user_id),
):
    # Se escapan los comodines de LIKE para que "%" o "_" escritos por el usuario se busquen literalmente
    escaped = q.lower().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    search_term = f"%{escaped}%"
    
    # Search pets
    pets_query = text("""
        SELECT id, name, species, breed 
        FROM pets 
        WHERE (LOWER(name) LIKE :q ESCAPE '\\' OR LOWER(species) LIKE :q ESCAPE '\\' OR LOWER(breed) LIKE :q ESCAPE '\\')
        AND is_active = true
        AND owner_id = :uid
        ORDER BY name
        LIMIT :lim
    """)
    # Solo las mascotas del propio usuario: no se exponen las de otras personas
    pets_result = db.execute(pets_query, {"q": search_term, "uid": user_id, "lim": RESULTS_PER_TYPE}).fetchall()
    
    # Search clinics (solo las aprobadas por un admin, como en el directorio público)
    clinics_query = text("""
        SELECT id, name, city, address
        FROM clinics
        WHERE (LOWER(name) LIKE :q ESCAPE '\\' OR LOWER(city) LIKE :q ESCAPE '\\' OR LOWER(address) LIKE :q ESCAPE '\\')
        AND is_approved IS TRUE
        ORDER BY name
        LIMIT :lim
    """)
    clinics_result = db.execute(clinics_query, {"q": search_term, "lim": RESULTS_PER_TYPE}).fetchall()
    
    # Search products (activos y aprobados; la categoría vive en la tabla categories)
    products_query = text("""
        SELECT p.id, p.name, p.price, p.image_url, c.name AS category
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE (LOWER(p.name) LIKE :q ESCAPE '\\' OR LOWER(COALESCE(c.name, '')) LIKE :q ESCAPE '\\')
        AND p.is_active IS TRUE
        AND p.is_approved IS TRUE
        ORDER BY p.name
        LIMIT :lim
    """)
    products_result = db.execute(products_query, {"q": search_term, "lim": RESULTS_PER_TYPE}).fetchall()
    
    # F25: adopciones abiertas y aprobadas (como el listado público)
    adoptions_result = db.execute(text("""
        SELECT id, name, species, breed, location
        FROM adoption_listings
        WHERE (LOWER(name) LIKE :q ESCAPE '\\' OR LOWER(species) LIKE :q ESCAPE '\\'
               OR LOWER(COALESCE(breed, '')) LIKE :q ESCAPE '\\' OR LOWER(COALESCE(location, '')) LIKE :q ESCAPE '\\')
        AND is_approved IS TRUE AND status = 'abierto'
        ORDER BY created_at DESC
        LIMIT :lim
    """), {"q": search_term, "lim": RESULTS_PER_TYPE}).fetchall()

    # Reportes de perdidas/encontradas activos (sin teléfono ni correo)
    lost_result = db.execute(text("""
        SELECT id, pet_name, species, report_type, last_seen_location
        FROM lost_pet_reports
        WHERE (LOWER(COALESCE(pet_name, '')) LIKE :q ESCAPE '\\' OR LOWER(species) LIKE :q ESCAPE '\\'
               OR LOWER(COALESCE(breed, '')) LIKE :q ESCAPE '\\' OR LOWER(COALESCE(last_seen_location, '')) LIKE :q ESCAPE '\\')
        AND status = 'active'
        ORDER BY created_at DESC
        LIMIT :lim
    """), {"q": search_term, "lim": RESULTS_PER_TYPE}).fetchall()

    # Servicios: paseadores y cuidadores activos (por nombre o zona)
    services_result = db.execute(text("""
        SELECT * FROM (
            SELECT id, display_name AS name, 'walker' AS kind, location FROM walkers
            WHERE is_active IS TRUE
            AND (LOWER(display_name) LIKE :q ESCAPE '\\' OR LOWER(COALESCE(location, '')) LIKE :q ESCAPE '\\')
            UNION ALL
            SELECT id, display_name AS name, 'sitter' AS kind, location FROM sitters
            WHERE is_active IS TRUE
            AND (LOWER(display_name) LIKE :q ESCAPE '\\' OR LOWER(COALESCE(location, '')) LIKE :q ESCAPE '\\')
        ) s
        ORDER BY name
        LIMIT :lim
    """), {"q": search_term, "lim": RESULTS_PER_TYPE}).fetchall()

    return {
        "adoptions": [
            {"id": str(a.id), "name": a.name, "species": a.species, "breed": a.breed, "location": a.location}
            for a in adoptions_result
        ],
        "lost_pets": [
            {"id": str(l.id), "name": l.pet_name, "species": l.species, "report_type": l.report_type,
             "last_seen_location": l.last_seen_location}
            for l in lost_result
        ],
        "services": [{"id": str(sv.id), "name": sv.name, "kind": sv.kind, "location": sv.location} for sv in services_result],
        "pets": [{"id": str(p.id), "name": p.name, "species": p.species, "breed": p.breed} for p in pets_result],
        "clinics": [{"id": str(c.id), "name": c.name, "city": c.city, "address": c.address} for c in clinics_result],
        "products": [
            {"id": str(pr.id), "name": pr.name, "price": pr.price, "category": pr.category, "image_url": pr.image_url}
            for pr in products_result
        ]
    }
