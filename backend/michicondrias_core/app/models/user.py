from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), index=True)
    is_active = Column(Boolean, default=True)
    
    role_id = Column(String(36), ForeignKey("roles.id"))
    role = relationship("Role")

    # KYC Verification
    verification_status = Column(String(50), default="UNVERIFIED")  # UNVERIFIED, PENDING, VERIFIED, REJECTED
    id_front_url = Column(String(512), nullable=True)
    id_back_url = Column(String(512), nullable=True)
    proof_of_address_url = Column(String(512), nullable=True)
