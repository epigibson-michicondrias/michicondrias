from sqlalchemy import Column, String, Integer, Text, Boolean, Float, JSON
from app.models.base import BaseModel


class AdoptionListing(BaseModel):
    """
    A temporary adoption listing/ad. NOT a registered pet.
    When adoption completes, a real Pet is created in the system.
    """
    __tablename__ = "adoption_listings"

    # Animal info
    name = Column(String(100), nullable=False)
    species = Column(String(50), nullable=False)
    breed = Column(String(100))
    age_months = Column(Integer)
    size = Column(String(50))  # pequeño, mediano, grande
    description = Column(Text)
    photo_url = Column(Text)

    # Enrichment Fields
    is_vaccinated = Column(Boolean, default=False)
    is_sterilized = Column(Boolean, default=False)
    is_dewormed = Column(Boolean, default=False)
    temperament = Column(Text, nullable=True)
    energy_level = Column(String, nullable=True)
    social_cats = Column(Boolean, default=True)
    social_dogs = Column(Boolean, default=True)
    social_children = Column(Boolean, default=True)
    weight_kg = Column(Float, nullable=True)
    microchip_number = Column(String, nullable=True)

    # Who published it
    published_by = Column(String(36), index=True, nullable=False)

    # New Enrichment Fields
    gender = Column(String(20), nullable=True) # Macho/Hembra
    location = Column(String(100), nullable=True)
    is_emergency = Column(Boolean, default=False)
    gallery = Column(JSON, nullable=True) # Lista de URLs de fotos adicionales

    # Approval flow
    is_approved = Column(Boolean, default=False, index=True)

    # Adoption status: abierto -> en_proceso -> adoptado
    status = Column(String(50), default="abierto", index=True)

    # Once adopted, who adopted it
    adopted_by = Column(String(36), nullable=True)


class AdoptionRequest(BaseModel):
    """A request from a user to adopt an animal from a listing with a welfare questionnaire."""
    __tablename__ = "adoption_requests"

    listing_id = Column(String(36), index=True, nullable=False)
    user_id = Column(String(36), index=True, nullable=False)
    applicant_name = Column(String(255), nullable=True) # Nombre del solicitante
    status = Column(String(50), default="PENDING", index=True)  # PENDING, REVIEWING, INTERVIEW_SCHEDULED, APPROVED, ADOPTED, REJECTED
    
    # Questionnaire fields
    house_type = Column(String(100)) # Casa, Depto, etc.
    has_yard = Column(Boolean, default=False)
    own_or_rent = Column(String(50)) # Propio, Renta
    landlord_permission = Column(Boolean, default=True)
    other_pets = Column(Text) # Descripción de otras mascotas
    has_children = Column(Boolean, default=False)
    children_ages = Column(String(100))
    hours_alone = Column(Integer) # Horas que pasará sola la mascota
    financial_commitment = Column(Boolean, default=False) # Compromiso de gastos médicos/alimento
    reason = Column(Text) # Por qué quiere adoptar
    previous_experience = Column(Text) # Experiencia previa con mascotas
