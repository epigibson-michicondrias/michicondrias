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

class GlobalSearchResponse(BaseModel):
    pets: List[SearchPetResult]
    clinics: List[SearchClinicResult]
    products: List[SearchProductResult]
