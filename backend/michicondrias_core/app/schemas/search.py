from pydantic import BaseModel
from typing import List, Optional

class SearchPetResult(BaseModel):
    id: str
    name: str
    species: str
    breed: Optional[str] = None

class SearchClinicResult(BaseModel):
    id: str
    name: str
    city: Optional[str] = None
    address: Optional[str] = None

class SearchProductResult(BaseModel):
    id: str
    name: str
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None

class SearchAdoptionResult(BaseModel):
    id: str
    name: str
    species: str
    breed: Optional[str] = None
    location: Optional[str] = None

class SearchLostPetResult(BaseModel):
    """Sin datos de contacto: esos solo se ven en la ficha del reporte."""
    id: str
    name: Optional[str] = None
    species: str
    report_type: str  # lost | found
    last_seen_location: Optional[str] = None

class SearchServiceResult(BaseModel):
    id: str
    name: str
    kind: str  # walker | sitter
    location: Optional[str] = None

class GlobalSearchResponse(BaseModel):
    pets: List[SearchPetResult]
    clinics: List[SearchClinicResult]
    products: List[SearchProductResult]
    # F25 (aditivo): más dominios públicos
    adoptions: List[SearchAdoptionResult] = []
    lost_pets: List[SearchLostPetResult] = []
    services: List[SearchServiceResult] = []
